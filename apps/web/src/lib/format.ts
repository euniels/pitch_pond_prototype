export function formatMoney(minor: number, locale = "en-PH"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}

export function formatDate(value: string | null, locale = "en-PH"): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}
