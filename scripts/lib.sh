#!/usr/bin/env bash

repo_root() {
  git rev-parse --show-toplevel
}

have() {
  command -v "$1" >/dev/null 2>&1
}

log() {
  printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*" >&2
}

slugify() {
  local s
  s="$(printf '%s' "$*" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
  printf '%s\n' "${s:0:40}"
}

agent_binary() {
  case "$1" in
    kilo) printf 'kilo\n' ;;
    opencode) printf 'opencode\n' ;;
    qoder) printf '%s\n' "${QODER_BIN:-qodercli}" ;;
    *) return 1 ;;
  esac
}
