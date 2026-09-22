// Business categories used across the whole app (registration, business
// profiles, Discover search). Stored on the business document as a simple
// string key. Extend this list any time a new category is needed - no schema
// change required because businesses are filtered by category name.

export const BUSINESS_CATEGORIES = [
  'Hotels & Accommodation',
  'Restaurants & Food',
  'Shops & Retail',
  'Electronics & Technology',
  'Transport',
  'Construction',
  'Real Estate',
  'Agriculture',
  'Fisheries',
  'Automotive',
  'Beauty & Fashion',
  'Professional Services',
  'Financial Services',
  'Education',
  'Health & Wellness',
  'Tourism',
  'Entertainment',
  'Manufacturing',
  'Wholesale & Suppliers',
  'Other',
];

export const DEFAULT_BUSINESS_CATEGORY = 'Other';

export function isValidBusinessCategory(value) {
  return BUSINESS_CATEGORIES.includes(value);
}

// Product/service "tag" suggestions shown when a business owner is describing
// what they sell or offer. Free-form tags are also allowed.
export const BUSINESS_TAG_SUGGESTIONS = [
  'Delivery available',
  'Online orders',
  'Wholesale',
  'Retail',
  'Import / Export',
  'Custom orders',
  'Repair services',
  'Consultation',
  'Training courses',
  'Membership plans',
];