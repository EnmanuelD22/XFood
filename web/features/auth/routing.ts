import type { Account } from "./types";

export const LOGIN_PATH = "/login";
export const ACCESS_DENIED_PATH = "/acceso-denegado";

const HOME_BY_ROLE: Record<string, string> = {
  Establishment: "/panel",
  Consumer: "/buscar",
  Organization: "/organizacion",
};

/** Sections restricted to one role; public routes are not listed. */
const ROLE_SECTIONS: Array<{ prefix: string; role: string }> = [
  { prefix: "/panel", role: "Establishment" },
  { prefix: "/organizacion", role: "Organization" },
];

export function homePathFor(account: Pick<Account, "role">) {
  return HOME_BY_ROLE[account.role] ?? ACCESS_DENIED_PATH;
}

export function requiredRoleFor(path: string) {
  return ROLE_SECTIONS.find(({ prefix }) => path === prefix || path.startsWith(`${prefix}/`))?.role;
}

/** Only same-site relative paths are accepted, so `?next=` cannot redirect to another origin. */
export function isSafeInternalPath(path: string | null | undefined): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\"));
}

/** Where to go after login: the requested page when the role may open it, otherwise the role's home. */
export function postLoginPath(account: Pick<Account, "role">, next: string | null | undefined) {
  if (!isSafeInternalPath(next) || next.startsWith(LOGIN_PATH) || next.startsWith("/registro")) return homePathFor(account);
  const required = requiredRoleFor(next.split(/[?#]/)[0]);
  return !required || required === account.role ? next : homePathFor(account);
}

export function loginPathFor(next: string) {
  return `${LOGIN_PATH}?next=${encodeURIComponent(next)}`;
}
