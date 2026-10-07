#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TAG="${1:-paperclip:agy-cursor-cost-v1}"
docker build --pull=false -t "$TAG" "$ROOT"
docker image inspect "$TAG" --format 'built={{.Id}} base_commit={{index .Config.Labels "com.journeystudios.paperclip.base.commit"}} overlay={{index .Config.Labels "com.journeystudios.paperclip.overlay"}}'
