import type { Account } from "./types";

export const LOGIN_PATH = "/login";
export const ACCESS_DENIED_PATH = "/acceso-denegado";
export const SIGNED_OUT_PATH = `${LOGIN_PATH}?sesion=cerrada`;

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
  const pathname = parseInternalPath(path)?.pathname;
  return ROLE_SECTIONS.find(({ prefix }) => pathname === prefix || pathname?.startsWith(`${prefix}/`))?.role;
}

const INTERNAL_ORIGIN = "https://xfood.invalid";
function parseInternalPath(path: string | null | undefined): URL | null {
  if (!path || !path.startsWith("/") || path.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(path)) return null;
  try {
    const url = new URL(path, INTERNAL_ORIGIN);
    const decoded = decodeURIComponent(url.pathname);
    if (decoded.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(decoded)) return null;
    const normalized = new URL(`${decoded}${url.search}${url.hash}`, INTERNAL_ORIGIN);
    return normalized.origin === INTERNAL_ORIGIN ? normalized : null;
  } catch { return null; }
}

/** Only same-site relative paths are accepted, so `?next=` cannot redirect to another origin. */
export function isSafeInternalPath(path: string | null | undefined): path is string {
  return parseInternalPath(path) !== null;
}

/** Where to go after login: the requested page when the role may open it, otherwise the role's home. */
export function postLoginPath(account: Pick<Account, "role">, next: string | null | undefined) {
  const target = parseInternalPath(next);
  if (!target || target.pathname.startsWith(LOGIN_PATH) || target.pathname.startsWith("/registro")) return homePathFor(account);
  const required = requiredRoleFor(target.pathname);
  return !required || required === account.role ? `${target.pathname}${target.search}${target.hash}` : homePathFor(account);
}

export function loginPathFor(next: string) {
  return `${LOGIN_PATH}?next=${encodeURIComponent(next)}`;
}
