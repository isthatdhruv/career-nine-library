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

      console.log(`\n🔄 Processing page: '${pageId}'`);

      // Update document with empty values array
      await careerPagesColl.doc(pageId).update({
        values: []
      });
      console.log(`✅ Set 'values' field to empty array for '${pageId}'`);
    }

    console.log("\n🎉 All categories mapped successfully!");

  } catch (error) {
    console.error("❌ Script error:", error);
  }
}

mapCategoriesToCareerPages();
