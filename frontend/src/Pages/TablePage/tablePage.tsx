import React, { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaEdit } from 'react-icons/fa';
import { useData } from '../../contexts/DataContext';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, query, where, writeBatch, getDoc } from 'firebase/firestore';
import './tablePage.css';

// Type definitions
interface CareerPage {
  id: string;
  title?: string;
  categories?: string[];
  summary?: string;
  pageUrl?: string;
  timestamp?: any;
  [key: string]: any;
}

interface Category {
  id: string;
  slug: string;
  title: string;
  timestamp?: any;
}

interface WorkValue {
  [key: string]: any;
}

interface WorkValueEntry {
  key: string;
  value: any;
  assignedPages?: string[]; // Track which pages this work value is assigned to
}

const TablePage: React.FC = () => {
  const { careerPagesMap, loading: dataLoading, refreshData } = useData();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mappings, setMappings] = useState<{ [key: string]: string[] }>({});
  const [workValues, setWorkValues] = useState<WorkValue>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});
  const [selectedPagesForWorkValue, setSelectedPagesForWorkValue] = useState<{ [key: string]: string[] }>({});

  // Convert careerPagesMap to array for easier handling
  const careerPages: CareerPage[] = Object.values(careerPagesMap) as CareerPage[];

  // Filter and sort career pages based on selected category
  const getFilteredAndSortedPages = () => {
    if (!selectedCategory) {
      return careerPages;
    }

    const matchingPages: CareerPage[] = [];
    const nonMatchingPages: CareerPage[] = [];

    careerPages.forEach(page => {
      let hasCategory = false;
      
      // Check if page has the selected category in its categories array
      if (page.categories && page.categories.includes(selectedCategory)) {
        hasCategory = true;
      }
      
      // Also check if category can be extracted from pageUrl
      if (!hasCategory && page.pageUrl) {
        try {
          const url = new URL(page.pageUrl);
          const pathParts = url.pathname.replace(/^\//, '').split('/');
          const clIdx = pathParts.findIndex(p => p === 'careerlibrary');
          if (clIdx !== -1 && pathParts[clIdx + 1] === selectedCategory) {
            hasCategory = true;
          }
        } catch (e) {
          // Ignore URL parsing errors
        }
      }

      if (hasCategory) {
        matchingPages.push(page);
      } else {
        nonMatchingPages.push(page);
      }
    });

    // Return matching pages first, then non-matching pages
    return [...matchingPages, ...nonMatchingPages];
  };

  const sortedPages = getFilteredAndSortedPages();

  // Debug logging
  useEffect(() => {
    console.log('TablePage - Data loading status:', dataLoading);
    console.log('TablePage - Career pages map:', careerPagesMap);
    console.log('TablePage - Career pages array:', careerPages);
  }, [dataLoading, careerPagesMap]); // Use careerPagesMap instead of careerPages array

  // Fetch categories from Firestore on component mount
  useEffect(() => {
    // Only fetch categories after DataContext has loaded and we have careerPages data
    if (!dataLoading && Object.keys(careerPagesMap).length > 0 && categories.length === 0) {
      fetchCategories();
    }
  }, [dataLoading, careerPagesMap, categories.length]); // Add categories.length to prevent refetching

  // Fetch work values from Firestore
  useEffect(() => {
    if (!dataLoading && Object.keys(workValues).length === 0) {
      fetchWorkValues();
    }
  }, [dataLoading, workValues]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from a 'categories' collection first
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      
      if (!categoriesSnap.empty) {
        // Use categories from Firestore collection
        const fetchedCategories: Category[] = [];
        categoriesSnap.forEach((doc) => {
          fetchedCategories.push({ id: doc.id, ...doc.data() } as Category);
        });
        setCategories(fetchedCategories);
        console.log('Loaded categories from Firestore:', fetchedCategories.length);
      } else {
        console.log('No categories collection found, extracting from career pages...');
        // Extract unique categories from career pages if no categories collection exists
        const uniqueCategories = new Set<string>();
        
        console.log('Career pages available:', careerPages.length);
        
        careerPages.forEach(page => {
          if (page.categories) {
            page.categories.forEach(cat => uniqueCategories.add(cat));
          }
          // Also extract from pageUrl
          if (page.pageUrl) {
            try {
              const url = new URL(page.pageUrl);
              const pathParts = url.pathname.replace(/^\//, '').split('/');
              const clIdx = pathParts.findIndex(p => p === 'careerlibrary');
              if (clIdx !== -1 && pathParts[clIdx + 1]) {
                uniqueCategories.add(pathParts[clIdx + 1]);
              }
            } catch (e) {
              // Ignore URL parsing errors
            }
          }
        });

        const extractedCategories: Category[] = Array.from(uniqueCategories).map((cat, index) => ({
          id: `extracted_${index}`,
          slug: cat,
          title: cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        }));
        
        console.log('Extracted categories:', extractedCategories.length, extractedCategories);
        setCategories(extractedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkValues = async () => {
    try {
      console.log('Fetching work values from workValues/all-values...');
      
      // Fetch the all-values document from workValues collection
      const workValuesDocRef = doc(db, 'workValues', 'all-values');
      const workValuesDoc = await getDoc(workValuesDocRef);
      
      if (workValuesDoc.exists()) {
        const data = workValuesDoc.data();
        console.log('Work values data fetched:', data);
        setWorkValues(data);
      } else {
        console.log('No all-values document found in workValues collection');
        setWorkValues({});
      }
    } catch (error) {
      console.error('Error fetching work values:', error);
      setWorkValues({});
    }
  };

  // Handle category selection
  const handleCategorySelect = (categorySlug: string) => {
    if (selectedCategory === categorySlug) {
      // Deselect if clicking the same category
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categorySlug);
    }
  };

  // Handle adding new category
  const handleAddCategory = async () => {
    const title = prompt('Enter new category title:');
    if (!title) return;

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        title,
        slug,
        timestamp: new Date().toISOString()
      });
      
      const newCategory: Category = {
        id: docRef.id,
        title,
        slug,
        timestamp: new Date().toISOString()
      };
      
      setCategories(prev => [...prev, newCategory]);
      console.log('Category added successfully:', newCategory);
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category. Please try again.');
    }
  };

  // Handle removing category
  const handleRemoveCategory = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete the category "${category.title}"?`);
    if (!confirmDelete) return;

    try {
      if (categoryId.startsWith('extracted_')) {
        // Remove from local state only (extracted categories)
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      } else {
        // Delete from Firestore
        await deleteDoc(doc(db, 'categories', categoryId));
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      }
      console.log('Category removed successfully:', categoryId);
    } catch (error) {
      console.error('Error removing category:', error);
      alert('Failed to remove category. Please try again.');
    }
  };

  // Handle editing category
  const handleEditCategory = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    const newTitle = prompt('Enter new category title:', category.title);
    if (!newTitle || newTitle.trim() === '') return;
    if (newTitle === category.title) return; // No change

    const newSlug = newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const oldSlug = category.slug;

    console.log(`Editing category: "${oldSlug}" -> "${newSlug}"`);

    try {
      setLoading(true);

      // Check if new slug already exists
      const existingCategory = categories.find(cat => cat.slug === newSlug && cat.id !== categoryId);
      if (existingCategory) {
        alert('A category with this name already exists. Please choose a different name.');
        return;
      }

      if (categoryId.startsWith('extracted_')) {
        // For extracted categories, we need to:
        // 1. Update all pages that have the old slug to use the new slug
        // 2. Update the local state
        console.log('Updating extracted category and all related pages...');
        
        // Get all pages that have this category
        const pagesToUpdate = careerPages.filter(page => 
          page.categories && page.categories.includes(oldSlug)
        );

        console.log(`Found ${pagesToUpdate.length} pages to update`);

        // Update all pages in batch
        if (pagesToUpdate.length > 0) {
          const batch = writeBatch(db);
          
          pagesToUpdate.forEach(page => {
            const updatedCategories = page.categories!.map(cat => 
              cat === oldSlug ? newSlug : cat
            );
            const pageRef = doc(db, 'careerPages', page.id);
            batch.update(pageRef, { categories: updatedCategories });
          });

          await batch.commit();
          console.log(`Updated ${pagesToUpdate.length} pages with new category name`);
        }

        // Update local state
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, title: newTitle, slug: newSlug }
            : cat
        ));

      } else {
        // For Firestore categories, update the category document and all related pages
        console.log('Updating Firestore category and all related pages...');

        // Get all pages that have this category
        const pagesToUpdate = careerPages.filter(page => 
          page.categories && page.categories.includes(oldSlug)
        );

        console.log(`Found ${pagesToUpdate.length} pages to update`);

        // Create a batch for all updates
        const batch = writeBatch(db);

        // Update the category document
        const categoryRef = doc(db, 'categories', categoryId);
        batch.update(categoryRef, {
          title: newTitle,
          slug: newSlug,
          timestamp: new Date().toISOString()
        });

        // Update all pages that have this category
        pagesToUpdate.forEach(page => {
          const updatedCategories = page.categories!.map(cat => 
            cat === oldSlug ? newSlug : cat
          );
          const pageRef = doc(db, 'careerPages', page.id);
          batch.update(pageRef, { categories: updatedCategories });
        });

        // Commit all updates
        await batch.commit();
        console.log(`Updated category and ${pagesToUpdate.length} pages`);

        // Update local state
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, title: newTitle, slug: newSlug }
            : cat
        ));
      }

      // If the edited category was selected, update the selection
      if (selectedCategory === oldSlug) {
        setSelectedCategory(newSlug);
      }

      alert(`Successfully updated category "${oldSlug}" to "${newSlug}" and updated all related pages!`);
      
      // Refresh data to ensure UI is up to date
      refreshData();

    } catch (error) {
      console.error('Error editing category:', error);
      alert(`Failed to edit category. Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new page
  const handleAddPage = async () => {
    const title = prompt('Enter new page title:');
    if (!title) return;

    const pageUrl = prompt('Enter page URL (optional):') || '';
    const summary = prompt('Enter page summary (optional):') || '';
    
    try {
      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const docRef = await addDoc(collection(db, 'careerPages'), {
        title,
        summary,
        pageUrl,
        timestamp: new Date().toISOString()
      });
      
      console.log('Page added successfully with ID:', docRef.id);
      // Note: The page will appear in the list when DataContext refreshes
      alert('Page added successfully! It may take a moment to appear in the list.');
    } catch (error) {
      console.error('Error adding page:', error);
      alert('Failed to add page. Please try again.');
    }
  };

  // Handle removing page
  // const handleRemovePage = async (pageId: string) => {
  //   const page = careerPages.find(p => p.id === pageId);
  //   if (!page) return;

  //   const confirmDelete = window.confirm(`Are you sure you want to delete the page "${page.title || page.id}"?`);
  //   if (!confirmDelete) return;

  //   try {
  //     await deleteDoc(doc(db, 'careerPages', pageId));
  //     console.log('Page removed successfully:', pageId);
  //     // Note: The page will disappear from the list when DataContext refreshes
  //     alert('Page deleted successfully! It may take a moment to disappear from the list.');
  //   } catch (error) {
  //     console.error('Error removing page:', error);
  //     alert('Failed to remove page. Please try again.');
  //   }
  // };

  // Handle adding category to page
  const handleAddCategoryToPage = async (pageId: string) => {
    console.log('Add category button clicked for page:', pageId);
    console.log('Selected category:', selectedCategory);
    
    if (!selectedCategory) {
      alert('Please select a category first');
      return;
    }

    const page = careerPages.find(p => p.id === pageId);
    if (!page) {
      alert('Page not found');
      return;
    }

    console.log('Found page:', page);

    try {
      // Get current categories or initialize as empty array
      const currentCategories = page.categories || [];
      console.log('Current categories:', currentCategories);
      
      // Check if category is already added
      if (currentCategories.includes(selectedCategory)) {
        alert('This page already has the selected category');
        return;
      }

      // Add the new category
      const updatedCategories = [...currentCategories, selectedCategory];
      console.log('Updated categories:', updatedCategories);
      
      // Update the document in Firestore
      console.log('Attempting to update Firestore document...');
      await updateDoc(doc(db, 'careerPages', pageId), {
        categories: updatedCategories
      });

      console.log(`Added category "${selectedCategory}" to page "${page.title || pageId}"`);
      alert(`Successfully added category "${selectedCategory}" to page!`);
      
      // Refresh data to show changes immediately
      refreshData();
      
    } catch (error) {
      console.error('Error adding category to page:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Failed to add category to page. Error: ${error.message}`);
    }
  };

  // Handle removing category from page
  const handleRemoveCategoryFromPage = async (pageId: string, categoryToRemove: string) => {
    console.log('Remove category button clicked for page:', pageId, 'category:', categoryToRemove);
    
    const page = careerPages.find(p => p.id === pageId);
    if (!page) {
      alert('Page not found');
      return;
    }

    const confirmRemove = window.confirm(`Are you sure you want to remove the category "${categoryToRemove}" from this page?`);
    if (!confirmRemove) return;

    try {
      // Get current categories
      const currentCategories = page.categories || [];
      console.log('Current categories:', currentCategories);
      
      // Check if category exists
      if (!currentCategories.includes(categoryToRemove)) {
        alert('This category is not assigned to this page');
        return;
      }

      // Remove the category
      const updatedCategories = currentCategories.filter(cat => cat !== categoryToRemove);
      console.log('Updated categories:', updatedCategories);
      
      // Update the document in Firestore
      console.log('Attempting to update Firestore document...');
      await updateDoc(doc(db, 'careerPages', pageId), {
        categories: updatedCategories
      });

      console.log(`Removed category "${categoryToRemove}" from page "${page.title || pageId}"`);
      alert(`Successfully removed category "${categoryToRemove}" from page!`);
      
      // Refresh data to show changes immediately
      refreshData();
      
    } catch (error) {
      console.error('Error removing category from page:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Failed to remove category from page. Error: ${error.message}`);
    }
  };

  // Handle removing work value from page
  const handleRemoveWorkValueFromPage = async (pageId: string, workValueToRemove: string) => {
    console.log('Remove work value button clicked for page:', pageId, 'work value:', workValueToRemove);
    
    const page = careerPages.find(p => p.id === pageId);
    if (!page) {
      alert('Page not found');
      return;
    }

    const displayValue = resolveWorkValueDisplay(workValueToRemove);
    const confirmRemove = window.confirm(`Are you sure you want to remove the work value "${displayValue}" from this page?`);
    if (!confirmRemove) return;

    try {
      // Get current work values
      const currentValues = page.values || [];
      console.log('Current work values:', currentValues);
      
      // Check if work value exists
      if (!currentValues.includes(workValueToRemove)) {
        alert('This work value is not assigned to this page');
        return;
      }

      // Remove the work value
      const updatedValues = currentValues.filter(val => val !== workValueToRemove);
      console.log('Updated work values:', updatedValues);
      
      // Update the document in Firestore
      console.log('Attempting to update Firestore document...');
      await updateDoc(doc(db, 'careerPages', pageId), {
        values: updatedValues,
        lastModified: new Date().toISOString()
      });

      console.log(`Removed work value "${workValueToRemove}" from page "${page.title || pageId}"`);
      alert(`Successfully removed work value "${displayValue}" from page!`);
      
      // Refresh data to show changes immediately
      refreshData();
      
    } catch (error) {
      console.error('Error removing work value from page:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Failed to remove work value from page. Error: ${error.message}`);
    }
  };

  // Handle adding new work value
  const handleAddMapping = async () => {
    const key = prompt('Enter work value key:');
    if (!key || key.trim() === '') return;

    const value = prompt('Enter work value (for arrays, separate by commas):');
    if (!value || value.trim() === '') return;

    try {
      // Parse value - if it contains commas, treat as array
      let parsedValue: any = value.trim();
      if (value.includes(',')) {
        parsedValue = value.split(',').map(v => v.trim()).filter(v => v !== '');
      }

      // Update the workValues document
      const workValuesDocRef = doc(db, 'workValues', 'all-values');
      await updateDoc(workValuesDocRef, {
        [key.trim()]: parsedValue
      });

      console.log(`Added work value: ${key} = ${JSON.stringify(parsedValue)}`);
      
      // Update local state
      setWorkValues(prev => ({
        ...prev,
        [key.trim()]: parsedValue
      }));

      alert(`Successfully added work value "${key}"!`);
      
    } catch (error) {
      console.error('Error adding work value:', error);
      alert(`Failed to add work value. Error: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle removing work value
  const handleRemoveMapping = async (key: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the work value "${key}"?`);
    if (!confirmDelete) return;

    try {
      // Remove from Firestore by setting field to null (Firebase way to delete fields)
      const workValuesDocRef = doc(db, 'workValues', 'all-values');
      await updateDoc(workValuesDocRef, {
        [key]: null
      });

      console.log(`Removed work value: ${key}`);
      
      // Update local state
      setWorkValues(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });

      alert(`Successfully removed work value "${key}"!`);
      
    } catch (error) {
      console.error('Error removing work value:', error);
      alert(`Failed to remove work value. Error: ${error.message || 'Unknown error'}`);
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = (workValueKey: string) => {
    setOpenDropdowns(prev => {
      const isOpening = !prev[workValueKey];
      
      if (isOpening) {
        // When opening dropdown, initialize selection with pages that already have this work value
        const workValue = workValues[workValueKey];
        const actualValue = Array.isArray(workValue) ? workValue.join(', ') : String(workValue);
        const filteredPages = getFilteredPagesForCategory();
        
        const pagesWithValue = filteredPages
          .filter(page => page.values && (
            page.values.includes(actualValue) || 
            page.values.includes(workValueKey)
          ))
          .map(page => page.id);
        
        setSelectedPagesForWorkValue(prevSelection => ({
          ...prevSelection,
          [workValueKey]: pagesWithValue
        }));
      }
      
      return {
        ...prev,
        [workValueKey]: isOpening
      };
    });
  };

  // Handle page selection for work value
  const handlePageSelectionForWorkValue = (workValueKey: string, pageId: string) => {
    setSelectedPagesForWorkValue(prev => {
      const currentSelection = prev[workValueKey] || [];
      const isSelected = currentSelection.includes(pageId);
      
      const updatedSelection = isSelected
        ? currentSelection.filter(id => id !== pageId)
        : [...currentSelection, pageId];
      
      return {
        ...prev,
        [workValueKey]: updatedSelection
      };
    });
  };

  // Apply work value to selected pages (Save Changes Logic)
  const handleApplyWorkValueToPages = async (workValueKey: string) => {
    const selectedPages = selectedPagesForWorkValue[workValueKey] || [];
    const workValue = workValues[workValueKey];
    if (!workValue) {
      alert('Work value not found.');
      return;
    }

    const actualValue = Array.isArray(workValue) ? workValue.join(', ') : String(workValue);
    const filteredPages = getFilteredPagesForCategory();
    
    // Separate pages into those that should have the work value and those that shouldn't
    const pagesToAdd: string[] = [];
    const pagesToRemove: string[] = [];
    
    filteredPages.forEach(page => {
      const hasWorkValue = page.values && (
        page.values.includes(actualValue) || 
        page.values.includes(workValueKey)
      );
      const isSelected = selectedPages.includes(page.id);
      
      if (isSelected && !hasWorkValue) {
        // Page is selected but doesn't have the work value - add it
        pagesToAdd.push(page.id);
      } else if (!isSelected && hasWorkValue) {
        // Page is not selected but has the work value - remove it
        pagesToRemove.push(page.id);
      }
    });

    if (pagesToAdd.length === 0 && pagesToRemove.length === 0) {
      alert('No changes to save.');
      return;
    }

    const confirmMessage: string[] = [];
    if (pagesToAdd.length > 0) {
      confirmMessage.push(`Add work value to ${pagesToAdd.length} pages`);
    }
    if (pagesToRemove.length > 0) {
      confirmMessage.push(`Remove work value from ${pagesToRemove.length} pages`);
    }
    
    const confirmSave = window.confirm(
      `Save changes?\n\n${confirmMessage.join('\n')}`
    );
    if (!confirmSave) return;

    try {
      const batch = writeBatch(db);
      
      // Add work value to selected pages that don't have it
      pagesToAdd.forEach(pageId => {
        const pageRef = doc(db, 'careerPages', pageId);
        const page = careerPages.find(p => p.id === pageId);
        const currentValues = page?.values || [];
        
        // Add the actual value
        const updatedValues = [...currentValues, actualValue];
        batch.update(pageRef, {
          values: updatedValues,
          lastModified: new Date().toISOString()
        });
      });
      
      // Remove work value from unselected pages that have it
      pagesToRemove.forEach(pageId => {
        const pageRef = doc(db, 'careerPages', pageId);
        const page = careerPages.find(p => p.id === pageId);
        const currentValues = page?.values || [];
        
        // Remove both the actual value and the old key if they exist
        const updatedValues = currentValues.filter(val => 
          val !== actualValue && val !== workValueKey
        );
        
        batch.update(pageRef, {
          values: updatedValues,
          lastModified: new Date().toISOString()
        });
      });

      await batch.commit();
      
      const totalChanges = pagesToAdd.length + pagesToRemove.length;
      console.log(`Applied changes to ${totalChanges} pages for work value "${actualValue}"`);
      alert(`Successfully saved changes to ${totalChanges} pages!`);
      
      // Clear selection and close dropdown
      setSelectedPagesForWorkValue(prev => ({
        ...prev,
        [workValueKey]: []
      }));
      setOpenDropdowns(prev => ({
        ...prev,
        [workValueKey]: false
      }));
      
      // Refresh data to show changes
      refreshData();
      
    } catch (error) {
      console.error('Error saving work value changes:', error);
      alert(`Failed to save changes. Error: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle removing work value from selected pages
  const handleRemoveWorkValueFromPages = async (workValueKey: string) => {
    const workValue = workValues[workValueKey];
    if (!workValue) {
      alert('Work value not found.');
      return;
    }

    const actualValue = Array.isArray(workValue) ? workValue.join(', ') : String(workValue);
    const filteredPages = getFilteredPagesForCategory();
    
    // Find pages that have this work value (either as actual value or old key)
    const pagesWithValue = filteredPages.filter(page => 
      page.values && (
        page.values.includes(actualValue) || 
        page.values.includes(workValueKey)
      )
    );

    if (pagesWithValue.length === 0) {
      alert('No pages in this category have this work value.');
      return;
    }

    const confirmRemove = window.confirm(
      `Are you sure you want to remove the work value "${actualValue}" from ${pagesWithValue.length} pages in the "${selectedCategory}" category?`
    );
    if (!confirmRemove) return;

    try {
      const batch = writeBatch(db);
      
      pagesWithValue.forEach(page => {
        const pageRef = doc(db, 'careerPages', page.id);
        const currentValues = page.values || [];
        
        // Remove both the actual value and the old key if they exist
        const updatedValues = currentValues.filter(val => 
          val !== actualValue && val !== workValueKey
        );
        
        batch.update(pageRef, {
          values: updatedValues,
          lastModified: new Date().toISOString()
        });
      });

      await batch.commit();
      
      console.log(`Removed work value "${actualValue}" from ${pagesWithValue.length} pages`);
      alert(`Successfully removed work value "${actualValue}" from ${pagesWithValue.length} pages!`);
      
      // Refresh data to show changes
      refreshData();
      
    } catch (error) {
      console.error('Error removing work value from pages:', error);
      alert(`Failed to remove work value from pages. Error: ${error.message || 'Unknown error'}`);
    }
  };

  // Helper function to resolve work value display text
  const resolveWorkValueDisplay = (value: string) => {
    // If the value is a key that exists in workValues, return the actual work value
    if (workValues[value]) {
      const workValue = workValues[value];
      return Array.isArray(workValue) ? workValue.join(', ') : String(workValue);
    }
    // Otherwise, return the value as is (it's already an actual work value)
    return value;
  };

  // Get filtered pages for the selected category
  const getFilteredPagesForCategory = () => {
    if (!selectedCategory) return [];
    
    return careerPages.filter(page => {
      // Check if page has the selected category in its categories array
      if (page.categories && page.categories.includes(selectedCategory)) {
        return true;
      }
      
      // Also check if category can be extracted from pageUrl
      if (page.pageUrl) {
        try {
          const url = new URL(page.pageUrl);
          const pathParts = url.pathname.replace(/^\//, '').split('/');
          const clIdx = pathParts.findIndex(p => p === 'careerlibrary');
          return clIdx !== -1 && pathParts[clIdx + 1] === selectedCategory;
        } catch (e) {
          return false;
        }
      }
      
      return false;
    });
  };
  

  if (dataLoading || loading) {
    return (
      <div className="table-page-loading">
        <div className="loading-spinner">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="table-page">
      <div className="table-page-header">
        <h1>Category & Page Management</h1>
        <p>Manage categories and pages for the career library</p>
      </div>

      <div className="tables-container">
        {/* Categories Table */}
        <div className="table-section">
          <div className="table-header">
            <h3>Categories</h3>
            {/* <button 
              className="add-button"
              onClick={handleAddCategory}
              title="Add New Category"
            >
              <FaPlus />
            </button> */}
          </div>
          <div className="table-wrapper">
            <div className="table-content">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className={`table-row ${selectedCategory === category.slug ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(category.slug)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="row-content">
                    <div className="row-title">{category.title}</div>
                    <div className="row-subtitle">{category.slug}</div>
                  </div>
                  <div className="row-actions">
                    <button 
                      className="edit-button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering row click
                        handleEditCategory(category.id);
                      }}
                      title="Edit Category"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="remove-button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering row click
                        handleRemoveCategory(category.id);
                      }}
                      title="Remove Category"
                    >
                      <FaMinus />
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="empty-state">
                  <p>No categories found</p>
                  <p>Use the + button to create new categories</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Career Pages Table */}
        <div className="table-section">
          <div className="table-header">
            <h3>
              Career Pages
              {selectedCategory && (
                <span className="filter-indicator">
                  (Filtered by: {selectedCategory})
                </span>
              )}
            </h3>
            {/* <button 
              className="add-button"
              onClick={handleAddPage}
              title="Add New Page"
            >
              <FaPlus />
            </button> */}
          </div>
          <div className="table-wrapper">
            <div className="table-content">
              {sortedPages.map((page) => {
                // Check if this page matches the selected category
                const isMatching = selectedCategory && (
                  (page.categories && page.categories.includes(selectedCategory)) ||
                  (page.pageUrl && (() => {
                    try {
                      const url = new URL(page.pageUrl);
                      const pathParts = url.pathname.replace(/^\//, '').split('/');
                      const clIdx = pathParts.findIndex(p => p === 'careerlibrary');
                      return clIdx !== -1 && pathParts[clIdx + 1] === selectedCategory;
                    } catch (e) {
                      return false;
                    }
                  })())
                );

                return (
                  <div 
                    key={page.id} 
                    className={`table-row ${isMatching ? 'highlighted' : ''}`}
                  >
                    <div className="row-content">
                      <div className="row-title">{page.title || 'Untitled'}</div>
                      <div className="row-subtitle">{page.id}</div>
                      {page.categories && page.categories.length > 0 && (
                        <div className="row-tags">
                          {page.categories.map((cat: string, index: number) => (
                            <span 
                              key={index} 
                              className={`tag ${cat === selectedCategory ? 'selected-tag' : ''}`}
                            >
                              {cat}
                              {/* Show remove button only for the selected category */}
                              {cat === selectedCategory && (
                                <button
                                  className="tag-remove-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCategoryFromPage(page.id, cat);
                                  }}
                                  title={`Remove "${cat}" category`}
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Show work values if any are applied */}
                      {page.values && page.values.length > 0 && (
                        <div className="row-tags" style={{ marginTop: '4px' }}>
                          <span style={{ 
                            fontSize: '10px', 
                            color: '#6b7280', 
                            marginRight: '4px' 
                          }}>
                            Work Values:
                          </span>
                          {page.values.slice(0, 3).map((value: string, index: number) => {
                            const displayValue = resolveWorkValueDisplay(value);
                            return (
                              <span 
                                key={index} 
                                style={{
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  fontSize: '10px',
                                  marginRight: '4px',
                                  border: '1px solid #bae6fd',
                                  position: 'relative',
                                  paddingRight: '16px'
                                }}
                              >
                                {displayValue.length > 20 ? displayValue.substring(0, 20) + '...' : displayValue}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveWorkValueFromPage(page.id, value);
                                  }}
                                  style={{
                                    position: 'absolute',
                                    right: '2px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#0369a1',
                                    fontSize: '8px',
                                    cursor: 'pointer',
                                    padding: '0',
                                    width: '10px',
                                    height: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  title={`Remove "${displayValue}" from this page`}
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                          {page.values.length > 3 && (
                            <span style={{ 
                              fontSize: '10px', 
                              color: '#6b7280' 
                            }}>
                              +{page.values.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="row-actions">
                      {/* Show Add button only when a category is selected and page doesn't have that category */}
                      {selectedCategory && !isMatching && (
                        <button 
                          className="add-category-button"
                          onClick={() => handleAddCategoryToPage(page.id)}
                          title={`Add "${selectedCategory}" to this page`}
                        >
                          <FaPlus />
                        </button>
                      )}
                      {/* <button 
                        className="remove-button"
                        onClick={() => handleRemovePage(page.id)}
                        title="Remove Page"
                      >
                        <FaMinus />
                      </button> */}
                    </div>
                  </div>
                );
              })}
              {sortedPages.length === 0 && (
                <div className="empty-state">
                  <p>No career pages found</p>
                  <p>Use the + button to create new pages</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Work Values Table (Third Table) */}
        <div className="table-section">
          <div className="table-header">
            <h3>Work Values</h3>
            {selectedCategory && (
              <span className="filter-indicator">
                (Apply to: {selectedCategory} pages)
              </span>
            )}
            <button 
              className="add-button"
              onClick={handleAddMapping}
              title="Add New Item"
            >
              <FaPlus />
            </button>
          </div>
          <div className="table-wrapper">
            <div className="table-content">
              {Object.entries(workValues).map(([key, value]) => {
                const filteredPages = getFilteredPagesForCategory();
                const selectedPages = selectedPagesForWorkValue[key] || [];
                const isDropdownOpen = openDropdowns[key] || false;
                
                return (
                  <div key={key} className="table-row">
                    <div className="row-content">
                      <div className="row-title">{value}</div>
                      <div className="row-subtitle">
                        {Array.isArray(value) 
                          ? value.join(', ') 
                          : typeof value === 'object' 
                            ? JSON.stringify(value) 
                            : String(value)
                        }
                      </div>
                      
                      {/* Page Selection Dropdown */}
                      {selectedCategory && filteredPages.length > 0 && (
                        <div className="work-value-assignment" style={{ marginTop: '8px' }}>
                          <div className="dropdown-container" style={{ position: 'relative', display: 'inline-block' }}>
                            {(() => {
                              const workValue = workValues[key];
                              const actualValue = Array.isArray(workValue) ? workValue.join(', ') : String(workValue);
                              const pagesWithValue = filteredPages.filter(page => 
                                page.values && (
                                  page.values.includes(actualValue) || // Check for actual value
                                  page.values.includes(key) // Check for old key
                                )
                              ).length;
                              
                              return (
                                <button
                                  onClick={() => toggleDropdown(key)}
                                  style={{
                                    background: selectedPages.length > 0 ? '#10b981' : '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  Select Pages ({selectedPages.length}/{filteredPages.length}) 
                                  {pagesWithValue > 0 && (
                                    <span style={{ 
                                      fontSize: '10px', 
                                      background: '#10b981', 
                                      padding: '1px 4px', 
                                      borderRadius: '3px',
                                      marginLeft: '4px'
                                    }}>
                                      {pagesWithValue} applied
                                    </span>
                                  )}
                                  <span style={{ fontSize: '10px' }}>
                                    {isDropdownOpen ? '▲' : '▼'}
                                  </span>
                                </button>
                              );
                            })()}
                            
                            {isDropdownOpen && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                background: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                zIndex: 1000,
                                minWidth: '250px',
                                maxHeight: '200px',
                                overflowY: 'auto'
                              }}>
                                <div style={{ padding: '8px' }}>
                                  <div style={{ 
                                    fontSize: '12px', 
                                    fontWeight: '600', 
                                    color: '#374151', 
                                    marginBottom: '6px' 
                                  }}>
                                    Select pages from {selectedCategory}:
                                  </div>
                                  
                                  {filteredPages.map(page => {
                                    const workValue = workValues[key];
                                    const actualValue = Array.isArray(workValue) ? workValue.join(', ') : String(workValue);
                                    const hasWorkValue = page.values && (
                                      page.values.includes(actualValue) || // Check for actual value
                                      page.values.includes(key) // Check for old key
                                    );
                                    const isSelected = selectedPages.includes(page.id);
                                    
                                    return (
                                      <label
                                        key={page.id}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          padding: '4px 0',
                                          cursor: 'pointer',
                                          fontSize: '12px'
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => handlePageSelectionForWorkValue(key, page.id)}
                                          style={{ marginRight: '6px' }}
                                        />
                                        <span style={{ 
                                          color: hasWorkValue ? '#10b981' : (isSelected ? '#10b981' : '#374151'),
                                          fontWeight: (hasWorkValue || isSelected) ? '600' : 'normal'
                                        }}>
                                          {page.title || page.id}
                                          {hasWorkValue && (
                                            <span style={{ 
                                              marginLeft: '6px', 
                                              fontSize: '10px', 
                                              color: '#10b981',
                                              fontWeight: '600'
                                            }}>
                                              ✓ Currently Applied
                                            </span>
                                          )}
                                        </span>
                                      </label>
                                    );
                                  })}
                                  
                                  <div style={{ 
                                    borderTop: '1px solid #e5e7eb', 
                                    marginTop: '6px', 
                                    paddingTop: '6px',
                                    display: 'flex',
                                    gap: '6px',
                                    flexDirection: 'column'
                                  }}>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <button
                                        onClick={() => handleApplyWorkValueToPages(key)}
                                        style={{
                                          background: '#10b981',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          padding: '4px 8px',
                                          fontSize: '11px',
                                          cursor: 'pointer',
                                          flex: 1
                                        }}
                                      >
                                        Save Changes
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedPagesForWorkValue(prev => ({
                                            ...prev,
                                            [key]: []
                                          }));
                                        }}
                                        style={{
                                          background: '#6b7280',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          padding: '4px 8px',
                                          fontSize: '11px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Clear
                                      </button>
                                    </div>
                                    {(() => {
                                      const workValue = workValues[key];
                                      const actualValue = Array.isArray(workValue) ? workValue.join(', ') : String(workValue);
                                      const pagesWithValue = filteredPages.filter(page => 
                                        page.values && (
                                          page.values.includes(actualValue) || 
                                          page.values.includes(key)
                                        )
                                      ).length;
                                      
                                      if (pagesWithValue > 0) {
                                        return (
                                          <button
                                            onClick={() => handleRemoveWorkValueFromPages(key)}
                                            style={{
                                              background: '#ef4444',
                                              color: 'white',
                                              border: 'none',
                                              borderRadius: '4px',
                                              padding: '4px 8px',
                                              fontSize: '11px',
                                              cursor: 'pointer',
                                              width: '100%'
                                            }}
                                          >
                                            Remove from {pagesWithValue} pages
                                          </button>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {!selectedCategory && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280', 
                          marginTop: '4px',
                          fontStyle: 'italic'
                        }}>
                          Select a category to assign this work value to pages
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveMapping(key)}
                      title="Remove Item"
                    >
                      <FaMinus />
                    </button>
                  </div>
                );
              })}
              {Object.keys(workValues).length === 0 && (
                <div className="empty-state">
                  <p>No work values found</p>
                  <p>Data is fetched from workValues/all-values document</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePage;
