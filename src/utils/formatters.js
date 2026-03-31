export const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export const compactDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

export const detailedDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

export function formatCurrency(value) {
  return currencyFormatter.format(value);
}

export function formatDate(value) {
  return compactDateFormatter.format(new Date(value));
}

export function formatDateTime(value) {
  return detailedDateFormatter.format(new Date(value));
}
