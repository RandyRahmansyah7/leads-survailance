#!/usr/bin/env bash
set -u

cd "$(git rev-parse --show-toplevel)"
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
        and ([.statusCheckRollup[] | select((.state == "SUCCESS") or (.state == "SKIPPED") or (.state == "NEUTRAL"))] | length) == (.statusCheckRollup | length))]
        | .[].number'
  )"

  if [ -z "$candidates" ]; then
    echo "Pass $pass: no mergeable candidates"
    break
  fi

  merged_this_pass=0
  for num in $candidates; do
    echo "Pass $pass: merging PR #$num"
    if flock "$LOCKFILE" gh pr merge "$num" --squash --delete-branch; then
      echo "  merged PR #$num"
      merged_this_pass=$((merged_this_pass + 1))
      total_merged=$((total_merged + 1))

      wt_path="$(
        git worktree list --porcelain | awk -v want="-$num" '
          /^worktree / { p = $2; next }
          /^branch / { if (index($2, want) == length($2) - length(want) + 1 && index(p, ".worktrees/") > 0) print p }
        ' | head -n 1
      )"
      if [ -n "$wt_path" ]; then
        git worktree remove --force "$wt_path" 2>/dev/null || true
        echo "  removed worktree $wt_path"
      fi
      git worktree prune 2>/dev/null || true
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
