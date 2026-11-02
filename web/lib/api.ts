/** Uniform error body returned by XFood API: `{ code, message, traceId, errors? }`. */
export type ApiError = {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload: ApiError,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export const SESSION_EXPIRED_EVENT = "xfood:session-expired";

async function readPayload(response: Response) {
  return response.status === 204 ? undefined : response.json().catch(() => ({}));
}

function throwIfFailed(response: Response, payload: ApiError | undefined): void {
  if (!response.ok) {
    throw new ApiRequestError(
      payload?.message || `Error ${response.status}`,
      response.status,
      payload ?? {},
    );
  }
}

/** Every call goes through the same-origin proxy in `app/api/v1/[...path]`, which forwards the HttpOnly cookie. */
function apiUrl(path: string) {
  return `/api/v1/${path.replace(/^\//, "")}`;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const payload = await readPayload(response) as ApiError | undefined;
  const route = path.replace(/^\//, "").split("?")[0];
  if (response.status === 401 && !["me", "auth/login", "auth/register"].includes(route) && typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
  throwIfFailed(response, payload);
  return payload as T;
}

export async function apiGetWithHeaders<T>(path: string, signal?: AbortSignal): Promise<{ data: T; headers: Headers }> {
  const response = await fetch(apiUrl(path), {
    credentials: "same-origin",
    cache: "no-store",
    signal,
  });
  const payload = await readPayload(response) as ApiError | undefined;
  throwIfFailed(response, payload);
  return { data: payload as T, headers: response.headers };
}

export function isApiError(error: unknown, status: number, code?: string): error is ApiRequestError {
  return error instanceof ApiRequestError && error.status === status && (!code || error.payload.code === code);
}
