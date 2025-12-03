import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const DataContext = createContext();

// Custom hook with additional utilities
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Additional optimized hooks for specific use cases
export const useLinks = () => {
  const { links, loading } = useData();
  return useMemo(() => ({ links, loading }), [links, loading]);
};

export const useCareerPages = () => {
  const { careerPagesMap, loading } = useData();
  return useMemo(() => ({ careerPagesMap, loading }), [careerPagesMap, loading]);
};

export const useDataStats = () => {
  const { totalLinks, totalCareerPages, hasData, loading } = useData();
  return useMemo(() => ({ 
    totalLinks, 
    totalCareerPages, 
    hasData, 
    loading 
  }), [totalLinks, totalCareerPages, hasData, loading]);
};

export const DataProvider = ({ children }) => {
  const [links, setLinks] = useState([]);
  const [careerPagesMap, setCareerPagesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState(null);

  // Cache keys for localStorage
  const CACHE_KEYS = {
    links: 'career_data_links',
    careerPages: 'career_data_pages',
    timestamp: 'career_data_timestamp'
  };

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  const loadFromCache = useCallback(() => {
    try {
      const timestamp = localStorage.getItem(CACHE_KEYS.timestamp);
      const now = Date.now();
      
      if (timestamp && (now - parseInt(timestamp)) < CACHE_DURATION) {
        const cachedLinks = localStorage.getItem(CACHE_KEYS.links);
        const cachedPages = localStorage.getItem(CACHE_KEYS.careerPages);
        
        if (cachedLinks && cachedPages) {
          setLinks(JSON.parse(cachedLinks));
          setCareerPagesMap(JSON.parse(cachedPages));
          setDataFetched(true);
          setLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.warn('Cache loading failed:', error);
    }
    return false;
  }, []);

  const saveToCache = useCallback((linksData, pagesData) => {
    try {
      localStorage.setItem(CACHE_KEYS.links, JSON.stringify(linksData));
      localStorage.setItem(CACHE_KEYS.careerPages, JSON.stringify(pagesData));
      localStorage.setItem(CACHE_KEYS.timestamp, Date.now().toString());
    } catch (error) {
      console.warn('Cache saving failed:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (dataFetched) return;
    
    // Try to load from cache first
    if (loadFromCache()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Optimized queries with ordering for better performance
      const savedUrlsQuery = query(
        collection(db, "savedUrls"),
        orderBy("timestamp", "desc")
      );
      
      const careerPagesQuery = query(
        collection(db, "careerPages"),
        orderBy("timestamp", "desc")
      );

      // Fetch both collections in parallel to reduce database calls
      const [savedUrlsSnap, careerPagesSnap] = await Promise.all([
        getDocs(savedUrlsQuery),
        getDocs(careerPagesQuery)
      ]);

      // Optimize processing with single loops and early returns
      const savedUrls = [];
      const map = {};
      
      // Process savedUrls
      savedUrlsSnap.forEach((doc) => {
        const data = doc.data();
        if (data) { // Only process valid documents
          savedUrls.push({ id: doc.id, ...data });
        }
      });

      // Process careerPages
      careerPagesSnap.forEach((doc) => {
        const data = doc.data();
        if (data) { // Only process valid documents
          map[doc.id] = { id: doc.id, ...data };
        }
      });

      // Save to cache before updating state
      saveToCache(savedUrls, map);

      // Batch state updates to prevent multiple re-renders
      setLinks(savedUrls);
      setCareerPagesMap(map);
      setDataFetched(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [dataFetched, loadFromCache, saveToCache]);

  const refreshData = useCallback(() => {
    // Clear cache when refreshing
    try {
      localStorage.removeItem(CACHE_KEYS.links);
      localStorage.removeItem(CACHE_KEYS.careerPages);
      localStorage.removeItem(CACHE_KEYS.timestamp);
    } catch (error) {
      console.warn('Cache clearing failed:', error);
    }
    
    setDataFetched(false);
    setError(null);
    fetchData();
  }, [fetchData, CACHE_KEYS]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    links,
    careerPagesMap,
    loading,
    error,
    refreshData,
    dataFetched,
    // Computed values for better performance
    totalLinks: links.length,
    totalCareerPages: Object.keys(careerPagesMap).length,
    hasData: links.length > 0 || Object.keys(careerPagesMap).length > 0
  }), [links, careerPagesMap, loading, error, refreshData, dataFetched]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
