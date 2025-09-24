import React, { useState, useEffect } from "react";
import { FaChevronDown, FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./CareerLibrary.css";
import Footer from "../../components/Footer";

// Static categories based on the scraped URLs structure
const categories = [
  { slug: "actuarial-sciences", title: "Actuarial Sciences" },
  { slug: "allied-medicine", title: "Allied Medicine" },
  { slug: "animation-graphics", title: "Animation & Graphics" },
  { slug: "applied-arts", title: "Applied Arts" },
  { slug: "architecture", title: "Architecture" },
  { slug: "aviation", title: "Aviation" },
  { slug: "cabin-crew", title: "Cabin Crew" },
  { slug: "civil-services", title: "Civil Services" },
  { slug: "commerce-accounts", title: "Commerce & Accounts" },
  { slug: "computer-application-it", title: "Computer Application & IT" },
  { slug: "culinary-arts", title: "Culinary Arts" },
  { slug: "data-science-artificial-intelligence", title: "Data Science & AI" },
  { slug: "defense", title: "Defense" },
  { slug: "design", title: "Design" },
  { slug: "distribution-logistics", title: "Distribution & Logistics" },
  { slug: "economics", title: "Economics" },
  { slug: "education-training", title: "Education & Training" },
  { slug: "engineering", title: "Engineering" },
  { slug: "entrepreneurship", title: "Entrepreneurship" },
  { slug: "ethical-hacking", title: "Ethical Hacking" },
  { slug: "film-making", title: "Film Making" },
  { slug: "finance-banking", title: "Finance & Banking" },
  { slug: "food-agriculture", title: "Food & Agriculture" },
  { slug: "geography", title: "Geography" },
  { slug: "hotel-management", title: "Hotel Management" },
  { slug: "international-relations", title: "International Relations" },
  { slug: "language", title: "Language" },
  { slug: "law", title: "Law" },
  { slug: "life-science-environment", title: "Life Science & Environment" },
  { slug: "management", title: "Management" },
  { slug: "marketing-advertising", title: "Marketing & Advertising" },
  { slug: "maths-statistics", title: "Maths & Statistics" },
  { slug: "media-communication", title: "Media & Communication" },
  { slug: "medicine", title: "Medicine" },
  { slug: "merchant-navy", title: "Merchant Navy" },
  { slug: "museology", title: "Museology" },
  { slug: "nutrition-fitness", title: "Nutrition & Fitness" },
  { slug: "performing-arts", title: "Performing Arts" },
  { slug: "physical-science", title: "Physical Science" },
  { slug: "political-science", title: "Political Science" },
  { slug: "psychology", title: "Psychology" },
  { slug: "sales", title: "Sales" },
  { slug: "social-sciences-humanities", title: "Social Sciences & Humanities" },
  { slug: "social-services", title: "Social Services" }
];

type Career = {
  id: string;
  title: string;
  category: string;
  slug: string;
  url: string;
  summary: string;
  source: string;
  hasDetailedData: boolean;
  [key: string]: any; // To allow additional properties from ...data
};

const CareerLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Helper function to extract category from URL
  const extractCategoryFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.replace(/^\//, '').split('/');
      const clIdx = pathParts.findIndex(p => p === 'careerlibrary');
      if (clIdx !== -1 && pathParts[clIdx + 1]) {
        return pathParts[clIdx + 1];
      }
    } catch (e) {
      console.warn('Could not parse URL:', url);
    }
    return 'uncategorized';
  };

  // Helper function to extract career title from URL
  const extractTitleFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.replace(/^\//, '').split('/');
      const lastPart = pathParts[pathParts.length - 1];
      
      // Convert URL slug to title
      return lastPart
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .replace(/\s+/g, ' ')
        .trim();
    } catch (e) {
      return 'Unknown Career';
    }
  };

  // Helper function to generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Fetch all career data in a single optimized request
  useEffect(() => {
    const fetchAllCareerData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching career data from Firebase...');

        // Fetch both collections in parallel for optimization
        const [careerPagesSnap, savedUrlsSnap] = await Promise.all([
          getDocs(collection(db, 'careerPages')),
          getDocs(collection(db, 'savedUrls'))
        ]);

        const allCareers: Career[] = [];
        const processedUrls = new Set(); // To avoid duplicates

        // Process career pages first (these have more detailed data)
        careerPagesSnap.forEach(doc => {
          const data = doc.data();
          const url = data.url || data.pageUrl;
          
          if (url) {
            processedUrls.add(url);
            
            const category = extractCategoryFromUrl(url);
            const title = data.title || extractTitleFromUrl(url);
            
            allCareers.push({
              id: doc.id,
              title: title,
              category: category,
              slug: generateSlug(title),
              url: url,
              summary: data.summary || '',
              source: 'careerPages',
              hasDetailedData: true,
              ...data
            });
          }
        });

        // Process saved URLs (for careers not in careerPages)
        savedUrlsSnap.forEach(doc => {
          const data = doc.data();
          
          // Handle different data structures in savedUrls
          let urlsToProcess: string[] = [];
          
          if (typeof data === 'string') {
            urlsToProcess = [data];
          } else if (data.url) {
            urlsToProcess = [data.url];
          } else if (data.pageUrl) {
            urlsToProcess = [data.pageUrl];
          } else if (data.urls && Array.isArray(data.urls)) {
            urlsToProcess = data.urls as string[];
          } else if (data.links && Array.isArray(data.links)) {
            urlsToProcess = data.links.map((link: any) => link.url || link.pageUrl || link).filter(Boolean);
          }

          urlsToProcess.forEach(url => {
            if (url && !processedUrls.has(url)) {
              processedUrls.add(url);
              
              const category = extractCategoryFromUrl(url);
              const title = extractTitleFromUrl(url);
              
              allCareers.push({
                id: `saved-${generateSlug(title)}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: title,
                category: category,
                slug: generateSlug(title),
                url: url,
                summary: `Explore career opportunities in ${title}. Learn about requirements, skills, and growth prospects in this field.`,
                source: 'savedUrls',
                hasDetailedData: false
              });
            }
          });
        });

        console.log(`✅ Loaded ${allCareers.length} careers from ${processedUrls.size} unique URLs`);
        console.log('📊 Career sources:', {
          careerPages: allCareers.filter(c => c.source === 'careerPages').length,
          savedUrls: allCareers.filter(c => c.source === 'savedUrls').length
        });

        setCareers(allCareers);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching career data:', err);
        setError('Failed to fetch career data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllCareerData();
  }, []);

  // Helper functions for career filtering and counting
  const getCareersByCategory = (categorySlug) => {
    return careers.filter(career => career.category === categorySlug);
  };

  const getCategoriesWithCareerCount = () => {
    console.log(careers)
    const categoryCounts = {};
    careers.forEach(career => {
      categoryCounts[career.category] = (categoryCounts[career.category] || 0) + 1;
    });
    return categoryCounts;
  };

  const getCategoryCareerCount = (categorySlug) => {
    return getCareersByCategory(categorySlug).length;
  };

  // Update filtered categories when careers, search term, or sort changes
  useEffect(() => {
    const categoryCounts = getCategoriesWithCareerCount();
    console.log('Category counts:', categoryCounts);
    let filtered = categories.filter(category => {
      // Only show categories that have careers
      const hasCareers = categoryCounts[category.slug] > 0;
      
      // Filter by search term
      const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      return hasCareers && matchesSearch;
    });

    // Sort categories
    filtered = filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      } else {
        // Sort by popularity (number of careers in category)
        const aCount = categoryCounts[a.slug] || 0;
        const bCount = categoryCounts[b.slug] || 0;
        return bCount - aCount;
      }
    });
    console.log(filtered)
    setFilteredCategories(filtered);
  }, [searchTerm, sortBy, careers]);

  if (loading) {
    return (
      <div className="cl-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>Loading careers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cl-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cl-page">
      {/* Header */}
      <header className="cl-header">
        <img
          src="/images/logo-mindler.svg"
          alt="Career-9"
          className="cl-logo"
        />
        <nav className="cl-nav">
          {["For Students", "For Institutions", "For Career Professionals", "Resources"].map(label => (
            <div key={label} className="cl-nav-item">
              {label} <FaChevronDown size={12} />
            </div>
          ))}
        </nav>
        <div className="cl-cta">
          <button className="cl-btn-primary">Get Started</button>
          <button className="cl-login" style={{ background: 'none', border: 'none', color: '#007cba', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Log In</button>
        </div>
      </header>

      {/* Banner */}
      <section className="cl-banner">
        <div className="cl-banner-content">
          <h1>Career Library</h1>
        </div>
      </section>

      {/* Search */}
      <section className="cl-search">
        <h2>What career are you looking for?</h2>
        <p className="career-stats">
          Explore {careers.length} careers across {categories.length} categories
        </p>
        <div className="cl-search-bar">
          <input
            type="text"
            placeholder="Search for information on 200+ career options"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button>Search</button>
        </div>
      </section>

      {/* Sort */}
      <section className="cl-sort">
        <span>Sort By:</span>
        <button
          className={sortBy === "name" ? "active" : ""}
          onClick={() => setSortBy("name")}
        >
          Name
        </button>
        <button
          className={sortBy === "popularity" ? "active" : ""}
          onClick={() => setSortBy("popularity")}
        >
          Popularity
        </button>
      </section>

      {/* Grid */}
      <section className="cl-grid">
        {selectedCategory ? (
          // Show careers in selected category
          <div className="category-careers">
            <div className="category-header">
              <button 
                className="back-btn" 
                onClick={() => setSelectedCategory("")}
              >
                ← Back to Categories
              </button>
              <h2>
                {categories.find(cat => cat.slug === selectedCategory)?.title} Careers
              </h2>
            </div>
            <div className="careers-grid">
              {getCareersByCategory(selectedCategory).map(career => (
                
                <div key={career.id} className="cl-card career-card">
                  <div className="cl-card-content">
                    <h3>{career.title}</h3>
                    {career.summary && (
                      <p className="career-summary">
                        {career.summary.substring(0, 150)}
                        {career.summary.length > 150 ? '...' : ''}
                      </p>
                    )}
                    <a className="learn-more-btn" href={`/career/${career.id}`}>Learn More</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Show categories
          <>
            {filteredCategories.map(cat => {
              const careerCount = getCategoryCareerCount(cat.slug);
              return (
                <div key={cat.slug} className="cl-card" onClick={() => setSelectedCategory(cat.slug)}>
                  <div className="cl-card-img-container">
                    <img
                      src={`/images/careers/${cat.slug}.jpg`}
                      alt={cat.title}
                      className="cl-card-img"
                      onError={(e) => {
                        // Hide the image and show a placeholder
                        (e.target as HTMLImageElement).style.display = 'none';
                        const container = (e.target as HTMLImageElement).parentElement;
                        if (container) {
                          container.classList.add('placeholder');
                        }
                      }}
                    />
                    <div className="img-placeholder">
                      <div className="placeholder-icon">📚</div>
                      <div className="placeholder-text">{cat.title}</div>
                    </div>
                  </div>
                  <div className="cl-card-content">
                    <h3>{cat.title}</h3>
                    <p className="career-count">{careerCount} career{careerCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </section>

      {/* Footer */}
    <Footer></Footer>
    </div>
  );
};

export default CareerLibrary;
