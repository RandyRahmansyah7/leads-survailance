#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/lib.sh"

usage() {
  printf 'Usage: bash scripts/agent-runner.sh <kilo|opencode|qoder>\n' >&2
}

agent="${1:-}"
case "$agent" in
  kilo|opencode|qoder) ;;
  *)
    usage
    exit 1
    ;;
esac

AGENT_MAX_ISSUES="${AGENT_MAX_ISSUES:-3}"
CHECKS_TIMEOUT="${CHECKS_TIMEOUT:-900}"
FIX_RETRIES="${FIX_RETRIES:-1}"
BASE_BRANCH="${BASE_BRANCH:-main}"
MILESTONE="${MILESTONE:-}"

cd "$(repo_root)"
mkdir -p logs .worktrees

bin="$(agent_binary "$agent")"
if ! have "$bin"; then
  log "binary missing; skipping"
  exit 0
fi

has_open_pr_for() {
  local n="$1" bodies
  bodies="$(gh pr list --state open --json body --jq '.[].body' 2>/dev/null)" || true
  grep -q "Closes #$n" <<< "$bodies"
}

list_issues() {
  local jq_expr="$1"
  local args=(issue list --state open --json 'number,title,labels' --limit 50 --jq "$jq_expr")
  if [ -n "$MILESTONE" ]; then
    args+=(--milestone "$MILESTONE")
  fi
  gh "${args[@]}" 2>/dev/null || true
}

declare -a queue=()
declare -A seen=()

add_queue_lines() {
  local lines="$1" num title labels
  [ -n "$lines" ] || return 0
  while IFS=$'\t' read -r num title labels; do
    [ -n "$num" ] || continue
    [ -z "${seen[$num]:-}" ] || continue
    if has_open_pr_for "$num"; then
      continue
    fi
    seen[$num]=1
    queue+=("$num"$'\t'"$title"$'\t'"$labels")
  done <<< "$lines"
}

filter_kilo='.[] | select(any(.labels[]; .name == "agent:kilo")) | "\(.number)\t\(.title)\t\([.labels[].name] | join(","))"'
filter_opencode='.[] | select((any(.labels[]; .name == "agent:opencode")) and (any(.labels[]; .name == "role:build"))) | "\(.number)\t\(.title)\t\([.labels[].name] | join(","))"'
filter_qoder_debug='.[] | select((any(.labels[]; .name == "agent:qoder")) and (any(.labels[]; .name == "role:debug"))) | "\(.number)\t\(.title)\t\([.labels[].name] | join(","))"'
filter_qoder_all='.[] | select(any(.labels[]; .name == "agent:qoder")) | "\(.number)\t\(.title)\t\([.labels[].name] | join(","))"'

case "$agent" in
  kilo)
    add_queue_lines "$(list_issues "$filter_kilo")"
    ;;
  opencode)
    add_queue_lines "$(list_issues "$filter_opencode")"
    ;;
  qoder)
    add_queue_lines "$(list_issues "$filter_qoder_debug")"
    add_queue_lines "$(list_issues "$filter_qoder_all")"
    ;;
esac

declare -a summaries=()
processed=0

if [ "${#queue[@]}" -gt 0 ]; then
  for entry in "${queue[@]}"; do
    if [ "$processed" -ge "$AGENT_MAX_ISSUES" ]; then
      break
    fi
    processed=$((processed + 1))

    IFS=$'\t' read -r num title labels <<< "$entry"

    wt=".worktrees/$agent-$num"
    if [ -e "$wt" ]; then
      summaries+=("skip #$num worktree-exists")
      continue
    fi

    git fetch origin "$BASE_BRANCH" --quiet

    is_debug=0
    case ",$labels," in
      *,bug,*|*,role:debug,*) is_debug=1 ;;
    esac

    if [ "$is_debug" -eq 1 ]; then
      btype="fix"
      template="scripts/prompts/debug.md"
    else
      btype="feat"
      template="scripts/prompts/build.md"
    fi

    slug="$(slugify "$title")"
    branch="$btype/$num-$slug"

    if ! git worktree add -b "$branch" "$wt" "origin/$BASE_BRANCH" >/dev/null 2>&1; then
      # A previous failed run may have left a stale, empty branch behind; clear it and retry once.
      if git show-ref --verify --quiet "refs/heads/$branch" \
        && [ -z "$(git log "origin/$BASE_BRANCH..$branch" --oneline 2>/dev/null)" ]; then
        git branch -D "$branch" >/dev/null 2>&1 || true
      fi
      if ! git worktree add -b "$branch" "$wt" "origin/$BASE_BRANCH" >/dev/null 2>&1; then
        summaries+=("fail #$num worktree-add-failed")
        continue
      fi
    fi

    root="$(repo_root)"
    if [[ -d "$root/node_modules" && ! -e "$wt/node_modules" ]]; then
      ln -s "$root/node_modules" "$wt/node_modules"
    fi

    gh issue view "$num" --json title,body --jq '.title + "\n\n" + .body' > "/tmp/leads-task-$num.md"

    sed -e "s/{{AGENT}}/$agent/g" -e "s/{{ISSUE}}/$num/g" "$template" > "/tmp/leads-prompt-$num.md"
    PROMPT="$(cat "/tmp/leads-prompt-$num.md")"

    case "$agent" in
      qoder)
        run_args=(-p --permission-mode auto --max-turns 60 "$PROMPT")
        ;;
      *)
        run_args=(run --auto "$PROMPT")
        ;;
    esac

    ( cd "$wt" && "$bin" "${run_args[@]}" ) 2>&1 | tee "logs/$agent-$num-$(date +%s).log" || true

    if [ -z "$(git -C "$wt" log "origin/$BASE_BRANCH..HEAD" --oneline)" ]; then
      summaries+=("fail #$num no-commits")
      continue
    fi

    if ! git -C "$wt" push -u origin "$branch" --quiet; then
      summaries+=("fail #$num push-failed")
      continue
    fi

    if ! has_open_pr_for "$num"; then
      gh pr create --base "$BASE_BRANCH" --head "$branch" --title "$title (#$num)" --body "Closes #$num

Agent: $agent" || true
    fi

    summary="ok #$num"

    if [ "$FIX_RETRIES" -gt 0 ]; then
      timeout "$CHECKS_TIMEOUT" gh pr checks "$num" --watch || true

      checks_out="$(gh pr checks "$num" 2>/dev/null)" || true
      if grep -q "fail" <<< "$checks_out"; then
        debug_prompt="$(sed -e "s/{{AGENT}}/$agent/g" -e "s/{{ISSUE}}/$num/g" scripts/prompts/debug.md)"
        fix_suffix="CI checks are failing. Inspect with \`gh pr checks $num\` and \`gh run view --log-failed\`, fix, commit, push to the same branch."
        fix_prompt="$debug_prompt"$'\n\n'"$fix_suffix"

        case "$agent" in
          qoder)
            fix_args=(-p --permission-mode auto --max-turns 60 "$fix_prompt")
            ;;
          *)
            fix_args=(run --auto "$fix_prompt")
            ;;
        esac

        ( cd "$wt" && "$bin" "${fix_args[@]}" ) 2>&1 | tee "logs/$agent-$num-fix-$(date +%s).log" || true
        git -C "$wt" push -u origin "$branch" --quiet || true
        summary="ok #$num fixed-after-ci"
      fi
    fi

    summaries+=("$summary")
  done
fi

if [ "${#summaries[@]}" -gt 0 ]; then
  printf '%s\n' "${summaries[@]}"
fi

exit 0
