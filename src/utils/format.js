export function formatKES(amount) {
  const rounded = Math.round(amount || 0);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `KES ${formatted}`;
}

// Normalizes a Kenyan phone/M-PESA number to an E.164 (2547XXXXXXXX) form, or
// null when the value does not look like a Kenyan number. Handles the common
// formats stored by the app: '+254 712 345 678', '0712345678', '254712345678',
// '712345678'.
export function normalizeKenyanPhoneE164(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let cleaned = raw.replace(/[\s\-()]/g, '').trim();
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
  if (cleaned.startsWith('7') && cleaned.length === 9) cleaned = '254' + cleaned;
  if (cleaned.startsWith('1') && cleaned.length === 9) cleaned = '254' + cleaned;
  if (!/^254(1|7)\d{8}$/.test(cleaned)) return null;
  return cleaned;
}

// Human-friendly display form (07XXXXXXXX) of a Kenyan number, or null when
// the value is not recognized as a Kenyan number.
export function normalizeKenyanPhoneDisplay(raw) {
  const e164 = normalizeKenyanPhoneE164(raw);
  if (!e164) return null;
  const nationalDigits = e164.substring(3);
  return `0${nationalDigits}`;
}

// Human-friendly relative time ("Just now", "5m ago", "3h ago", "Yesterday",
// "12 Sep") used on advertisement cards and the Business Stage feed.
export function formatRelativeTime(value) {
  if (!value) return '';
  let date;
  if (typeof value.toDate === 'function') date = value.toDate();
  else if (value instanceof Date) date = value;
  else if (typeof value === 'number') date = new Date(value);
  else if (typeof value === 'string') {
    const parsed = new Date(value);
    date = Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (!date || Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) return 'Just now';
  if (diffMs < hourMs) return `${Math.floor(diffMs / minuteMs)}m ago`;
  if (diffMs < dayMs) return `${Math.floor(diffMs / hourMs)}h ago`;
  if (diffMs < 2 * dayMs) return 'Yesterday';
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}${sameYear ? '' : ` ${date.getFullYear()}`}`;
}

// Pair of functions to serialize/verify subscription expiry. Kept next to the
// other shared formatters so subscription helpers import cleanly everywhere.
export function parseSubscriptionExpiry(profile) {
  const raw = profile?.subscriptionExpiryDate;
  if (!raw) return null;
  if (typeof raw.toDate === 'function') return raw.toDate();
  if (raw instanceof Date) return raw;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];