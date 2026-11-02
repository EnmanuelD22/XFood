
export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface RegisterOrganizationData {
  name?: string;
  contactPhone?: string;
  address?: string;
  verificationInformation?: string;
}

export interface RegisterRequest {
  email?: string;
  password?: string;
  displayName?: string;
  role?: string; // "Consumer" | "Establishment" | "Organization"
  organization?: RegisterOrganizationData | null;
}



export interface OrganizationResponse {
  id: string;
  name: string;
  verificationStatus: string;
}

export interface AccountResponse {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  organization?: OrganizationResponse | null;
}



export interface ApiError {
  code: string;
  message: string;
  traceId: string;
  errors?: Record<string, string[]>;
}