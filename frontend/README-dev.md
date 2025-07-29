# Frontend Setup Guide (Developer POV)

This README provides instructions for developers to clone, set up, and run the frontend of this project, including Firebase emulator usage.

## Prerequisites
- Node.js (v16+ recommended)
- npm (comes with Node.js)
- Git

## 1. Clone the Repository
```bash
git clone <REPO_URL>
cd scraper-plugin/frontend
```
Replace `<REPO_URL>` with your repository's URL.

## 2. Install Dependencies
```bash
npm install
```
This installs all required packages for React and Firebase integration.

## 3. Firebase Emulator Setup
The project uses Firebase emulators for local development. Ensure you have the Firebase CLI installed:
```bash
npm install -g firebase-tools
```

### Start the Emulator
Run the following command to start the Firebase emulator:
```bash
npm run emulator:start
```
This will start the emulator for Firestore and other configured services. (See `firebase.json` for configuration.)

### Stop the Emulator
To stop the emulator, open another terminal in the same directory and run:
```bash
npm run emulator:stop
```
This will gracefully shut down the emulator.

## 4. Running the Frontend
Start the React development server:
```bash
npm start
```
The app will be available at `http://localhost:3000`.

## 5. Notes
- Make sure the emulator is running before using features that interact with Firestore.
- Emulator data and configuration are stored in the `emulator-data/` directory.
- For production, update Firebase config and use real Firebase services.

## Troubleshooting
- If you encounter issues with Firebase, check your `firebase.json` and `serviceKey.json` files.
- For dependency issues, try deleting `node_modules` and running `npm install` again.

---
For further questions, refer to the main project README or contact the maintainer.
