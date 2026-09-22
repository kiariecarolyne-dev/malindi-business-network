// Helpers for turning stored contact details into callable links.
// Kept separate so any component (AdCard, BusinessDetail, AdDetail) can open
// a phone dialler or WhatsApp chat without duplicating normalization logic.
import {
  normalizeKenyanPhoneE164,
  normalizeKenyanPhoneDisplay,
} from './format';

// "tel:+254..." for the native call dialler.
export function telLink(raw) {
  const e164 = normalizeKenyanPhoneE164(raw);
  const display = normalizeKenyanPhoneDisplay(raw);
  if (!e164) return null;
  return { url: `tel:${e164}`, label: display || e164 };
}

// "https://wa.me/<digits>" for WhatsApp. wa.me expects the full country code
// without "+" or spaces. Falls back to a best-effort digits string when the
// number is not a standard Kenyan format.
export function whatsappLink(raw) {
  if (!raw) return null;
  const e164 = normalizeKenyanPhoneE164(raw);
  if (e164) return { url: `https://wa.me/${e164}`, label: normalizeKenyanPhoneDisplay(raw) || e164 };
  const digits = String(raw).replace(/[^\d]/g, '');
  if (!digits) return null;
  return { url: `https://wa.me/${digits}`, label: String(raw) };
}

// Where a user prefers WhatsApp but gave no number, fall back to the phone.
export function resolveWhatsapp(preferred, phone) {
  return whatsappLink(preferred) || whatsappLink(phone) || null;
}