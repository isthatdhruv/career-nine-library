const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Set emulator host
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Initialize Firebase Admin
let app;
try {
  let serviceAccount = null;
  
  // Try to load service account from multiple locations
  const serviceAccountPaths = [
    "../config/serviceKey.json",
    "./config/serviceKey.json", 
    "./serviceKey.json",
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  ].filter(Boolean);
  
  for (const keyPath of serviceAccountPaths) {
    if (fs.existsSync(keyPath)) {
      console.log(`🔑 Found service account key at: ${keyPath}`);
      serviceAccount = require(path.resolve(keyPath));
      break;
    }
  }
  
  if (serviceAccount) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "career-library"
    });
    console.log("✅ Initialized with service account credentials for emulator");
  } else {
    app = admin.initializeApp({
      projectId: "career-library"
    });
    console.log("✅ Initialized with default credentials for emulator");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK:", error.message);
  process.exit(1);
}

const db = admin.firestore();

async function importToEmulator() {
  console.log("🚀 Starting import to Firestore Emulator...");
  
  // Check if backup directory exists
  const backupDir = "./emulator-data-backup";
  if (!fs.existsSync(backupDir)) {
    console.error(`❌ Backup directory not found: ${backupDir}`);
    console.error("Please run the export script first or check the directory path.");
    process.exit(1);
  }
  
  // Check if firestore export file exists
  const firestoreExportPath = path.join(backupDir, "firestore-export.json");
  if (!fs.existsSync(firestoreExportPath)) {
    console.error(`❌ Firestore export file not found: ${firestoreExportPath}`);
    console.error("Please run the export script first.");
    process.exit(1);
  }
  
  // Read and parse the backup data
  console.log(`📖 Reading backup data from ${firestoreExportPath}...`);
  const rawData = fs.readFileSync(firestoreExportPath);
  const data = JSON.parse(rawData);
  
  console.log(`📊 Found ${Object.keys(data).length} collections to import`);
  
  let totalDocuments = 0;
  let importedDocuments = 0;
  let failedDocuments = 0;
  
  // Count total documents
  for (const [collectionName, docs] of Object.entries(data)) {
    totalDocuments += Object.keys(docs).length;
  }
  
  console.log(`📄 Total documents to import: ${totalDocuments}`);
  console.log("🔄 Starting import process...\n");
  
  // Import each collection
  for (const [collectionName, docs] of Object.entries(data)) {
    console.log(`📂 Importing collection: ${collectionName} (${Object.keys(docs).length} documents)`);
    
    for (const [docId, docData] of Object.entries(docs)) {
      try {
        await db.collection(collectionName).doc(docId).set(docData);
        console.log(`   ✅ Imported ${collectionName}/${docId}`);
        importedDocuments++;
      } catch (error) {
        console.log(`   ❌ Failed to import ${collectionName}/${docId}: ${error.message}`);
        failedDocuments++;
      }
    }
    
    console.log(`   ✓ Completed collection: ${collectionName}\n`);
  }
  
  // Import summary
  console.log("🎉 Import completed!");
  console.log(`📊 Summary:`);
  console.log(`   Total documents: ${totalDocuments}`);
  console.log(`   Successfully imported: ${importedDocuments}`);
  console.log(`   Failed: ${failedDocuments}`);
  
  if (failedDocuments > 0) {
    console.log(`⚠️  ${failedDocuments} documents failed to import. Check the error messages above.`);
  }
  
  // Check if backup summary exists and display it
  const summaryPath = path.join(backupDir, "backup-summary.json");
  if (fs.existsSync(summaryPath)) {
    const summary = JSON.parse(fs.readFileSync(summaryPath));
    console.log(`\n📋 Original backup info:`);
    console.log(`   Backup date: ${new Date(summary.backupDate).toLocaleString()}`);
    console.log(`   Images backed up: ${summary.images?.totalDownloaded || 0}`);
    console.log(`   Images location: ${path.resolve(backupDir, "images")}`);
  }
  
  console.log(`\n🔗 Emulator UI: http://localhost:4000`);
  console.log(`🔥 Firestore Emulator: localhost:8080`);
}

// Check if emulator is running
async function checkEmulator() {
  console.log("🔍 Checking if Firestore Emulator is running...");
  
  try {
    // Try to connect to emulator
    await db.collection('_test_').limit(1).get();
    console.log("✅ Firestore Emulator is running");
    return true;
  } catch (error) {
    console.error("❌ Firestore Emulator is not running or not accessible");
    console.error("Please start the emulator first:");
    console.error("   firebase emulators:start");
    console.error("   or");
    console.error("   firebase emulators:start --only firestore");
    return false;
  }
}

async function main() {
  const emulatorRunning = await checkEmulator();
  if (emulatorRunning) {
    await importToEmulator();
  }
}

main().catch(console.error);
