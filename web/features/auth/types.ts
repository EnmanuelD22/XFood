export type Role = "Consumer" | "Establishment" | "Organization" | "Administrator";

export type Establishment = {
  id: string;
  name: string;
  status: string;
  memberRole: string;
  isPrimary: boolean;
};

export type Organization = {
  id: string;
  name: string;
  verificationStatus: string;
};

/** Same shape for `POST /auth/register`, `POST /auth/login` and `GET /me`. */
export type Account = {
  id?: string;
  email?: string;
  displayName?: string;
  role: string;
  status: string;
  organization?: Organization | null;
  establishments?: Establishment[] | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterEstablishment = {
  name: string;
  contactPhone: string;
  address: string;
  latitude: number;
  longitude: number;
  timeZoneId?: string;
};

export type RegisterOrganization = {
  name: string;
  contactPhone: string;
  address: string;
  verificationInformation?: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  displayName: string;
  role: Exclude<Role, "Administrator">;
  establishment?: RegisterEstablishment | null;
  organization?: RegisterOrganization | null;
};
