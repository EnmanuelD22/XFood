/** `GET /establishments/{id}` response. */
export type EstablishmentProfile = {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  latitude: number;
  longitude: number;
  timeZoneId: string;
};

export type ProfileForm = Omit<EstablishmentProfile, "id" | "timeZoneId">;

export type ProfileErrors = Record<string, string[]>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9 +()-]{7,32}$/;

export function toProfileForm(profile: EstablishmentProfile): ProfileForm {
  const { name, contactName, contactEmail, contactPhone, address, latitude, longitude } = profile;
  return { name, contactName, contactEmail, contactPhone, address, latitude, longitude };
}

/** Mirrors `EstablishmentProfileValidator`; the API stays authoritative. */
export function validateProfile(form: ProfileForm): ProfileErrors {
  const errors: ProfileErrors = {};
  const add = (key: string, message: string) => {
    errors[key] = [...(errors[key] ?? []), message];
  };
  const required: Array<[keyof ProfileForm, string, number]> = [
    ["name", "Escribe el nombre del establecimiento.", 200],
    ["contactName", "Escribe el nombre de contacto.", 200],
    ["contactEmail", "Escribe el correo de contacto.", 320],
    ["contactPhone", "Escribe el teléfono de contacto.", 32],
    ["address", "Escribe la dirección.", 500],
  ];
  for (const [key, message, max] of required) {
    const value = String(form[key]).trim();
    if (!value) add(key, message);
    else if (value.length > max) add(key, `Admite hasta ${max} caracteres.`);
  }
  if (form.contactEmail.trim() && !EMAIL_PATTERN.test(form.contactEmail.trim())) add("contactEmail", "El correo de contacto no tiene un formato válido.");
  if (form.contactPhone.trim() && !PHONE_PATTERN.test(form.contactPhone.trim())) add("contactPhone", "Usa entre 7 y 32 caracteres: dígitos, espacios, + - ( ).");
  if (!(Math.abs(form.latitude) <= 90) || !(Math.abs(form.longitude) <= 180)) add("location", "Marca una ubicación válida en el mapa.");
  return errors;
}

export function toProfileRequest(form: ProfileForm) {
  return {
    name: form.name.trim(),
    contactName: form.contactName.trim(),
    contactEmail: form.contactEmail.trim(),
    contactPhone: form.contactPhone.trim(),
    address: form.address.trim(),
    latitude: Number(form.latitude.toFixed(6)),
    longitude: Number(form.longitude.toFixed(6)),
  };
}

/** The API answers with `Name`, `ContactEmail`, `Latitude`…; coordinates are shown on the map picker. */
export function normalizeProfileErrors(errors: Record<string, string[]> | undefined): ProfileErrors {
  const result: ProfileErrors = {};
  for (const [rawKey, messages] of Object.entries(errors ?? {})) {
    const key = rawKey.charAt(0).toLowerCase() + rawKey.slice(1);
    const target = key === "latitude" || key === "longitude" ? "location" : key;
    result[target] = [...(result[target] ?? []), ...messages];
  }
  return result;
}
