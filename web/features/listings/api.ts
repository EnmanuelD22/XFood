import type { ApiError } from "./types";

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

function apiUrl(path: string) {
  return `/api/v1/${path.replace(/^\//, "")}`;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const payload = await readPayload(response) as ApiError | undefined;
  throwIfFailed(response, payload);
  return payload as T;
}

export async function apiGetWithHeaders<T>(path: string): Promise<{ data: T; headers: Headers }> {
  const response = await fetch(apiUrl(path), {
    credentials: "same-origin",
    cache: "no-store",
  });
  const payload = await readPayload(response) as ApiError | undefined;
  throwIfFailed(response, payload);
  return { data: payload as T, headers: response.headers };
}
