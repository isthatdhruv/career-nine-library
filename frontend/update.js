const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK with service account key
let app;
try {
  let serviceAccount = null;
  
  // Try to load service account from multiple locations
  const serviceAccountPaths = [
    "./config/serviceKey.json",
    "../config/serviceKey.json",
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
      projectId: serviceAccount.project_id
    });
    console.log("✅ Initialized with service account credentials");
  } else {
    // Fallback to default credentials
    app = admin.initializeApp({
      projectId: "career-library"
    });
    console.log("✅ Initialized with default credentials");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK:");
  console.error("\n📋 To fix this, place your service account key file at one of these locations:");
  console.error("   - ./config/serviceKey.json");
  console.error("   - ../config/serviceKey.json");
  console.error("   - ./serviceKey.json");
  console.error("\n📋 Or set environment variable:");
  console.error("   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/serviceKey.json");
  console.error("\nActual error:", error.message);
  process.exit(1);
}

// Use Firestore instead of Realtime Database
const db = admin.firestore();

// Function to update physical-science from array to map with arrays as elements
async function updatePhysicalScienceToMap() {
  try {
    console.log('🚀 Starting physical-science array to map transformation...');
    
    // Reference to the mappingSchema/mapping document
    const docRef = db.collection('mappingSchema').doc('mapping');
    
    // Get current data
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.log('❌ Document mappingSchema/mapping not found');
      return;
    }
    
    const currentData = doc.data();
    console.log('📄 Current document data structure:', Object.keys(currentData));
    
    // Get the physical-science array
    const physicalScienceArray = currentData['physical-science'];
    
    if (!physicalScienceArray || !Array.isArray(physicalScienceArray)) {
      console.log('❌ No array data found in physical-science field');
      console.log('Current physical-science field:', physicalScienceArray);
      return;
    }
    
    console.log(`📋 Found physical-science array with ${physicalScienceArray.length} items:`);
    physicalScienceArray.forEach((item, index) => {
      console.log(`   ${index}: ${item}`);
    });
    
    // Transform array to map - each element becomes an array directly
    const transformedData = {};
    
    physicalScienceArray.forEach((item, index) => {
      if (item && typeof item === 'string') {
        // Use index as key and the element itself becomes an array
        transformedData[index.toString()] = item; // This will be an array element
      }
    });
    
    console.log('\n🔄 Transformed data structure (each element will be an array):');
    Object.entries(transformedData).forEach(([key, value]) => {
      console.log(`   "${key}": "${value}" (will become array element)`);
    });
    
    // Update the physical-science field in the document
    await docRef.update({
      'physical-science': transformedData
    });
    
    console.log('\n✅ Successfully updated physical-science data structure!');
    console.log('🎯 New structure: Map with string keys where each value is an array element');
    
    // Verify the update
    const verifyDoc = await docRef.get();
    const updatedData = verifyDoc.data();
    const updatedPhysicalScience = updatedData['physical-science'];
    
    console.log('\n🔍 Verification - Updated physical-science field:');
    console.log('Type:', typeof updatedPhysicalScience);
    console.log('Is Array:', Array.isArray(updatedPhysicalScience));
    console.log('Keys:', Object.keys(updatedPhysicalScience));
    
    Object.entries(updatedPhysicalScience).forEach(([key, value]) => {
      console.log(`   "${key}": "${value}" (${typeof value})`);
    });
    
  } catch (error) {
    console.error('❌ Error updating data:', error);
  }
}

// Alternative function with custom keys 
async function updatePhysicalScienceWithCustomKeys() {
  try {
    console.log('🚀 Starting physical-science transformation with custom keys...');
    
    const docRef = db.collection('mappingSchema').doc('mapping');
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.log('❌ Document mappingSchema/mapping not found');
      return;
    }
    
    const currentData = doc.data();
    const physicalScienceArray = currentData['physical-science'];
    
    if (!physicalScienceArray || !Array.isArray(physicalScienceArray)) {
      console.log('❌ No array data found in physical-science field');
      return;
    }
    
    const transformedData = {};
    
    physicalScienceArray.forEach((item, index) => {
      if (item && typeof item === 'string') {
        // Create a key from the career name
        const key = item
          .replace('-as-a-career-in-india', '') // Remove common suffix
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        
        transformedData[key] = item; // Element becomes array element directly
      }
    });
    
    console.log('\n🔄 Transformed data with custom keys:');
    Object.entries(transformedData).forEach(([key, value]) => {
      console.log(`   "${key}": "${value}"`);
    });
    
    await docRef.update({
      'physical-science': transformedData
    });
    
    console.log('\n✅ Successfully updated with custom keys!');
    
  } catch (error) {
    console.error('❌ Error updating data:', error);
  }
}

// Run the main function
if (require.main === module) {
  console.log('🎯 Updating physical-science field in mappingSchema/mapping document...');
  
  // Choose which transformation to run:
  
  // Option 1: Convert array to map with numeric keys (0, 1, 2, etc.)
  updatePhysicalScienceToMap();
  
  // Option 2: Convert array to map with custom keys (uncomment to use instead)
  // updatePhysicalScienceWithCustomKeys();
}

module.exports = {
  updatePhysicalScienceToMap,
  updatePhysicalScienceWithCustomKeys
};