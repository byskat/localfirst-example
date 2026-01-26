/**
 * IndexedDB persistence for Electric collections
 *
 * This module provides IndexedDB caching for Electric sync data,
 * allowing instant initial load and offline resilience.
 */

const DB_NAME = "electric_cache";
const DB_VERSION = 1;
const STORE_NAME = "collections";

interface CachedData {
  collectionId: string;
  data: unknown[];
  timestamp: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Initialize IndexedDB connection
 */
function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = globalThis.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () =>
      reject(new Error(request.error?.message || "Failed to open IndexedDB"));
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "collectionId",
        });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });

  return dbPromise;
}

/**
 * Load cached data from IndexedDB
 */
export async function loadFromIndexedDB(
  collectionId: string
): Promise<unknown[] | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(collectionId);

      request.onerror = () =>
        reject(
          new Error(request.error?.message || "Failed to get from IndexedDB")
        );
      request.onsuccess = () => {
        const result = request.result as CachedData | undefined;
        if (result) {
          // Parse dates from ISO strings
          const data = JSON.parse(
            JSON.stringify(result.data),
            (_key, value) => {
              if (
                typeof value === "string" &&
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
              ) {
                return new Date(value);
              }
              return value;
            }
          );
          resolve(data);
        } else {
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.warn(`Failed to load from IndexedDB for ${collectionId}:`, error);
    return null;
  }
}

/**
 * Save data to IndexedDB
 */
export async function saveToIndexedDB(
  collectionId: string,
  data: unknown[]
): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      // Convert dates to ISO strings for storage
      const serializedData = JSON.parse(
        JSON.stringify(data, (_key, value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        })
      );

      const cacheEntry: CachedData = {
        collectionId,
        data: serializedData,
        timestamp: Date.now(),
      };

      const request = store.put(cacheEntry);

      request.onerror = () =>
        reject(
          new Error(request.error?.message || "Failed to save to IndexedDB")
        );
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn(`Failed to save to IndexedDB for ${collectionId}:`, error);
  }
}

/**
 * Clear all cached data
 */
export async function clearIndexedDB(): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () =>
        reject(
          new Error(request.error?.message || "Failed to clear IndexedDB")
        );
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn("Failed to clear IndexedDB:", error);
  }
}

/**
 * Delete a specific collection's cache
 */
export async function deleteFromIndexedDB(collectionId: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(collectionId);

      request.onerror = () =>
        reject(
          new Error(request.error?.message || "Failed to delete from IndexedDB")
        );
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn(`Failed to delete from IndexedDB for ${collectionId}:`, error);
  }
}
