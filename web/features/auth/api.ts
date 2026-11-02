import { apiRequest } from "../../lib/api";
import type { Account, LoginRequest, RegisterRequest } from "./types";

export function getCurrentAccount(signal?: AbortSignal) {
  return apiRequest<Account>("me", { signal });
}

/** The API answers with `Set-Cookie`; the proxy relays it and the browser never reads the session. */
export function login(request: LoginRequest) {
  return apiRequest<Account>("auth/login", { method: "POST", body: JSON.stringify(request) });
}

/** Registration does not open a session: the caller must send the person to the login page. */
export function register(request: RegisterRequest) {
  return apiRequest<Account>("auth/register", { method: "POST", body: JSON.stringify(request) });
}

export function logout() {
  return apiRequest<void>("auth/logout", { method: "POST" });
}
