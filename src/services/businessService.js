// Firestore access for the `businesses` collection. Each document is keyed by
// the owning user's Firebase uid (businessId == ownerUid). A public business
// profile is used across Discover, the Business Stage feed, ad detail and
// contact screens.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { safeOnSnapshot } from './listenerLogging';
import { isValidBusinessCategory, DEFAULT_BUSINESS_CATEGORY } from '../utils/businessCategories';

export const BUSINESSES_COLLECTION = 'businesses';

export function businessDocRef(ownerUid) {
  return doc(db, BUSINESSES_COLLECTION, ownerUid);
}

export function businessesCollectionRef() {
  return collection(db, BUSINESSES_COLLECTION);
}

export function normalizeBusiness(snapshot) {
  if (snapshot && typeof snapshot.exists === 'function') {
    if (!snapshot.exists()) return null;
    return { businessId: snapshot.id, id: snapshot.id, ...snapshot.data() };
  }
  return snapshot ? { businessId: snapshot.id, id: snapshot.id, ...snapshot } : null;
}

export async function getBusiness(ownerUid) {
  if (!ownerUid) return null;
  const snapshot = await getDoc(businessDocRef(ownerUid));
  return normalizeBusiness(snapshot);
}

export async function getBusinessById(businessId) {
  return getBusiness(businessId);
}

// Creates the business profile document for a business owner. Called from the
// business profile screen the first time the owner saves their details.
export async function createBusiness({
  ownerUid,
  ownerName = '',
  businessName,
  category = DEFAULT_BUSINESS_CATEGORY,
  description = '',
  productsServices = [],
  phone = '',
  whatsapp = '',
  location = '',
  email = '',
  businessHours = '',
  profilePhoto = null,
}) {
  if (!ownerUid) {
    throw new Error('createBusiness: ownerUid is required');
  }
  if (!businessName || !businessName.trim()) {
    throw new Error('createBusiness: businessName is required');
  }

  const record = {
    businessId: ownerUid,
    ownerUid,
    ownerName,
    businessName: businessName.trim(),
    category: isValidBusinessCategory(category) ? category : DEFAULT_BUSINESS_CATEGORY,
    description: typeof description === 'string' ? description : '',
    productsServices: Array.isArray(productsServices)
      ? productsServices.map((item) => String(item).trim()).filter(Boolean)
      : [],
    phone: typeof phone === 'string' ? phone : '',
    whatsapp: typeof whatsapp === 'string' ? whatsapp : '',
    location: typeof location === 'string' ? location : '',
    email: typeof email === 'string' ? email : '',
    businessHours: typeof businessHours === 'string' ? businessHours : '',
    profilePhoto: profilePhoto || null,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = businessDocRef(ownerUid);
  await setDoc(ref, record);
  return normalizeBusiness({ id: ownerUid, ...record });
}

export async function updateBusiness(ownerUid, updates) {
  if (!ownerUid) {
    throw new Error('updateBusiness: ownerUid is required');
  }
  const allowed = [
    'ownerName',
    'businessName',
    'category',
    'description',
    'productsServices',
    'phone',
    'whatsapp',
    'location',
    'email',
    'businessHours',
    'profilePhoto',
    'isActive',
  ];
  const cleanUpdates = {};
  for (const key of allowed) {
    if (updates && key in updates) {
      cleanUpdates[key] = updates[key];
    }
  }
  if ('category' in cleanUpdates && !isValidBusinessCategory(cleanUpdates.category)) {
    cleanUpdates.category = DEFAULT_BUSINESS_CATEGORY;
  }
  if ('productsServices' in cleanUpdates && !Array.isArray(cleanUpdates.productsServices)) {
    cleanUpdates.productsServices = [];
  }
  cleanUpdates.updatedAt = serverTimestamp();
  await updateDoc(businessDocRef(ownerUid), cleanUpdates);
  return getBusiness(ownerUid);
}

// Live single-business subscription (used by dashboard + public profile).
export function onBusiness(ownerUid, callback) {
  if (!ownerUid) {
    callback(null);
    return () => {};
  }
  return safeOnSnapshot(businessDocRef(ownerUid), {
    source: 'businessService/onBusiness',
    path: `businesses/${ownerUid}`,
    query: 'get',
    onData: (snapshot) => callback(normalizeBusiness(snapshot)),
  });
}

// Live list of business profiles that are visible publicly.
export function onActiveBusinesses(callback) {
  return safeOnSnapshot(
    query(businessesCollectionRef(), where('isActive', '==', true)),
    {
      source: 'businessService/onActiveBusinesses',
      path: 'businesses',
      query: "where('isActive','==',true)",
      onData: (snapshot) => {
        callback(
          snapshot.docs.map((docSnap) => normalizeBusiness(docSnap)).filter(Boolean)
        );
      },
    }
  );
}

export async function getActiveBusinesses() {
  const snapshot = await getDocs(
    query(businessesCollectionRef(), where('isActive', '==', true))
  );
  return snapshot.docs.map((docSnap) => normalizeBusiness(docSnap)).filter(Boolean);
}

// A business profile is public-only while it is marked active; the owner may
// always read their own record even if it is not active.
export function onMyBusiness(ownerUid, callback) {
  if (!ownerUid) {
    callback(null);
    return () => {};
  }
  return safeOnSnapshot(businessDocRef(ownerUid), {
    source: 'businessService/onMyBusiness',
    path: `businesses/${ownerUid}`,
    query: 'get',
    onData: (snapshot) => callback(normalizeBusiness(snapshot)),
  });
}