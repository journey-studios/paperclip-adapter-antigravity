#!/usr/bin/env bash
set -euo pipefail

TAG="${1:-paperclip:agy-cursor-cost-v1}"
ROOT="/opt/paperclip"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DIR="$ROOT/backup/snapshots/$STAMP-cursor-cost"
ROLLBACK_TAG="paperclip:agy-rollback-$STAMP"

docker image inspect "$TAG" >/dev/null
mkdir -p "$BACKUP_DIR"

# Database + deployment manifest rollback points.
docker exec paperclip-postgres pg_dump -U paperclip -d paperclip -Fc > "$BACKUP_DIR/paperclip.dump"
cp "$ROOT/docker-compose.yml" "$BACKUP_DIR/docker-compose.yml"
docker tag paperclip:agy "$ROLLBACK_TAG"

# Keep Compose pinned to the stable Journey tag. Only move the local image tag
# after the candidate has passed build/verify.
docker tag "$TAG" paperclip:agy

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
  echo "rollback=$ROLLBACK_TAG" >&2
  docker logs --tail 100 paperclip-app >&2 || true
  exit 1
fi

docker ps --filter name=paperclip-app --format '{{.Names}} {{.Image}} {{.Status}}'
echo "backup=$BACKUP_DIR"
echo "rollback=$ROLLBACK_TAG"
