/**
 * IndexedDB service - lazy loaded when needed
 */

// Database name and version
const DB_NAME = 'boda-emergency-db';
const DB_VERSION = 1;

// Store names
export enum StoreNames {
  EMERGENCIES = 'emergencies',
  RESPONDERS = 'responders',
  PENDING_SYNC = 'pendingSyncRequests',
  CACHE = 'httpCache'
}

// Structure for pending sync requests
interface PendingSyncRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  createdAt: number;
  retryCount: number;
}

// Lazy database initialization - only when first used
let dbPromise: Promise<IDBDatabase> | null = null;

// Open or create the database only when needed
export async function openDatabase(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      // Create object stores on database upgrade
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(StoreNames.EMERGENCIES)) {
          const emergencyStore = db.createObjectStore(StoreNames.EMERGENCIES, { keyPath: 'id' });
          emergencyStore.createIndex('status', 'status', { unique: false });
          emergencyStore.createIndex('priority', 'priority', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(StoreNames.RESPONDERS)) {
          const responderStore = db.createObjectStore(StoreNames.RESPONDERS, { keyPath: 'id' });
          responderStore.createIndex('availability', 'availability', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(StoreNames.PENDING_SYNC)) {
          const pendingSyncStore = db.createObjectStore(StoreNames.PENDING_SYNC, { keyPath: 'id' });
          pendingSyncStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(StoreNames.CACHE)) {
          const cacheStore = db.createObjectStore(StoreNames.CACHE, { keyPath: 'url' });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }
  
  return dbPromise;
}

// Generic function to add item to a store
export async function addItem<T>(storeName: StoreNames, item: T): Promise<T> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(item);
  });
}

// Generic function to get item from a store
export async function getItem<T>(storeName: StoreNames, id: string): Promise<T | null> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

// Generic function to get all items from a store
export async function getAllItems<T>(storeName: StoreNames): Promise<T[]> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Generic function to delete item from a store
export async function deleteItem(storeName: StoreNames, id: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Clear all data in a store
export async function clearStore(storeName: StoreNames): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Add a pending sync request
export async function addPendingSyncRequest(request: Omit<PendingSyncRequest, 'id' | 'createdAt' | 'retryCount'>): Promise<string> {
  const syncRequest: PendingSyncRequest = {
    ...request,
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: Date.now(),
    retryCount: 0
  };
  
  await addItem(StoreNames.PENDING_SYNC, syncRequest);
  return syncRequest.id;
}

// Get all pending sync requests
export async function getPendingSyncRequests(): Promise<PendingSyncRequest[]> {
  return getAllItems<PendingSyncRequest>(StoreNames.PENDING_SYNC);
}

// Process pending sync requests when online
export async function processPendingSyncRequests(): Promise<void> {
  const pendingRequests = await getPendingSyncRequests();
  
  for (const request of pendingRequests) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers || { 'Content-Type': 'application/json' },
        body: request.body ? JSON.stringify(request.body) : undefined
      });
      
      if (response.ok) {
        // Request succeeded, remove from pending queue
        await deleteItem(StoreNames.PENDING_SYNC, request.id);
      } else {
        // Request failed, increment retry count
        const updatedRequest = {
          ...request,
          retryCount: request.retryCount + 1
        };
        
        // If too many retries, remove the request
        if (updatedRequest.retryCount >= 5) {
          await deleteItem(StoreNames.PENDING_SYNC, request.id);
        } else {
          await addItem(StoreNames.PENDING_SYNC, updatedRequest);
        }
      }
    } catch (error) {
      console.error('Error processing sync request:', error);
      // Will retry on next sync
    }
  }
}

// Cache HTTP response
export async function cacheResponse(url: string, response: any, expirySeconds: number = 3600): Promise<void> {
  const cacheItem = {
    url,
    response,
    expiry: Date.now() + (expirySeconds * 1000),
    cachedAt: Date.now()
  };
  
  await addItem(StoreNames.CACHE, cacheItem);
}

// Get cached response if not expired
export async function getCachedResponse<T>(url: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(StoreNames.CACHE, 'readonly');
      const store = transaction.objectStore(StoreNames.CACHE);
      const request = store.get(url);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cacheItem = request.result;
        
        if (!cacheItem || cacheItem.expiry < Date.now()) {
          resolve(null);
        } else {
          resolve(cacheItem.response);
        }
      };
    });
  } catch (error) {
    console.error('Error getting cached response:', error);
    return null;
  }
}

// Clean expired cache entries
export async function cleanExpiredCache(): Promise<void> {
  try {
    const db = await openDatabase();
    const now = Date.now();
    
    const transaction = db.transaction(StoreNames.CACHE, 'readwrite');
    const store = transaction.objectStore(StoreNames.CACHE);
    const index = store.index('expiry');
    const range = IDBKeyRange.upperBound(now);
    
    let cursor = await new Promise<IDBCursorWithValue | null>((resolve, reject) => {
      const request = index.openCursor(range);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    
    while (cursor) {
      store.delete(cursor.primaryKey);
      
      cursor = await new Promise<IDBCursorWithValue | null>((resolve, reject) => {
        cursor!.continue();
        transaction.oncomplete = () => resolve(null);
        transaction.onerror = () => reject(transaction.error);
      });
    }
  } catch (error) {
    console.error('Error cleaning expired cache:', error);
  }
}

// Initialize database only when explicitly called - not on startup
export async function initializeIndexedDB(): Promise<void> {
  try {
    await openDatabase();
    console.log('IndexedDB initialized on demand');
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
  }
}

// Export singleton instance
export default {
  openDatabase,
  addItem,
  getItem,
  getAllItems,
  deleteItem,
  clearStore,
  addPendingSyncRequest,
  getPendingSyncRequests,
  processPendingSyncRequests,
  cacheResponse,
  getCachedResponse,
  cleanExpiredCache,
  initializeIndexedDB
};
