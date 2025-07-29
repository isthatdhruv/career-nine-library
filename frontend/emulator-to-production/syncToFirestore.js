const admin = require("firebase-admin");
const fs = require("fs");

// Initialize with live Firestore credentials
const serviceAccount = require("../config/serviceKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function syncToLiveFirestore() {
  const rawData = fs.readFileSync("emulator-data-prod/firestore-export.json");
  const data = JSON.parse(rawData);

  for (const [collectionName, docs] of Object.entries(data)) {
    for (const [docId, docData] of Object.entries(docs)) {
      await db.collection(collectionName).doc(docId).set(docData, { merge: true });
      console.log(`☁️ Synced ${collectionName}/${docId} to live Firestore`);
    }
  }

  console.log("🎉 All local emulator data synced to production Firestore.");
}

syncToLiveFirestore();
