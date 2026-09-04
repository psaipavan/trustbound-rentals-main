export function inr(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function inrShort(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return inr(value);
}

export function hoursAgo(hours: number): string {
  if (hours < 1) return "minutes ago";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
