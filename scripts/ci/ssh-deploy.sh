#!/usr/bin/env bash
set -Eeuo pipefail
[[ ${SSH_HOST:-} =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || { echo 'Invalid DEPLOY_SSH_HOST.' >&2; exit 1; }
[[ ${SSH_USER:-} =~ ^[a-z_][a-z0-9_-]*$ ]] || { echo 'Invalid DEPLOY_SSH_USER.' >&2; exit 1; }
[[ ${SSH_PORT:-} =~ ^[0-9]{1,5}$ ]] && (( 10#$SSH_PORT >= 1 && 10#$SSH_PORT <= 65535 )) || exit 1
[[ ${TARGET:-} == staging || ${TARGET:-} == production ]] || exit 1
[[ ${GITHUB_SHA:-} =~ ^[a-f0-9]{40}$ && ${GITHUB_RUN_ID:-} =~ ^[0-9]+$ && ${GITHUB_RUN_ATTEMPT:-} =~ ^[0-9]+$ ]] || exit 1
[[ -n ${SSH_KEY:-} && -n ${SSH_KNOWN_HOSTS:-} ]] || { echo 'Configure both SSH environment secrets.' >&2; exit 1; }
ssh_dir=$(mktemp -d)
trap 'rm -f "$ssh_dir/key" "$ssh_dir/known_hosts"; rmdir "$ssh_dir"' EXIT
umask 077
printf '%s\n' "$SSH_KEY" > "$ssh_dir/key"
printf '%s\n' "$SSH_KNOWN_HOSTS" > "$ssh_dir/known_hosts"
unset SSH_KEY SSH_KNOWN_HOSTS
ssh_options=(-i "$ssh_dir/key" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$ssh_dir/known_hosts")
release="$GITHUB_SHA-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT"
destination="/opt/xfood/$TARGET/releases/$release"
remote="$SSH_USER@$SSH_HOST"
ssh "${ssh_options[@]}" -p "$SSH_PORT" "$remote" "umask 077; mkdir -p '$destination'"
scp "${ssh_options[@]}" -P "$SSH_PORT" .artifacts/release/* "$remote:$destination/"
ssh "${ssh_options[@]}" -p "$SSH_PORT" "$remote" "bash '$destination/deploy.sh' '$TARGET' '$release'"
