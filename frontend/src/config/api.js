export const PROJECT_ID = "al-mustafa-onlin-quran-academy";
export const rewardEndpoint = "https://us-central1-al-mustafa-onlin-quran-academy.cloudfunctions.net/reward";
export const cloudFuncUrl = "https://us-central1-al-mustafa-onlin-quran-academy.cloudfunctions.net/watermarkMedia";
export const analyticsEndpoint = "https://us-central1-al-mustafa-onlin-quran-academy.cloudfunctions.net/analytics";
export const adminApiEndpoint = "https://us-central1-al-mustafa-onlin-quran-academy.cloudfunctions.net/adminApi";
// D:\AlMustafaApp\frontend\src\config\api.js
// Frontend API config for Al Mustafa Admin + Cloud Functions

// Base Cloud Function endpoints (your deployed functions)
// adjust domain if you deployed to other region
export const PROJECT_ID = "al-mustafa-onlin-quran-academy";

export const cloudFunctionsBase = `https://us-central1-${PROJECT_ID}.cloudfunctions.net`;

// Public endpoints (used by normal app)
export const analyticsEndpoint = `${cloudFunctionsBase}/analytics`;
export const rewardEndpoint = `${cloudFunctionsBase}/reward`;
export const watermarkEndpoint = `${cloudFunctionsBase}/watermark`;

// Admin API (protected by admin key header)
export const adminApiEndpoint = "https://us-central1-al-mustafa-quran-academy.cloudfunctions.net/adminApi";

// *** ADMIN KEY: set here for local dev ONLY ***
// For production, store secret safely (env, server)
// Replace the placeholder with your real admin secret
export const ADMIN_KEY = "CHANGE_ME_ADMIN_KEY";
