import { useEffect, useRef } from "react";
import { useLiveQuery } from "@tanstack/react-db";
import type { Collection } from "@tanstack/react-db";
import { saveToIndexedDB } from "./indexeddb-cache";

/**
 * Hook to add IndexedDB persistence to a collection
 *
 * This hook:
 * 1. Loads cached data on mount and populates the collection
 * 2. Watches for changes and saves to IndexedDB (debounced)
 *
 * Usage:
 * ```tsx
 * const MyComponent = () => {
 *   useCollectionPersistence(todosCollection);
 *
 *   const { data: todos } = useLiveQuery(
 *     (q) => q.from({ todosCollection }),
 *     []
 *   );
 *   // ...
 * }
 * ```
 */
export function useCollectionPersistence<T extends object>(
  collection: Collection<T>
): void {
  const hasLoadedCache = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Watch collection data
  const { data } = useLiveQuery((q) => q.from({ collection }), [collection]);

  // Mark as loaded immediately - we'll rely solely on Electric for data, not cache hydration
  useEffect(() => {
    hasLoadedCache.current = true;
  }, []);

  // Save to IndexedDB when data changes (debounced)
  useEffect(() => {
    if (!hasLoadedCache.current || !data) return;

    // Debounced save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveToIndexedDB(collection.id, data).catch((error) => {
        console.warn(`Failed to persist ${collection.id}:`, error);
      });
    }, 2000); // Save 2 seconds after last change

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, collection]);
}
