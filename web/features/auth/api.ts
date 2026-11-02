import { LoginRequest, RegisterRequest, AccountResponse, ApiError } from "./types";

const API_BASE = "/api/v1/auth";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = (await response.json()) as ApiError;
   
    throw errorData;
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return (await response.json()) as T;
}

export async function login(data: LoginRequest): Promise<AccountResponse> {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<AccountResponse>(response);
}

export async function register(data: RegisterRequest): Promise<AccountResponse> {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<AccountResponse>(response);
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE}/logout`, {
    method: "POST",
  });
  
  await handleResponse<void>(response);
}