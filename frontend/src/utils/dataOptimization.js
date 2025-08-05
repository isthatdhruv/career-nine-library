// Data optimization utilities for reducing Firebase costs and improving performance

import { collection, getDocs, query, orderBy, limit, where, onSnapshot, writeBatch, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Cache configuration
const CACHE_CONFIG = {
  // Cache duration in milliseconds
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  STORAGE_KEYS: {
    CAREER_PAGES: 'optimized_career_pages',
    SAVED_URLS: 'optimized_saved_urls',
    CAREERS_LIST: 'optimized_careers_list',
    LAST_FETCH: 'optimized_last_fetch',
    HASH: 'optimized_data_hash'
  }
};

// Memory-efficient data manager
class DataManager {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
    this.lastFetch = 0;
    this.isOnline = navigator.onLine;
    
    // Monitor online status
    window.addEventListener('online', () => { this.isOnline = true; });
    window.addEventListener('offline', () => { this.isOnline = false; });
  }

  // Generate hash for data integrity checking
  generateHash(data) {
    return btoa(JSON.stringify(data)).slice(0, 16);
  }

  // Check if cache is valid
  isCacheValid(key) {
    const lastFetch = localStorage.getItem(`${key}_timestamp`);
    if (!lastFetch) return false;
    
    const now = Date.now();
    return (now - parseInt(lastFetch)) < CACHE_CONFIG.CACHE_DURATION;
  }

  // Save to localStorage with compression
  saveToCache(key, data) {
    try {
      const compressed = JSON.stringify(data);
      const hash = this.generateHash(data);
      
      localStorage.setItem(key, compressed);
      localStorage.setItem(`${key}_timestamp`, Date.now().toString());
      localStorage.setItem(`${key}_hash`, hash);
      
      // Update memory cache
      this.cache.set(key, { data, timestamp: Date.now(), hash });
    } catch (error) {
      console.warn('Cache save failed:', error);
      this.clearOldCache(); // Try to free space
    }
  }

  // Load from cache with integrity check
  loadFromCache(key) {
    try {
      // Check memory cache first
      const memoryData = this.cache.get(key);
      if (memoryData && this.isCacheValid(key)) {
        return memoryData.data;
      }

      // Check localStorage
      if (!this.isCacheValid(key)) return null;

      const cached = localStorage.getItem(key);
      const hash = localStorage.getItem(`${key}_hash`);
      
      if (!cached || !hash) return null;

      const data = JSON.parse(cached);
      const currentHash = this.generateHash(data);
      
      // Verify integrity
      if (currentHash !== hash) {
        console.warn('Cache integrity check failed, clearing cache');
        this.clearCache(key);
        return null;
      }

      // Update memory cache
      this.cache.set(key, { data, timestamp: Date.now(), hash });
      return data;
    } catch (error) {
      console.warn('Cache load failed:', error);
      return null;
    }
  }

  // Clear specific cache
  clearCache(key) {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_timestamp`);
    localStorage.removeItem(`${key}_hash`);
    this.cache.delete(key);
  }

  // Clear old cache entries to free space
  clearOldCache() {
    Object.values(CACHE_CONFIG.STORAGE_KEYS).forEach(key => {
      if (!this.isCacheValid(key)) {
        this.clearCache(key);
      }
    });
  }

  // Optimized fetch with minimal reads
  async fetchCareerData(forceRefresh = false) {
    const cacheKey = CACHE_CONFIG.STORAGE_KEYS.CAREER_PAGES;
    
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh) {
      const cached = this.loadFromCache(cacheKey);
      if (cached) {
        console.log('📦 Using cached career data');
        return cached;
      }
    }

    console.log('🔄 Fetching fresh career data from Firestore');
    
    try {
      // Optimized queries with minimal reads
      const [careerPagesSnap, savedUrlsSnap] = await Promise.all([
        getDocs(query(
          collection(db, 'careerPages'),
          orderBy('timestamp', 'desc'),
          // limit(100) // Uncomment to limit initial load
        )),
        getDocs(query(
          collection(db, 'savedUrls'),
          orderBy('timestamp', 'desc'),
          // limit(100) // Uncomment to limit initial load
        ))
      ]);

      // Process data efficiently
      const careerPages = [];
      const savedUrls = [];
      const careers = new Set();

      // Single pass processing
      careerPagesSnap.forEach(doc => {
        const data = doc.data();
        if (data) {
          const pageData = { id: doc.id, ...data };
          careerPages.push(pageData);
          
          // Extract career from URL or direct field
          if (data.career) {
            careers.add(data.career);
          } else if (data.pageUrl) {
            try {
              const url = new URL(data.pageUrl);
              const pathParts = url.pathname.replace(/^\//, '').split('/');
              const clIdx = pathParts.findIndex(p => p === 'careerlibrary');
              if (clIdx !== -1 && pathParts[clIdx + 1]) {
                careers.add(pathParts[clIdx + 1]);
              }
            } catch (e) { /* ignore */ }
          }
        }
      });

      savedUrlsSnap.forEach(doc => {
        const data = doc.data();
        if (data) {
          savedUrls.push({ id: doc.id, ...data });
          
          // Extract career for completeness
          if (data.pageUrl) {
            try {
              const url = new URL(data.pageUrl);
              const pathParts = url.pathname.replace(/^\//, '').split('/');
              const clIdx = pathParts.findIndex(p => p === 'careerlibrary');
              if (clIdx !== -1 && pathParts[clIdx + 1]) {
                careers.add(pathParts[clIdx + 1]);
              }
            } catch (e) { /* ignore */ }
          }
        }
      });

      const result = {
        careerPages,
        savedUrls,
        careers: Array.from(careers),
        lastUpdated: Date.now()
      };

      // Cache the result
      this.saveToCache(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Try to return stale cache as fallback
      const staleCache = this.loadFromCache(cacheKey);
      if (staleCache) {
        console.warn('Using stale cache due to fetch error');
        return staleCache;
      }
      
      throw error;
    }
  }

  // Optimized save with batching
  async batchSave(updates) {
    if (!updates || updates.length === 0) return;

    // Group updates by collection
    const batches = new Map();
    const BATCH_SIZE = 500; // Firestore batch limit

    updates.forEach(update => {
      const collectionName = update.collection;
      if (!batches.has(collectionName)) {
        batches.set(collectionName, []);
      }
      batches.get(collectionName).push(update);
    });

    // Execute batches
    const promises = [];
    
    for (const [collectionName, collectionUpdates] of batches) {
      // Split into chunks of BATCH_SIZE
      for (let i = 0; i < collectionUpdates.length; i += BATCH_SIZE) {
        const chunk = collectionUpdates.slice(i, i + BATCH_SIZE);
        
        const batch = writeBatch(db);
        
        chunk.forEach(update => {
          const docRef = doc(db, collectionName, update.id);
          if (update.type === 'set') {
            batch.set(docRef, update.data);
          } else if (update.type === 'update') {
            batch.update(docRef, update.data);
          } else if (update.type === 'delete') {
            batch.delete(docRef);
          }
        });

        promises.push(batch.commit());
      }
    }

    await Promise.all(promises);
    
    // Invalidate cache after successful save
    this.clearCache(CACHE_CONFIG.STORAGE_KEYS.CAREER_PAGES);
  }

  // Setup real-time listeners for critical updates only
  setupOptimizedListeners(selectedCareer, callback) {
    if (!selectedCareer) return;

    const listenerId = `career_${selectedCareer}`;
    
    // Clean up existing listener
    if (this.listeners.has(listenerId)) {
      this.listeners.get(listenerId)();
      this.listeners.delete(listenerId);
    }

    // Only listen to pages for the selected career
    const q = query(
      collection(db, 'careerPages'),
      where('career', '==', selectedCareer),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const changes = [];
      snapshot.docChanges().forEach((change) => {
        changes.push({
          type: change.type,
          doc: { id: change.doc.id, ...change.doc.data() }
        });
      });

      if (changes.length > 0) {
        callback(changes);
        // Invalidate cache when data changes
        this.clearCache(CACHE_CONFIG.STORAGE_KEYS.CAREER_PAGES);
      }
    });

    this.listeners.set(listenerId, unsubscribe);
    return unsubscribe;
  }

  // Cleanup listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
    this.cache.clear();
  }

  // Get memory usage info
  getMemoryInfo() {
    const totalCacheSize = Array.from(this.cache.values())
      .reduce((size, item) => size + JSON.stringify(item.data).length, 0);
    
    return {
      cacheEntries: this.cache.size,
      totalSizeBytes: totalCacheSize,
      totalSizeMB: (totalCacheSize / (1024 * 1024)).toFixed(2),
      listeners: this.listeners.size
    };
  }
}

// Export singleton instance
export const dataManager = new DataManager();

// Utility functions
export const optimizedUtils = {
  // Debounce function for reducing unnecessary calls
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for rate limiting
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Memory-efficient deep clone
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => optimizedUtils.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      Object.keys(obj).forEach(key => {
        clonedObj[key] = optimizedUtils.deepClone(obj[key]);
      });
      return clonedObj;
    }
  },

  // Check if objects are equal (shallow)
  shallowEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => obj1[key] === obj2[key]);
  }
};

export default dataManager;
