const admin = require("firebase-admin");
const fs = require("fs");

// 👇 Force use of local emulator
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

admin.initializeApp({ projectId: "career-library" }); // your emulator projectId

const db = admin.firestore();

async function exportEmulatorData() {
  const collections = ["careerPages", "savedUrls"]; // Add more if needed
  const exportData = {};

  for (const name of collections) {
    const snapshot = await db.collection(name).get();
    exportData[name] = {};

    snapshot.forEach(doc => {
      exportData[name][doc.id] = doc.data();
    });
  }

  fs.writeFileSync("emulator-data-prod/firestore-export.json", JSON.stringify(exportData, null, 2));
  console.log("✅ Exported emulator data to firestore-export.json");
}

exportEmulatorData();
