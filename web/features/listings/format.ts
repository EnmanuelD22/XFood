import type { FieldErrors, FormValues, Listing } from "./types";

export function getListingStatus(status: number, deadline: string) {
  if ((status === 1 || status === 2) && new Date(deadline) <= new Date()) return "Vencida";

  const labels: Record<number, string> = {
    1: "Activa",
    2: "Agotada",
    3: "Desactivada",
    4: "Vencida",
  };

  return labels[status] ?? "Estado desconocido";
}

export function formatMoney(value?: number | null) {
  if (value == null) return "—";

  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

export function localInputToUtc(value: string, timeZone: string) {
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return "";

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return "";
  const targetTime = Date.UTC(year, month - 1, day, hour, minute);
  let utcGuess = targetTime;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(utcGuess));

    const partValue = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value ?? 0);
    const displayedTime = Date.UTC(
      partValue("year"),
      partValue("month") - 1,
      partValue("day"),
      partValue("hour"),
      partValue("minute"),
    );

    utcGuess += targetTime - displayedTime;
  }

  return new Date(utcGuess).toISOString();
}

export function localInputFromUtc(value: string, timeZone: string) {
  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));

  return formatted.replace(" ", "T");
}

export function validateSaleForm(form: FormValues, timeZone: string): FieldErrors {
  const errors: FieldErrors = {};
  const add = (field: string, message: string) => {
    errors[field] = [...(errors[field] ?? []), message];
  };

  if (!form.title.trim() || form.title.length > 200) {
    add("title", "Escribe un título de hasta 200 caracteres.");
  }
  if (!form.description.trim() || form.description.length > 4000) {
    add("description", "La descripción es obligatoria y admite hasta 4000 caracteres.");
  }
  if (!form.categoryId) add("categoryId", "Selecciona una categoría.");
  if (!Number.isInteger(Number(form.initialQuantity)) || Number(form.initialQuantity) < 1) {
    add("initialQuantity", "La cantidad debe ser un entero mayor que cero.");
  }

  const original = Number(form.originalUnitPrice);
  const discounted = Number(form.discountedUnitPrice);
  if (!(original > 0)) add("originalUnitPrice", "El precio original debe ser mayor que cero.");
  if (!(discounted > 0) || discounted >= original) {
    add("discountedUnitPrice", "El precio con descuento debe ser positivo y menor que el original.");
  }
  if (!form.pickupInstructions.trim() || form.pickupInstructions.length > 2000) {
    add("pickupInstructions", "Indica cómo recoger el pedido (hasta 2000 caracteres).");
  }
  if (!form.paymentInstructions.trim() || form.paymentInstructions.length > 1000) {
    add("paymentInstructions", "Las instrucciones de pago son obligatorias (hasta 1000 caracteres).");
  }
  if (!form.foodSafetyDeclared) {
    add("foodSafetyDeclared", "Debes declarar que el excedente es apto para consumo.");
  }

  const startsAt = localInputToUtc(form.pickupStartsAt, timeZone);
  const deadline = localInputToUtc(form.pickupDeadline, timeZone);
  if (
    !startsAt ||
    !deadline ||
    new Date(startsAt) >= new Date(deadline) ||
    new Date(deadline) <= new Date()
  ) {
    add("pickupDeadline", "La recogida debe iniciar antes del límite y terminar en una fecha futura.");
  }

  return errors;
}

export function mapServerErrors(errors?: Record<string, string[]>): FieldErrors {
  const normalized: FieldErrors = {};

  for (const [key, messages] of Object.entries(errors ?? {})) {
    const field = key.charAt(0).toLowerCase() + key.slice(1);
    const target = field === "pickupStartsAtUtc" || field === "pickupDeadlineUtc"
      ? "pickupDeadline"
      : field;
    normalized[target] = [...(normalized[target] ?? []), ...messages];
  }

  return normalized;
}

export function toUpdateForm(listing: Listing, timeZone: string): FormValues {
  return {
    title: listing.title,
    description: listing.description,
    categoryId: listing.categoryId,
    initialQuantity: String(listing.initialQuantity),
    originalUnitPrice: String(listing.originalUnitPrice ?? ""),
    discountedUnitPrice: String(listing.discountedUnitPrice ?? ""),
    pickupInstructions: listing.pickupInstructions,
    pickupStartsAt: localInputFromUtc(listing.pickupStartsAtUtc, timeZone),
    pickupDeadline: localInputFromUtc(listing.pickupDeadlineUtc, timeZone),
    paymentInstructions: listing.paymentInstructions ?? "",
    foodSafetyDeclared: listing.foodSafetyDeclared,
  };
}

export function rememberEstablishment(id: string) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("establishmentId", id);
  else url.searchParams.delete("establishmentId");
  window.history.replaceState({}, "", url);
}
