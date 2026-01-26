// IndexedDB-based image cache for EntityLogo component
// Caches image URL load status to prevent repeated failed API calls

const DB_NAME = 'ImageCacheDB';
const STORE_NAME = 'imageStatus';
const DB_VERSION = 1;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  url: string;
  status: 'valid' | 'failed';
  cachedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.warn('IndexedDB not available, image caching disabled');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        store.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
    };
  });

  return dbPromise;
}

export async function getCachedImageStatus(url: string): Promise<'valid' | 'failed' | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry | undefined;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if cache entry is expired
        const isExpired = Date.now() - entry.cachedAt > CACHE_TTL_MS;
        if (isExpired) {
          // Delete expired entry
          deleteFromCache(url);
          resolve(null);
          return;
        }

        resolve(entry.status);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

export async function setCachedImageStatus(url: string, status: 'valid' | 'failed'): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const entry: CacheEntry = {
        url,
        status,
        cachedAt: Date.now(),
      };

      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  } catch {
    // Silently fail if IndexedDB is not available
  }
}

async function deleteFromCache(url: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(url);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  } catch {
    // Silently fail
  }
}

export async function clearExpiredCache(): Promise<number> {
  try {
    const db = await openDB();
    const expiredBefore = Date.now() - CACHE_TTL_MS;
    
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('cachedAt');
      const range = IDBKeyRange.upperBound(expiredBefore);
      
      let deletedCount = 0;
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        resolve(deletedCount);
      };
    });
  } catch {
    return 0;
  }
}

// Clean up expired cache entries on module load
if (typeof window !== 'undefined') {
  clearExpiredCache().catch(() => {});
}
