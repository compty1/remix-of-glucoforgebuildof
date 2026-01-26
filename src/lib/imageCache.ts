// IndexedDB-based image cache for EntityLogo component
// Caches image URL load status to prevent repeated failed API calls

const DB_NAME = 'ImageCacheDB';
const STORE_NAME = 'imageStatus';
const DB_VERSION = 1;
const VALID_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days for valid URLs
const FAILED_CACHE_TTL_MS = 1 * 60 * 60 * 1000; // 1 hour for failed URLs (reduced from 24h)

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

        // Use different TTLs for valid vs failed entries
        const ttl = entry.status === 'valid' ? VALID_CACHE_TTL_MS : FAILED_CACHE_TTL_MS;
        const isExpired = Date.now() - entry.cachedAt > ttl;
        
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
    
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const entries = getAllRequest.result as CacheEntry[];
        let deletedCount = 0;
        const now = Date.now();
        
        entries.forEach((entry) => {
          const ttl = entry.status === 'valid' ? VALID_CACHE_TTL_MS : FAILED_CACHE_TTL_MS;
          if (now - entry.cachedAt > ttl) {
            store.delete(entry.url);
            deletedCount++;
          }
        });
        
        resolve(deletedCount);
      };

      getAllRequest.onerror = () => {
        resolve(0);
      };
    });
  } catch {
    return 0;
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  } catch {
    // Silently fail
  }
}

// Clean up expired cache entries on module load
if (typeof window !== 'undefined') {
  clearExpiredCache().catch(() => {});
}
