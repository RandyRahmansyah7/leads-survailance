#!/usr/bin/env bash
set -u

cd "$(git rev-parse --show-toplevel)" || exit
mkdir -p logs

LOCKFILE="logs/.merge.lock"
touch "$LOCKFILE"

total_merged=0

pass=1
while [ "$pass" -le 10 ]; do
  candidates="$(
    gh pr list --state open --limit 50 \
      --json number,isDraft,labels,statusCheckRollup \
      --jq '[.[] | select((.isDraft | not)
        and ((.labels | map(.name) | index("no-merge")) | not)
        and ((.statusCheckRollup | length) > 0)
        and ([.statusCheckRollup[] | select(((.state // .conclusion) == "SUCCESS") or ((.state // .conclusion) == "SKIPPED") or ((.state // .conclusion) == "NEUTRAL"))] | length) == (.statusCheckRollup | length))]
        | .[].number'
  )"

  if [ -z "$candidates" ]; then
    echo "Pass $pass: no mergeable candidates"
    break
  fi

  merged_this_pass=0
  for num in $candidates; do
    echo "Pass $pass: merging PR #$num"
    merge_ok=0
    if flock "$LOCKFILE" gh pr merge "$num" --squash >/dev/null 2>&1; then
      merge_ok=1
    else
      # gh can exit non-zero on cleanup hiccups after a successful server-side merge;
      # trust the PR state, not the exit code.
      state="$(gh pr view "$num" --json state --jq '.state' 2>/dev/null || true)"
      if [ "$state" = "MERGED" ]; then
        merge_ok=1
      fi
    fi

    if [ "$merge_ok" -eq 1 ]; then
      echo "  merged PR #$num"
      merged_this_pass=$((merged_this_pass + 1))
      total_merged=$((total_merged + 1))

      wt_path="$(
        git worktree list --porcelain | awk -v want="-$num" '
          /^worktree / { if (index($2, ".worktrees/") > 0 && index($2, want) == length($2) - length(want) + 1) print $2 }
        ' | head -n 1
      )"
      if [ -n "$wt_path" ]; then
        git worktree remove --force "$wt_path" 2>/dev/null || true
        echo "  removed worktree $wt_path"
      fi
      git worktree prune 2>/dev/null || true

      git branch --format='%(refname:short)' | grep -E "^(feat|fix)/${num}-" | while IFS= read -r stale; do
        git branch -D "$stale" >/dev/null 2>&1 || true
      done

      head_ref="$(gh pr view "$num" --json headRefName --jq '.headRefName' 2>/dev/null || true)"
      if [ -n "$head_ref" ]; then
        git push origin --delete "$head_ref" >/dev/null 2>&1 || true
      fi
    else
      echo "  FAILED to merge PR #$num (tolerated)"
    fi
  done

  echo "Pass $pass: merged $merged_this_pass"
  if [ "$merged_this_pass" -eq 0 ]; then
    break
  fi
  pass=$((pass + 1))
done

echo "Merge summary: merged: $total_merged"
exit 0
