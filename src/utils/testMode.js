// TEMPORARY DEVELOPMENT TEST MODE.
// MUST BE DISABLED FOR PRODUCTION.
//
// THIS FILE IS THE ONLY PLACE IN THE APP THAT DECIDES WHETHER THE SAFE
// DEVELOPMENT TEST MODE IS ON. Do not add competing test flags elsewhere.
//
// What TEST_MODE does:
//   - Lets a business create advertisements without an active subscription, so
//     the complete Member -> Business advertising workflow can be exercised
//     during development/testing.
//
// What TEST_MODE does NOT do:
//   - It NEVER writes fake subscription data to Firestore.
//   - It NEVER overwrites `subscriptionStatus`, `subscriptionStartDate`,
//     `subscriptionExpiryDate`, `premiumPlan`, `premiumUntil` or `isPremium`.
//   - It NEVER hardcodes every business as subscribed.
//   - It NEVER bypasses M-PESA / international payment processing. Business
//     membership payments always run through the real Daraja STK Push flow via
//     the Malindi Business Network backend (/api/payments/mpesa/stkpush), and
//     subscription activation is performed ONLY by the backend after a
//     verified callback.
//   - The underlying real subscription checks stay intact and are the ONLY
//     ones used when TEST_MODE is disabled.
//
// How to enable/disable:
//   - Set TEST_MODE_ACTIVE to `true` to enable (development only).
//   - Set TEST_MODE_ACTIVE to `false` to disable; normal subscription rules
//     apply again immediately.
//   - The __DEV__ guard additionally means TEST_MODE can NEVER be active in a
//     release/production bundle (__DEV__ is false there), so this can never
//     become a production payment bypass.

const TEST_MODE_ACTIVE = false;

export const TEST_MODE =
  (typeof __DEV__ === 'boolean' && __DEV__) && TEST_MODE_ACTIVE;

// Milliseconds for a subscription deadline that may be a Firestore Timestamp,
// a Date, an ISO string or a number; null when not parseable.
function deadlineMs(value) {
  if (!value) return null;
  const ms =
    typeof value.toMillis === 'function'
      ? value.toMillis()
      : typeof value === 'object' && typeof value.getTime === 'function'
        ? value.getTime()
        : new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

// The subscription deadline(s) on a profile:
//   - subscriptionExpiresAt is the canonical production field when present.
//   - subscriptionExpiryDate is the legacy field written by the existing
//     Daraja backend callback / dev test endpoints.
// Returns the newest applicable deadline in milliseconds (or null).
export function subscriptionExpiryMs(profile) {
  if (!profile) return null;
  const expiresAt = deadlineMs(profile.subscriptionExpiresAt);
  const expiryDate = deadlineMs(profile.subscriptionExpiryDate);
  if (expiresAt == null && expiryDate == null) return null;
  if (expiresAt == null) return expiryDate;
  if (expiryDate == null) return expiresAt;
  return Math.max(expiresAt, expiryDate);
}

// True when the profile shows an active KSh 100/month membership. The
// Firestore profile is the source of truth; this helper is intentionally not
// altered by TEST_MODE.
export function isSubscribed(profile) {
  if (!profile || profile.subscriptionStatus !== 'active') {
    return false;
  }
  const expiryMs = subscriptionExpiryMs(profile);
  if (expiryMs != null && expiryMs <= Date.now()) {
    return false;
  }
  return true;
}

// True when the business owner's profile shows an active subscription.
export function isBusinessSubscribed(profile) {
  return isSubscribed(profile);
}

// Whether a business may perform subscription-protected actions (create
// advertisements). Production rule: only businesses with an active
// subscription. TEST_MODE grants access for development without touching
// Firestore subscription data.
export function businessCanAdvertise(profile) {
  if (TEST_MODE) {
    return true;
  }
  return isBusinessSubscribed(profile);
}