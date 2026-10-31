// Firestore cache layer — server-side only, no personal data stored
import 'server-only';
import { CACHE_COLLECTION, CACHE_TTL_MS } from './constants';
import { logger } from './logger';
import type { GeneratedPlan } from './types';

type FirestoreDb = {
  collection: (name: string) => {
    doc: (id: string) => {
      get: () => Promise<{ exists: boolean; data: () => Record<string, unknown> | undefined }>;
      set: (data: Record<string, unknown>) => Promise<void>;
      delete: () => Promise<void>;
    };
  };
};

function getFirestore(): FirestoreDb | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admin = require('firebase-admin');
    if (!admin.apps?.length) admin.initializeApp();
    return admin.firestore() as FirestoreDb;
  } catch {
    return null;
  }
}

export async function getCachedPlan(cacheKey: string): Promise<GeneratedPlan | null> {
  const db = getFirestore();
  if (!db) return null;

  try {
    const doc = await db.collection(CACHE_COLLECTION).doc(cacheKey).get();
    if (!doc.exists) return null;

    const data = doc.data();
    if (!data) return null;

    const age = Date.now() - (data['createdAt'] as number);
    if (age > CACHE_TTL_MS) {
      await db.collection(CACHE_COLLECTION).doc(cacheKey).delete();
      return null;
    }

    logger.info('Cache hit', { cacheKey });
    return data['plan'] as GeneratedPlan;
  } catch (err) {
    logger.warn('Cache read failed', { error: String(err) });
    return null;
  }
}

export async function setCachedPlan(cacheKey: string, plan: GeneratedPlan): Promise<void> {
  const db = getFirestore();
  if (!db) return;

  try {
    await db.collection(CACHE_COLLECTION).doc(cacheKey).set({
      plan,
      createdAt: Date.now(),
    });
    logger.info('Cache written', { cacheKey });
  } catch (err) {
    logger.warn('Cache write failed', { error: String(err) });
  }
}
