// Advertisement types for the Business Stage feed. Each type has a stable
// `key` (stored on the advertisement document), a display label, a short
// emoji used as a visual badge, and a one-line helper.
//
// To add a new advertisement type later: add one entry here. The feed,
// Create Advertisement screen and filters all render automatically from this
// list, so no other app code needs to change.

export const AD_TYPES = [
  {
    key: 'promote_business',
    label: 'Promote My Business',
    emoji: '📢',
    icon: 'megaphone-outline' ,
    helper: 'Let people know what your business offers.',
  },
  {
    key: 'promote_product',
    label: 'Promote Product',
    emoji: '🛍️',
    icon: 'pricetag-outline',
    helper: 'Advertise a specific product you sell.',
  },
  {
    key: 'promote_service',
    label: 'Promote Service',
    emoji: '💼',
    icon: 'briefcase-outline',
    helper: 'Advertise a service your business provides.',
  },
  {
    key: 'looking_partner',
    label: 'Looking for Business Partner',
    emoji: '🤝',
    icon: 'people-outline',
    helper: 'Find a partner to grow or start a venture.',
  },
  {
    key: 'looking_supplier',
    label: 'Looking for Supplier',
    emoji: '🚚',
    icon: 'cube-outline',
    helper: 'Find suppliers for the goods you need.',
  },
  {
    key: 'looking_customers',
    label: 'Looking for Customers',
    emoji: '📦',
    icon: 'bag-handle-outline',
    helper: 'Reach customers who need what you offer.',
  },
  {
    key: 'looking_employees',
    label: 'Looking for Employees',
    emoji: '👥',
    icon: 'person-add-outline',
    helper: 'Hire staff for your business.',
  },
  {
    key: 'investment_opportunity',
    label: 'Investment Opportunity',
    emoji: '💰',
    icon: 'trending-up-outline',
    helper: 'Share a business opportunity looking for partners or investors.',
  },
  {
    key: 'special_offer',
    label: 'Special Offer',
    emoji: '📣',
    icon: 'sparkles-outline',
    helper: 'Announce an offer, discount or promotion.',
  },
];

export const AD_TYPE_MAP = Object.fromEntries(
  AD_TYPES.map((type) => [type.key, type])
);

export function getAdType(key) {
  return AD_TYPE_MAP[key] || {
    key,
    label: 'Advertisement',
    emoji: '📢',
    icon: 'megaphone-outline',
    helper: '',
  };
}

// The advertisement statuses a business owner can set on their own posts.
// `active` posts appear on the public Business Stage feed; `draft` and
// `inactive` posts are only visible to the owner via My Advertisements.
export const AD_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
};

export function isValidAdStatus(value) {
  return Object.values(AD_STATUSES).includes(value);
}