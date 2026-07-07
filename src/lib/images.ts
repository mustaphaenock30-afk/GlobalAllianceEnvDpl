// Centralized image mapping utility to resolve image files to uncorrupted, high-resolution assets.
// We prioritize loading the local uncorrupted synchronized image files directly from `/images/`.

const DB_NAME = "image_cache_db";
const STORE_NAME = "images";

export interface CachedImage {
  filename: string;
  base64Data: string;
}

let dbInstance: IDBDatabase | null = null;
let isCacheInitialized = false;

// Global synchronous memory cache for fast image path resolving
const memoryCache = new Map<string, string>();

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not available"));
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "filename" });
      }
    };
    request.onsuccess = (e) => {
      dbInstance = (e.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };
    request.onerror = (e) => reject(request.error);
  });
}

export async function initLocalImageCache(): Promise<void> {
  if (isCacheInitialized || typeof window === "undefined") return;
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const results = request.result as CachedImage[];
        results.forEach((item) => {
          const clean = item.filename.toLowerCase();
          const mime = clean.endsWith(".png")
            ? "image/png"
            : clean.endsWith(".gif")
              ? "image/gif"
              : clean.endsWith(".svg")
                ? "image/svg+xml"
                : "image/jpeg";
          const dataUrl = `data:${mime};base64,${item.base64Data}`;
          memoryCache.set(clean, dataUrl);
        });
        isCacheInitialized = true;
        console.log(
          `[Cache] Initialized image memory cache with ${results.length} assets from IndexedDB`,
        );
        resolve();
      };
      request.onerror = () => {
        console.error("[Cache] Failed to load images from IndexedDB");
        resolve();
      };
    });
  } catch (err) {
    console.error("[Cache] IndexedDB error during initialization:", err);
  }
}

export async function saveImageToLocalDB(filename: string, base64Data: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Save to IndexedDB
    store.put({ filename, base64Data });

    // Update memory cache using lowercase name as key
    const clean = filename.toLowerCase();
    const mime = clean.endsWith(".png")
      ? "image/png"
      : clean.endsWith(".gif")
        ? "image/gif"
        : clean.endsWith(".svg")
          ? "image/svg+xml"
          : "image/jpeg";
    const dataUrl = `data:${mime};base64,${base64Data}`;
    memoryCache.set(clean, dataUrl);

    console.log(`[Cache] Saved ${filename} to local IndexedDB and memory cache.`);
  } catch (err) {
    console.error("[Cache] Failed to save image to IndexedDB:", err);
  }
}

export function getImgSrc(path: string): string {
  // If the path contains the full URL already, return it
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  const cleanFilename = path.replace(/^\/?(images\/)?/, "").toLowerCase();

  // Special Logo Resolution:
  // If the request is for Logo3.jpg (Main Logo), prioritize any custom synced logos from IndexedDB
  if (
    cleanFilename === "logo3.jpg" ||
    cleanFilename === "logo.jpg" ||
    cleanFilename === "logo2.jpg"
  ) {
    if (typeof window !== "undefined") {
      if (memoryCache.has("logo3.jpg")) return memoryCache.get("logo3.jpg")!;
      if (memoryCache.has("logo.jpg")) return memoryCache.get("logo.jpg")!;
      if (memoryCache.has("logo.png")) return memoryCache.get("logo.png")!;
      if (memoryCache.has("logo2.jpg")) return memoryCache.get("logo2.jpg")!;
    }
    // Default fallback if no custom synced logo is in the cache
    return "/images/logo.jpg";
  }

  // Check if we have a locally cached version in memory
  if (typeof window !== "undefined" && memoryCache.has(cleanFilename)) {
    return memoryCache.get(cleanFilename)!;
  }

  return `/images/${cleanFilename}`;
}
