// Firestore access for the `advertisements` collection - the content behind
// the Business Stage feed. Each document is created client-side with an
// auto-generated id so multiple posts per business are allowed (unlike the
// business profile, which is keyed by the owner uid).
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { safeOnSnapshot } from './listenerLogging';
import { isValidAdStatus, AD_STATUSES, AD_TYPES } from '../utils/adTypes';

export const ADVERTISEMENTS_COLLECTION = 'advertisements';

// Sorts newest-first by createdAt (Firestore Timestamp, Date, number or
// string). Used instead of a server-side orderBy so the queries need no
// composite indexes in the shared Firestore project.
function createdAtMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.getTime === 'function') return value.getTime();
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function sortNewestFirst(list) {
  return [...list].sort((a, b) => createdAtMillis(b.createdAt) - createdAtMillis(a.createdAt));
}

export function advertisementsCollectionRef() {
  return collection(db, ADVERTISEMENTS_COLLECTION);
}

export function advertisementDocRef(adId) {
  return doc(db, ADVERTISEMENTS_COLLECTION, adId);
}

export function normalizeAdvertisement(snapshot) {
  if (snapshot && typeof snapshot.exists === 'function') {
    if (!snapshot.exists()) return null;
    return { adId: snapshot.id, id: snapshot.id, ...snapshot.data() };
  }
  return snapshot ? { adId: snapshot.id, id: snapshot.id, ...snapshot } : null;
}

function pickValidType(type) {
  if (!type) return 'promote_business';
  const keys = AD_TYPES.map((t) => t.key);
  return keys.includes(type) ? type : 'promote_business';
}

// Creates a new advertisement. `ownerUid` must be the current user's uid and
// `businessId` must be that owner's business key (businessId == ownerUid), so
// the security rules can prove ownership from the ownerUid field alone.
export async function createAdvertisement({
  ownerUid,
  businessId,
  type = 'promote_business',
  title,
  description = '',
  category = '',
  location = '',
  phone = '',
  whatsapp = '',
  image = null,
  status = AD_STATUSES.ACTIVE,
}) {
  if (!ownerUid) {
    throw new Error('createAdvertisement: ownerUid is required');
  }
  if (!businessId) {
    throw new Error('createAdvertisement: businessId is required');
  }
  if (!title || !title.trim()) {
    throw new Error('createAdvertisement: title is required');
  }

  const record = {
    ownerUid,
    businessId,
    type: pickValidType(type),
    title: String(title).trim(),
    description: typeof description === 'string' ? description : '',
    category: typeof category === 'string' ? category : '',
    location: typeof location === 'string' ? location : '',
    phone: typeof phone === 'string' ? phone : '',
    whatsapp: typeof whatsapp === 'string' ? whatsapp : '',
    image: image || null,
    status: isValidAdStatus(status) ? status : AD_STATUSES.ACTIVE,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(advertisementsCollectionRef(), record);
  return normalizeAdvertisement({ id: ref.id, ...record });
}

export async function getAdvertisement(adId) {
  if (!adId) return null;
  const snapshot = await getDoc(advertisementDocRef(adId));
  return normalizeAdvertisement(snapshot);
}

export function onAdvertisement(adId, callback) {
  if (!adId) {
    callback(null);
    return () => {};
  }
  return safeOnSnapshot(advertisementDocRef(adId), {
    source: 'advertisementService/onAdvertisement',
    path: `advertisements/${adId}`,
    query: 'get',
    onData: (snapshot) => callback(normalizeAdvertisement(snapshot)),
  });
}

// Public feed: only advertisements marked `active`, newest first. The
// security rules enforce the same restriction server-side. Sorting happens
// client-side so the query needs no composite index.
export function onActiveAdvertisements(callback, maxResults = 80) {
  return safeOnSnapshot(
    query(
      advertisementsCollectionRef(),
      where('status', '==', AD_STATUSES.ACTIVE),
      limit(maxResults)
    ),
    {
      source: 'advertisementService/onActiveAdvertisements',
      path: 'advertisements',
      query: `where('status','==','active') limit(${maxResults})`,
      onData: (snapshot) => {
        const list = snapshot.docs
          .map((docSnap) => normalizeAdvertisement(docSnap))
          .filter(Boolean);
        callback(sortNewestFirst(list));
      },
    }
  );
}

// Owner-only list of their own posts in any status.
export function onMyAdvertisements(ownerUid, callback) {
  if (!ownerUid) {
    callback([]);
    return () => {};
  }
  return safeOnSnapshot(
    query(
      advertisementsCollectionRef(),
      where('ownerUid', '==', ownerUid),
      limit(200)
    ),
    {
      source: 'advertisementService/onMyAdvertisements',
      path: 'advertisements',
      query: `where('ownerUid','==',uid)`,
      onData: (snapshot) => {
        const list = snapshot.docs
          .map((docSnap) => normalizeAdvertisement(docSnap))
          .filter(Boolean);
        callback(sortNewestFirst(list));
      },
    }
  );
}

// Active advertisements belonging to one business (shown on its public page).
// The status filter must happen client-side because combining businessId +
// status in one query would need a composite index.
export function onBusinessAdvertisements(businessId, callback, maxResults = 20) {
  if (!businessId) {
    callback([]);
    return () => {};
  }
  return safeOnSnapshot(
    query(
      advertisementsCollectionRef(),
      where('businessId', '==', businessId),
      limit(maxResults)
    ),
    {
      source: 'advertisementService/onBusinessAdvertisements',
      path: `advertisements/${businessId}`,
      query: `where('businessId','==',id)`,
      onData: (snapshot) => {
        const list = snapshot.docs
          .map((docSnap) => normalizeAdvertisement(docSnap))
          .filter((ad) => ad && ad.status === AD_STATUSES.ACTIVE);
        callback(sortNewestFirst(list));
      },
    }
  );
}

export async function updateAdvertisement(adId, updates) {
  if (!adId) {
    throw new Error('updateAdvertisement: adId is required');
  }
  const allowed = [
    'type',
    'title',
    'description',
    'category',
    'location',
    'phone',
    'whatsapp',
    'image',
    'status',
  ];
  const cleanUpdates = {};
  for (const key of allowed) {
    if (updates && key in updates) {
      cleanUpdates[key] = updates[key];
    }
  }
  if ('type' in cleanUpdates) {
    cleanUpdates.type = pickValidType(cleanUpdates.type);
  }
  if ('status' in cleanUpdates) {
    cleanUpdates.status = isValidAdStatus(cleanUpdates.status)
      ? cleanUpdates.status
      : AD_STATUSES.ACTIVE;
  }
  cleanUpdates.updatedAt = serverTimestamp();
  await updateDoc(advertisementDocRef(adId), cleanUpdates);
  return getAdvertisement(adId);
}

export async function deleteAdvertisement(adId) {
  if (!adId) {
    throw new Error('deleteAdvertisement: adId is required');
  }
  await deleteDoc(advertisementDocRef(adId));
}