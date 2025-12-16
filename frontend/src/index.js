// ✅ D:\AlMustafaApp\frontend\src\index.js

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./styles/theme.css";

// ❗ Firebase Initialization MUST NOT be here
// It must only exist in firebase.js
// Otherwise React shows a blank white screen.
// So we only import the firebase.js (already initialized once)

import "./firebase"; 
// (This automatically initializes Firebase once using your config)

// -----------------------------------------------
// ✅ Global API endpoints (Reward + Watermark Cloud Functions)
export const rewardEndpoint =
  "https://us-central1-al-mustafa-onlin-quran-academy.cloudfunctions.net/reward";

export const cloudFuncUrl =
  "https://us-central1-al-mustafa-onlin-quran-academy.cloudfunctions.net/watermarkMedia";

// -----------------------------------------------
// ✅ Start App Normally
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
