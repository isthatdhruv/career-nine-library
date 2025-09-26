const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("../config/serviceKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportFirestoreData() {
  const collections = ["careerPages", "savedUrls"]; // Add any more collections if needed
  const exportData = {};

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    exportData[collectionName] = {};

    snapshot.forEach(doc => {
      exportData[collectionName][doc.id] = doc.data();
    });
  }

  fs.writeFileSync("emulator-data/firestore-export.json", JSON.stringify(exportData, null, 2));
  console.log("✅ Exported Firestore data to emulator-data/firestore-export.json");
}

exportFirestoreData();
