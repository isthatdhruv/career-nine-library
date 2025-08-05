const admin = require("firebase-admin");

// Configure for local emulator
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

admin.initializeApp({
  projectId: "career-library"
});

const db = admin.firestore();

async function mapCategoriesToCareerPages() {
  try {
    console.log("🔍 Starting category mapping...");
    
    const careerPagesColl = db.collection("careerPages");
    const careerPages = await careerPagesColl.get();

    console.log(`📊 Found ${careerPages.docs.length} career pages`);

    for (const pageDoc of careerPages.docs) {
      const pageId = pageDoc.id;
      const pageData = pageDoc.data();
      
      console.log(`\n� Processing page: '${pageId}'`);
      
      // Extract category from pageUrl
      const pageUrl = pageData.pageUrl;
      if (!pageUrl) {
        console.warn(`❌ No pageUrl found for page '${pageId}'`);
        continue;
      }
      
      console.log(`🔗 PageUrl: ${pageUrl}`);
      
      // Extract category: everything after "careerlibrary/" and before the next "/"
      const urlMatch = pageUrl.match(/\/careerlibrary\/([^\/]+)\//);
      if (!urlMatch) {
        console.warn(`❌ Could not extract category from URL: ${pageUrl}`);
        continue;
      }
      
      const category = urlMatch[1];
      console.log(`📁 Extracted category: '${category}'`);
      
      // Get current categories
      const currentCategories = pageData.categories || [];
      
      if (!currentCategories.includes(category)) {
        await careerPagesColl.doc(pageId).update({
          categories: admin.firestore.FieldValue.arrayUnion(category),
        });
        console.log(`✅ Added '${category}' to '${pageId}' (${currentCategories.length === 0 ? 'created new field' : 'added to existing'})`);
      } else {
        console.log(`↪️ '${pageId}' already contains '${category}' — skipping`);
      }
    }
    
    console.log("\n🎉 All categories mapped successfully!");
    
  } catch (error) {
    console.error("❌ Script error:", error);
  }
}

mapCategoriesToCareerPages();
