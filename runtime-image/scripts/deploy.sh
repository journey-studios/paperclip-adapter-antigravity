#!/usr/bin/env bash
set -euo pipefail

TAG="${1:-paperclip:agy-cursor-cost-v1}"
ROOT="/opt/paperclip"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DIR="$ROOT/backup/snapshots/$STAMP-cursor-cost"
ROLLBACK_TAG="paperclip:agy-rollback-$STAMP"
LOCK_FILE="/var/lock/paperclip-deploy.lock"
STABLE_TAG="paperclip:agy"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "Another Paperclip deploy is already running." >&2
  exit 1
fi

docker image inspect "$TAG" >/dev/null

# Verify the exact candidate before creating backups or mutating deployment state.
"$SCRIPT_DIR/verify.sh" "$TAG"

mkdir -p "$BACKUP_DIR"
docker exec paperclip-postgres pg_dump -U paperclip -d paperclip -Fc > "$BACKUP_DIR/paperclip.dump"
cp "$ROOT/docker-compose.yml" "$BACKUP_DIR/docker-compose.yml"

OLD_IMAGE_ID="$(docker image inspect "$STABLE_TAG" --format '{{.Id}}')"
CANDIDATE_IMAGE_ID="$(docker image inspect "$TAG" --format '{{.Id}}')"
docker tag "$OLD_IMAGE_ID" "$ROLLBACK_TAG"

# Compose must always reference the stable Journey tag. This makes rollback and
# subsequent deploys deterministic even after a previous manual recovery.
python3 - "$ROOT/docker-compose.yml" <<'PY'
from pathlib import Path
import re
import sys

p = Path(sys.argv[1])
s = p.read_text()
pattern = r'(?ms)(^  paperclip:\n(?:.*\n)*?^    image: )[^
]+'
updated, count = re.subn(pattern, r'\1paperclip:agy', s, count=1)
if count != 1:
    raise SystemExit("Could not normalize Paperclip service image to paperclip:agy")
p.write_text(updated)
PY

promoted=0
completed=0

rollback() {
  local reason="${1:-deploy failure}"
  if [ "$promoted" -eq 1 ] && [ "$completed" -eq 0 ]; then
    echo "Rolling back Paperclip after: $reason" >&2
    docker tag "$OLD_IMAGE_ID" "$STABLE_TAG"
    (
      cd "$ROOT"
      docker compose up -d --force-recreate paperclip
    ) || true
  fi
}

on_exit() {
  local status=$?
  if [ "$status" -ne 0 ]; then
    rollback "exit status $status"
  fi
  exit "$status"
}
trap on_exit EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

docker tag "$CANDIDATE_IMAGE_ID" "$STABLE_TAG"
promoted=1

cd "$ROOT"
docker compose up -d --force-recreate paperclip

ready=0
for attempt in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3100/api/health >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done

if [ "$ready" -ne 1 ]; then
  echo "Paperclip did not become ready." >&2
  docker logs --tail 100 paperclip-app >&2 || true
  exit 1
fi

RUNNING_IMAGE_ID="$(docker inspect paperclip-app --format '{{.Image}}')"
if [ "$RUNNING_IMAGE_ID" != "$CANDIDATE_IMAGE_ID" ]; then
  echo "Deployment health check passed, but the running container is not the candidate image." >&2
  echo "expected=$CANDIDATE_IMAGE_ID actual=$RUNNING_IMAGE_ID" >&2
  exit 1
fi

completed=1
trap - EXIT INT TERM

docker ps --filter name=paperclip-app --format '{{.Names}} {{.Image}} {{.Status}}'
echo "backup=$BACKUP_DIR"
echo "rollback=$ROLLBACK_TAG"
echo "candidate_image=$CANDIDATE_IMAGE_ID"
