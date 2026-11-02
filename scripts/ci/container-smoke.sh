#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/../.."
repository=$(pwd)
[[ ${CI:-} == true ]] || { echo 'Run this disposable topology in CI only.' >&2; exit 1; }
export XFOOD_REAL_TEST_DATABASE="XFood_WebTests_$(openssl rand -hex 16)"
export XFOOD_CI_SQL_PASSWORD="$(openssl rand -hex 24)Aa9!"
export XFOOD_REAL_WEB_URL=https://localhost:3443
project="xfood-ci-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}"
compose=(docker compose -p "$project" -f "$repository/deploy/compose.smoke.yml")
mkdir -p .artifacts
cleanup() {
  result=$?
  trap - EXIT
  "${compose[@]}" logs --no-color > "$repository/.artifacts/container-logs.txt" 2>&1 || true
  # This project has no external resources. Remove only this run's containers and temporary volumes.
  "${compose[@]}" down --volumes --remove-orphans || true
  exit "$result"
}
trap cleanup EXIT
revision=$(git rev-parse HEAD)
source_url="${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-EnmanuelD22/XFood}"
docker buildx build --load -f deploy/api.Dockerfile --target runtime --label "org.opencontainers.image.revision=$revision" --label "org.opencontainers.image.source=$source_url" -t xfood-api:ci .
docker buildx build --load -f deploy/api.Dockerfile --target migrate -t xfood-migrate:ci .
docker buildx build --load -f deploy/web.Dockerfile --label "org.opencontainers.image.revision=$revision" --label "org.opencontainers.image.source=$source_url" -t xfood-web:ci .
"${compose[@]}" up -d --wait sqlserver
"${compose[@]}" run --rm migrate
"${compose[@]}" up -d api web gateway
curl --insecure --fail --retry 40 --retry-all-errors --retry-delay 3 --max-time 5 "$XFOOD_REAL_WEB_URL/health/ready"
curl --insecure --fail --retry 20 --retry-all-errors --retry-delay 3 --max-time 5 "$XFOOD_REAL_WEB_URL/" > /dev/null
cd web
npx playwright test --config playwright.real.config.ts
