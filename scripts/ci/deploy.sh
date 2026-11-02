#!/usr/bin/env bash
set -Eeuo pipefail
# Runs on the prepared Linux host. No database migration or deletion is performed here.
target=${1:-}
release=${2:-}
[[ $target == staging || $target == production ]] || { echo 'Invalid environment.' >&2; exit 1; }
[[ $release =~ ^[a-f0-9]{40}-[0-9]+-[0-9]+$ ]] || { echo 'Invalid release identifier.' >&2; exit 1; }
root="/opt/xfood/$target"
directory="$root/releases/$release"
[[ -r $root/environment.env && -d $directory ]] || { echo 'Prepare the server environment first.' >&2; exit 1; }
exec 9>"$root/deployment.lock"
flock -n 9 || { echo 'Another deployment holds this environment lock.' >&2; exit 1; }
cd "$directory"
sha256sum --check SHA256SUMS
[[ $(cat commit.txt) == "${release:0:40}" ]] || exit 1
for image_var in XFOOD_API_IMAGE XFOOD_WEB_IMAGE; do
  value=$(sed -n "s/^$image_var=//p" images.env)
  [[ $value =~ ^ghcr\.io/[a-z0-9._/-]+@sha256:[a-f0-9]{64}$ ]] || { echo 'Images must use GHCR digests.' >&2; exit 1; }
done
domain=$(sed -n 's/^XFOOD_DOMAIN=//p' "$root/environment.env")
[[ $domain =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$ ]] || { echo 'Set a public DNS domain without a scheme or path.' >&2; exit 1; }
compose=(docker compose --project-name "xfood-$target" --env-file "$root/environment.env" --env-file "$directory/images.env" -f "$directory/compose.yml")
"${compose[@]}" config --quiet
# Pull everything before changing the running application. Registry read credentials stay on the host.
"${compose[@]}" pull
"${compose[@]}" up -d --remove-orphans
if ! curl --fail --silent --show-error --retry 30 --retry-all-errors --retry-delay 3 --max-time 5 "https://$domain/health/ready"; then
  echo 'Readiness failed. Inspect SQL connectivity/migrations and container logs; application containers may have changed.' >&2
  echo 'No schema rollback or automatic application rollback was attempted.' >&2
  exit 1
fi
curl --fail --silent --show-error --max-time 20 "https://$domain/api/v1/categories" > /dev/null
curl --fail --silent --show-error --max-time 20 "https://$domain/" > /dev/null
ln -sfn "$directory" "$root/current"
echo "Deployment verified: $target $release"
