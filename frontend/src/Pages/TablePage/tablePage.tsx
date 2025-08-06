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

const TablePage: React.FC = () => {
  const { careerPagesMap, loading: dataLoading, refreshData } = useData();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mappings, setMappings] = useState<{ [key: string]: string[] }>({});
  const [workValues, setWorkValues] = useState<WorkValue>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
  const handleRemovePage = async (pageId: string) => {
    const page = careerPages.find(p => p.id === pageId);
    if (!page) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete the page "${page.title || page.id}"?`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'careerPages', pageId));
      console.log('Page removed successfully:', pageId);
      // Note: The page will disappear from the list when DataContext refreshes
      alert('Page deleted successfully! It may take a moment to disappear from the list.');
    } catch (error) {
      console.error('Error removing page:', error);
      alert('Failed to remove page. Please try again.');
    }
  };

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
            <button 
              className="add-button"
              onClick={handleAddCategory}
              title="Add New Category"
            >
              <FaPlus />
            </button>
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
            <button 
              className="add-button"
              onClick={handleAddPage}
              title="Add New Page"
            >
              <FaPlus />
            </button>
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
              {Object.entries(workValues).map(([key, value]) => (
                <div key={key} className="table-row">
                  <div className="row-content">
                    <div className="row-title">
                      {Array.isArray(value) 
                        ? value.join(', ') 
                        : typeof value === 'object' 
                          ? JSON.stringify(value) 
                          : String(value)
                      }
                    </div>
                    <div className="row-subtitle">{key}</div>
                  </div>
                  <button 
                    className="remove-button"
                    onClick={() => handleRemoveMapping(key)}
                    title="Remove Item"
                  >
                    <FaMinus />
                  </button>
                </div>
              ))}
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
