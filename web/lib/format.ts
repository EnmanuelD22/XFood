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
