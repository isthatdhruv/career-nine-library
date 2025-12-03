const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Initialize Firebase Admin with service account key
let app;
try {
  let serviceAccount = null;
  
  // Try to load service account from multiple locations
  const serviceAccountPaths = [
    "../config/serviceKey.json",           // Most common location
    "./config/serviceKey.json",            // In current directory
    "./serviceKey.json",                   // Direct in script directory
    process.env.GOOGLE_APPLICATION_CREDENTIALS // Environment variable
  ].filter(Boolean);
  
  for (const keyPath of serviceAccountPaths) {
    if (fs.existsSync(keyPath)) {
      console.log(`🔑 Found service account key at: ${keyPath}`);
      serviceAccount = require(path.resolve(keyPath));
      break;
    }
  }
  
  if (serviceAccount) {
    // Initialize with service account key
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "career-library",
      storageBucket: "career-banners"
    });
    console.log("✅ Initialized with service account credentials");
  } else {
    // Fallback to default credentials
    app = admin.initializeApp({
      projectId: "career-library",
      storageBucket: "career-banners"
    });
    console.log("✅ Initialized with default credentials");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK:");
  console.error("\n📋 To fix this, place your service account key file at one of these locations:");
  console.error("   - ../config/serviceKey.json");
  console.error("   - ./config/serviceKey.json");
  console.error("   - ./serviceKey.json");
  console.error("\n📋 Or set environment variable:");
  console.error("   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/serviceKey.json");
  console.error("\nActual error:", error.message);
  process.exit(1);
}

const db = admin.firestore();
const storage = admin.storage();

// Create backup directories
const backupDir = "emulator-data-backup";
const imagesDir = path.join(backupDir, "images");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to download file from URL
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filePath, () => {}); // Delete the file on error
          reject(err);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to extract filename from Firebase Storage URL
function getFileNameFromUrl(url) {
  try {
    // Handle Firebase Storage URLs
    if (url.includes('firebasestorage.googleapis.com')) {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const encodedFileName = pathParts[pathParts.length - 1];
      
      // Decode the filename
      let fileName = decodeURIComponent(encodedFileName);
      
      // Remove any query parameters
      fileName = fileName.split('?')[0];
      
      // If it starts with 'o/', remove it
      if (fileName.startsWith('o/')) {
        fileName = fileName.substring(2);
      }
      
      // Replace problematic characters for file system
      fileName = fileName.replace(/[\/\\:*?"<>|]/g, '_');
      
      return fileName;
    }
    
    // Handle OpenAI DALL-E URLs
    if (url.includes('oaidalleapiprodscus.blob.core.windows.net')) {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const imgId = pathParts[pathParts.length - 1];
      return `dalle_${imgId}.png`;
    }
    
    // Handle other URLs - extract filename from path
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    let fileName = pathParts[pathParts.length - 1];
    
    // Replace problematic characters
    fileName = fileName.replace(/[\/\\:*?"<>|]/g, '_');
    
    // If no extension, try to determine from content-type or add a default
    if (!fileName.includes('.')) {
      fileName += '.jpg'; // Default extension
    }
    
    return fileName;
  } catch (error) {
    // Fallback: create filename from timestamp
    const timestamp = Date.now();
    return `image_${timestamp}.jpg`;
  }
}

// Function to download images from Firebase Storage
async function downloadStorageImages() {
  console.log("📥 Downloading images from Firebase Storage...");
  
  try {
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles();
    
    let downloadedCount = 0;
    let failedCount = 0;
    
    for (const file of files) {
      try {
        const fileName = file.name;
        const localPath = path.join(imagesDir, fileName.replace(/\//g, '_')); // Replace slashes with underscores
        
        // Create directory structure if needed
        const fileDir = path.dirname(localPath);
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        
        await file.download({ destination: localPath });
        console.log(`   ✓ Downloaded: ${fileName}`);
        downloadedCount++;
      } catch (error) {
        console.log(`   ✗ Failed to download: ${file.name} - ${error.message}`);
        failedCount++;
      }
    }
    
    console.log(`📥 Storage download complete: ${downloadedCount} files downloaded, ${failedCount} failed`);
    return { downloadedCount, failedCount };
  } catch (error) {
    console.log(`❌ Error accessing Firebase Storage: ${error.message}`);
    return { downloadedCount: 0, failedCount: 0 };
  }
}

// Function to download images from URLs found in documents
async function downloadImagesFromUrls(exportData) {
  console.log("🌐 Downloading images from URLs found in documents...");
  
  const imageUrls = new Set();
  let urlDownloadedCount = 0;
  let urlFailedCount = 0;
  let skippedCount = 0;
  
  // Extract image URLs from all documents
  for (const [collectionName, docs] of Object.entries(exportData)) {
    for (const [docId, docData] of Object.entries(docs)) {
      // Look for image URLs in various fields
      const checkForImageUrls = (obj, prefix = '') => {
        if (typeof obj === 'string' && (obj.startsWith('http') && (obj.includes('image') || obj.includes('.jpg') || obj.includes('.png') || obj.includes('.gif') || obj.includes('.webp') || obj.includes('firebasestorage')))) {
          imageUrls.add(obj);
        } else if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            if (key.toLowerCase().includes('image') || key.toLowerCase().includes('banner') || key.toLowerCase().includes('photo') || key.toLowerCase().includes('picture')) {
              if (typeof value === 'string' && value.startsWith('http')) {
                imageUrls.add(value);
              }
            }
            checkForImageUrls(value, `${prefix}${key}.`);
          }
        }
      };
      
      checkForImageUrls(docData);
    }
  }
  
  console.log(`   Found ${imageUrls.size} unique image URLs`);
  
  // Download each unique image URL
  for (const url of imageUrls) {
    try {
      // Skip expired URLs (OpenAI DALL-E URLs expire)
      if (url.includes('oaidalleapiprodscus.blob.core.windows.net')) {
        console.log(`   ⏭ Skipped (expired): OpenAI DALL-E URL`);
        skippedCount++;
        continue;
      }
      
      const fileName = getFileNameFromUrl(url);
      const localPath = path.join(imagesDir, 'url_images', fileName);
      
      // Create directory if it doesn't exist
      const urlImagesDir = path.join(imagesDir, 'url_images');
      if (!fs.existsSync(urlImagesDir)) {
        fs.mkdirSync(urlImagesDir, { recursive: true });
      }
      
      // Skip if file already exists
      if (fs.existsSync(localPath)) {
        console.log(`   ⏭ Skipped (exists): ${fileName}`);
        continue;
      }
      
      await downloadFile(url, localPath);
      console.log(`   ✓ Downloaded: ${fileName}`);
      urlDownloadedCount++;
    } catch (error) {
      // More specific error handling
      const fileName = getFileNameFromUrl(url);
      if (error.message.includes('403')) {
        console.log(`   ⏭ Skipped (403 Forbidden): ${fileName}`);
        skippedCount++;
      } else if (error.message.includes('404')) {
        console.log(`   ⏭ Skipped (404 Not Found): ${fileName}`);
        skippedCount++;
      } else {
        console.log(`   ✗ Failed to download: ${fileName} - ${error.message}`);
        urlFailedCount++;
      }
    }
  }
  
  console.log(`🌐 URL download complete: ${urlDownloadedCount} downloaded, ${urlFailedCount} failed, ${skippedCount} skipped`);
  return { urlDownloadedCount, urlFailedCount, skippedCount };
}

async function exportFirestoreData() {
  console.log("🚀 Starting complete backup (Database + Images)...");
  
  const exportData = {};

  // Export Firestore data
  console.log("📄 Discovering and exporting all Firestore collections...");
  
  // Get all collections dynamically
  const collections = await db.listCollections();
  const collectionNames = collections.map(col => col.id);
  
  console.log(`   Found ${collectionNames.length} collections: ${collectionNames.join(', ')}`);
  
  for (const collectionName of collectionNames) {
    const snapshot = await db.collection(collectionName).get();
    exportData[collectionName] = {};

    snapshot.forEach(doc => {
      exportData[collectionName][doc.id] = doc.data();
    });
    
    console.log(`   ✓ Exported collection: ${collectionName} (${Object.keys(exportData[collectionName]).length} documents)`);
  }

  // Save Firestore data
  const firestoreExportPath = path.join(backupDir, "firestore-export.json");
  fs.writeFileSync(firestoreExportPath, JSON.stringify(exportData, null, 2));
  console.log(`✅ Exported Firestore data to ${firestoreExportPath}`);

  // Download images from Firebase Storage
  const storageResults = await downloadStorageImages();
  
  // Download images from URLs found in documents
  const urlResults = await downloadImagesFromUrls(exportData);
  
  // Create backup summary
  const summary = {
    backupDate: new Date().toISOString(),
    collections: Object.keys(exportData).map(name => ({
      name,
      documentCount: Object.keys(exportData[name]).length
    })),
    images: {
      fromStorage: {
        downloaded: storageResults.downloadedCount,
        failed: storageResults.failedCount
      },
      fromUrls: {
        downloaded: urlResults.urlDownloadedCount,
        failed: urlResults.urlFailedCount,
        skipped: urlResults.skippedCount || 0
      },
      totalDownloaded: storageResults.downloadedCount + urlResults.urlDownloadedCount,
      totalFailed: storageResults.failedCount + urlResults.urlFailedCount,
      totalSkipped: urlResults.skippedCount || 0
    }
  };
  
  fs.writeFileSync(path.join(backupDir, "backup-summary.json"), JSON.stringify(summary, null, 2));
  
  console.log("\n🎉 Backup completed!");
  console.log(`📊 Summary:`);
  console.log(`   Database: ${summary.collections.reduce((sum, col) => sum + col.documentCount, 0)} documents from ${summary.collections.length} collections`);
  console.log(`   Images: ${summary.images.totalDownloaded} downloaded, ${summary.images.totalFailed} failed, ${summary.images.totalSkipped} skipped`);
  console.log(`   Location: ${path.resolve(backupDir)}`);
}

exportFirestoreData().catch(console.error);
