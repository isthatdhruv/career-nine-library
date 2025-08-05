import { useState, useEffect, useCallback, useRef } from 'react';
import { dataManager, optimizedUtils } from '../utils/dataOptimization';

// Custom hook for optimized EditCareers functionality
export const useOptimizedEditCareers = () => {
  const [careers, setCareers] = useState([]);
  const [careerPages, setCareerPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const isMountedRef = useRef(true);
  const fetchAbortController = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => { 
      isMountedRef.current = false; 
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
      }
      dataManager.cleanup();
    };
  }, []);

  // Optimized data fetching
  const fetchOptimizedData = useCallback(async (forceRefresh = false) => {
    if (fetchAbortController.current) {
      fetchAbortController.current.abort();
    }
    
    fetchAbortController.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await dataManager.fetchCareerData(forceRefresh);
      
      if (!isMountedRef.current) return;
      
      setCareers(data.careers);
      setCareerPages(data.careerPages);
    } catch (error) {
      if (!isMountedRef.current) return;
      
      if (error.name !== 'AbortError') {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Debounced auto-save
  const debouncedAutoSave = useCallback(
    optimizedUtils.debounce(async (pageId, fieldName, value) => {
      if (!isMountedRef.current) return;
      
      try {
        // Only auto-save for existing pages, not new ones
        if (!pageId.startsWith('new_')) {
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          
          const pageDoc = doc(db, 'careerPages', pageId);
          await updateDoc(pageDoc, {
            [fieldName]: value,
            lastModified: new Date().toISOString()
          });
          
          console.log(`Auto-saved ${fieldName} for page ${pageId}`);
        }
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }, 2000),
    []
  );

  // Optimized batch save
  const batchSave = useCallback(async (updates) => {
    try {
      await dataManager.batchSave(updates);
      return true;
    } catch (error) {
      console.error('Batch save failed:', error);
      throw error;
    }
  }, []);

  return {
    careers,
    careerPages,
    loading,
    error,
    fetchOptimizedData,
    debouncedAutoSave,
    batchSave,
    setCareers,
    setCareerPages,
    setLoading,
    setError
  };
};

export default useOptimizedEditCareers;
