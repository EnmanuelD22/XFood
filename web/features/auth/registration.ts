import type { RegisterRequest } from "./types";

export type RegistrableRole = RegisterRequest["role"];

export type RegisterValues = {
  role: RegistrableRole;
  displayName: string;
  email: string;
  password: string;
  /** Business or organization data; which block is sent depends on the role. */
  name: string;
  contactPhone: string;
  address: string;
  verificationInformation: string;
  latitude: number | null;
  longitude: number | null;
};

/** Keys match the API (`email`, `establishment.name`, …) so server and client errors land on the same field. */
export type RegisterErrors = Record<string, string[]>;

export const EMPTY_REGISTRATION: RegisterValues = {
  role: "Consumer",
  displayName: "",
  email: "",
  password: "",
  name: "",
  contactPhone: "",
  address: "",
  verificationInformation: "",
  latitude: null,
  longitude: null,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9 +()-]{7,32}$/;

export function profileKey(role: RegistrableRole) {
  return role === "Establishment" ? "establishment" : role === "Organization" ? "organization" : "";
}

/** Mirrors the documented server rules; the API stays authoritative (password policy, duplicates). */
export function validateRegistration(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};
  const add = (key: string, message: string) => {
    errors[key] = [...(errors[key] ?? []), message];
  };

  if (!values.displayName.trim()) add("displayName", "Escribe tu nombre.");
  else if (values.displayName.trim().length > 200) add("displayName", "El nombre admite hasta 200 caracteres.");
  if (!EMAIL_PATTERN.test(values.email.trim())) add("email", "Escribe un correo electrónico válido.");
  if (values.password.length < 6) add("password", "La contraseña debe tener al menos 6 caracteres.");

  const prefix = profileKey(values.role);
  if (!prefix) return errors;

  if (!values.name.trim()) add(`${prefix}.name`, values.role === "Establishment" ? "Escribe el nombre del establecimiento." : "Escribe el nombre de la organización.");
  if (!PHONE_PATTERN.test(values.contactPhone.trim())) add(`${prefix}.contactPhone`, "Usa entre 7 y 32 caracteres: dígitos, espacios, + - ( ).");
  if (!values.address.trim()) add(`${prefix}.address`, "Escribe la dirección.");
  else if (values.address.trim().length > 500) add(`${prefix}.address`, "La dirección admite hasta 500 caracteres.");
  if (values.role === "Establishment" && (values.latitude === null || values.longitude === null
    || !Number.isFinite(values.latitude) || !Number.isFinite(values.longitude)
    || Math.abs(values.latitude) > 90 || Math.abs(values.longitude) > 180)) {
    add("establishment.location", "Marca la ubicación del establecimiento en el mapa.");
  }
  return errors;
}

export function buildRegisterRequest(values: RegisterValues): RegisterRequest {
  const base = {
    email: values.email.trim(),
    password: values.password,
    displayName: values.displayName.trim(),
    role: values.role,
  };
  if (values.role === "Establishment") {
    return {
      ...base,
      establishment: {
        name: values.name.trim(),
        contactPhone: values.contactPhone.trim(),
        address: values.address.trim(),
        latitude: Number(values.latitude!.toFixed(6)),
        longitude: Number(values.longitude!.toFixed(6)),
      },
    };
  }
  if (values.role === "Organization") {
    return {
      ...base,
      organization: {
        name: values.name.trim(),
        contactPhone: values.contactPhone.trim(),
        address: values.address.trim(),
        verificationInformation: values.verificationInformation.trim() || undefined,
      },
    };
  }
  return base;
}

/** The API returns `establishment.latitude` and `…longitude`; the form shows both on the map picker. */
export function normalizeServerErrors(errors: Record<string, string[]> | undefined): RegisterErrors {
  const result: RegisterErrors = {};
  for (const [rawKey, messages] of Object.entries(errors ?? {})) {
    const key = rawKey.split(".").map((part) => part.charAt(0).toLowerCase() + part.slice(1)).join(".");
    const target = key === "establishment.latitude" || key === "establishment.longitude" ? "establishment.location" : key;
    result[target] = [...(result[target] ?? []), ...messages];
  }
  return result;
}
