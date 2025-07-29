const admin = require("firebase-admin");
const fs = require("fs");
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
const serviceAccount = require("../config/serviceKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "career-library", // or your real projectId, it's just for emulator
});

const db = admin.firestore();

async function importToEmulator() {
  const rawData = fs.readFileSync("./emulator-data/firestore-export.json");
  const data = JSON.parse(rawData);

  for (const [collectionName, docs] of Object.entries(data)) {
    for (const [docId, docData] of Object.entries(docs)) {
      await db.collection(collectionName).doc(docId).set(docData);
      console.log(`✅ Imported ${collectionName}/${docId}`);
    }
  }

  console.log("🎉 Done importing data into local emulator!");
}

importToEmulator();
