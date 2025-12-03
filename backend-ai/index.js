const admin = require("firebase-admin");
const fs = require("fs");
const serviceAccount = require("./serviceKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

async function mapCategoriesToCareerPages() {
  try {
    const savedUrlsColl = db.collection("savedUrls");

    const categories = await savedUrlsColl.listDocuments(); // top-level categories

    for (const categoryRef of categories) {
      const categoryId = categoryRef.id;
      console.log(`\n📁 Processing category: '${categoryId}'`);

      const pagesColl = savedUrlsColl.doc(categoryId);
      const pageDocs = await pagesColl.listCollections(); // each doc here is a career page

      for (const pageCollection of pageDocs) {
        const pageId = pageCollection.id;

        const careerPageRef = db.collection("careerPages").doc(pageId);
        const careerPageSnap = await careerPageRef.get();

        if (!careerPageSnap.exists) {
          console.warn(`❌ Page '${pageId}' not found in careerPages`);
          continue;
        }

        const currentCategories = careerPageSnap.data().categories || [];

        if (!currentCategories.includes(categoryId)) {
          await careerPageRef.update({
            categories: admin.firestore.FieldValue.arrayUnion(categoryId),
          });
          console.log(`✅ Added '${categoryId}' to '${pageId}'`);
        } else {
          console.log(`↪️ '${pageId}' already contains '${categoryId}' — skipping`);
        }
      }
    }

    console.log("\n🎉 All pages processed successfully.");
  } catch (error) {
    console.error("❌ Script error:", error);
  }
}

mapCategoriesToCareerPages();
