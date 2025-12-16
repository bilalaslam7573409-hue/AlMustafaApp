// D:\AlMustafaApp\frontend\src\api\adminClient.js
import { adminApiEndpoint, ADMIN_KEY } from "../config/api";

// helper to add admin header
function adminHeaders() {
  return {
    "Content-Type": "application/json",
    "x-admin-key": ADMIN_KEY
  };
}

/** Fetch country stats (live) */
export async function fetchCountryStats() {
  const res = await fetch(`${adminApiEndpoint}/country-stats`, {
    headers: adminHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch country stats");
  return res.json();
}

/** Fetch top countries by event (views|likes|shares|comments) */
export async function fetchTopCountries(event = "total") {
  const res = await fetch(`${adminApiEndpoint}/topCountries?event=${encodeURIComponent(event)}`, {
    headers: adminHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch top countries");
  return res.json();
}

/** Fetch single post breakdown */
export async function fetchPostCountryBreakdown(postId) {
  const res = await fetch(`${adminApiEndpoint}/post-country-breakdown?postId=${encodeURIComponent(postId)}`, {
    headers: adminHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch post breakdown");
  return res.json();
}

/** Download CSV (countries) - returns blob */
export async function downloadCountriesCSV() {
  const res = await fetch(`${adminApiEndpoint}/download/countries`, {
    headers: adminHeaders()
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error("CSV download failed: " + txt);
  }
  const blob = await res.blob();
  return blob;
}

/** Download analytics raw CSV */
export async function downloadAnalyticsCSV() {
  const res = await fetch(`${adminApiEndpoint}/download/analytics`, {
    headers: adminHeaders()
  });
  if (!res.ok) throw new Error("CSV download failed");
  return res.blob();
}
