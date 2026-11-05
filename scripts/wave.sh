#!/usr/bin/env bash
set -u

cd "$(git rev-parse --show-toplevel)"
mkdir -p logs .worktrees

MAX_WAVES="${MAX_WAVES:-5}"
MAX_PARALLEL="${MAX_PARALLEL:-3}"
PLANNING="${PLANNING:-1}"
DRY_RUN="${DRY_RUN:-0}"
MILESTONE="${MILESTONE:-}"
NO_MERGE="${NO_MERGE:-0}"

count_agent_issues() {
  gh issue list --state open --limit 100 --json labels ${MILESTONE:+--milestone "$MILESTONE"} \
    --jq '[.[] | select((.labels | map(.name)) as $l | ($l | index("agent:kilo")) or ($l | index("agent:opencode")) or ($l | index("agent:qoder")))] | length'
}

count_open_prs() {
  gh pr list --state open --limit 100 --json number --jq 'length'
}

if [ "$DRY_RUN" = "1" ]; then
  echo "Queue counts:"
  echo "  kilo     (agent:kilo): $(gh issue list --state open --limit 100 --json labels ${MILESTONE:+--milestone "$MILESTONE"} --jq '[.[] | select(.labels | map(.name) | index("agent:kilo"))] | length')"
  echo "  opencode (agent:opencode + role:build): $(gh issue list --state open --limit 100 --json labels ${MILESTONE:+--milestone "$MILESTONE"} --jq '[.[] | select(.labels | map(.name) as $l | ($l | index("agent:opencode")) and ($l | index("role:build")))] | length')"
  echo "  qoder    (agent:qoder): $(gh issue list --state open --limit 100 --json labels ${MILESTONE:+--milestone "$MILESTONE"} --jq '[.[] | select(.labels | map(.name) | index("agent:qoder"))] | length')"
  echo "Open PRs: $(count_open_prs)"
  echo "DRY RUN — no actions"
  exit 0
fi

w=1
while [ "$w" -le "$MAX_WAVES" ]; do
  echo "=== Wave $w / $MAX_WAVES ==="

  if [ "$PLANNING" = "1" ] && [ "$(count_agent_issues)" -eq 0 ] && [ "$(count_open_prs)" -eq 0 ]; then
    if command -v kilo >/dev/null 2>&1; then
      echo "Queue empty — running planner"
      kilo run --auto "$(cat scripts/prompts/plan.md)" 2>&1 | tee "logs/wave-$w-plan.log" || true
    else
      echo "WARN: kilo binary not found; skipping planning" >&2
    fi
  fi

  if [ "$(count_agent_issues)" -eq 0 ] && [ "$(count_open_prs)" -eq 0 ]; then
    echo "Queue empty — selesai."
    break
  fi

  pids=()
  agents=()

  if [ "$MAX_PARALLEL" = "1" ]; then
    agents=(kilo opencode qoder)
  elif [ "$MAX_PARALLEL" = "2" ]; then
    agents=(kilo opencode qoder)
  else
    agents=(kilo opencode qoder)
  fi

  invoke_agent() {
    local agent="$1"
    case "$agent" in
      kilo)
        command -v kilo >/dev/null 2>&1 || { echo "SKIP kilo: binary not found" >&2; return 0; }
        bash scripts/agent-runner.sh kilo 2>&1 | tee "logs/wave-$w-kilo.log" &
        ;;
      opencode)
        command -v opencode >/dev/null 2>&1 || { echo "SKIP opencode: binary not found" >&2; return 0; }
        bash scripts/agent-runner.sh opencode 2>&1 | tee "logs/wave-$w-opencode.log" &
        ;;
      qoder)
        command -v "${QODER_BIN:-qodercli}" >/dev/null 2>&1 || { echo "SKIP qoder: binary not found" >&2; return 0; }
        bash scripts/agent-runner.sh qoder 2>&1 | tee "logs/wave-$w-qoder.log" &
        ;;
    esac
    pids+=($!)
  }

  if [ "$MAX_PARALLEL" = "1" ]; then
    for a in "${agents[@]}"; do
      invoke_agent "$a"
      wait
    done
  elif [ "$MAX_PARALLEL" = "2" ]; then
    invoke_agent kilo
    invoke_agent opencode
    wait
    invoke_agent qoder
    wait
  else
    invoke_agent kilo
    invoke_agent opencode
    invoke_agent qoder
    wait
  fi
  echo "Wave $w: agent runners finished"

  if [ "$NO_MERGE" != "1" ] && [ -f scripts/merge-green.sh ]; then
    bash scripts/merge-green.sh 2>&1 | tee "logs/wave-$w-merge.log" || true
  fi

  echo "Wave $w summary: open issues=$(count_agent_issues), open PRs=$(count_open_prs)"
  w=$((w + 1))
done

echo "=== Remaining ==="
gh issue list --state open --limit 20
echo "---"
gh pr list --state open --limit 20
exit 0
