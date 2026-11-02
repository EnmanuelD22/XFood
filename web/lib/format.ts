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

function dayKey(value: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
}

/** Short pickup time for cards: "hoy, 8:00 p. m.", "mañana, 9:30 a. m." or "5 jun, 2:00 p. m.", in the establishment's zone. */
export function formatShortDateTime(value: string, timeZone: string, now = new Date()) {
  const date = new Date(value);
  const time = new Intl.DateTimeFormat("es-DO", { hour: "numeric", minute: "2-digit", timeZone }).format(date);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (dayKey(date, timeZone) === dayKey(now, timeZone)) return `hoy, ${time}`;
  if (dayKey(date, timeZone) === dayKey(tomorrow, timeZone)) return `mañana, ${time}`;
  const day = new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "short", timeZone }).format(date).replace(".", "");
  return `${day}, ${time}`;
}
