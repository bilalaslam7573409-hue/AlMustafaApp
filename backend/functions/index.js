// D:\AlMustafaApp\backend\functions\index.js
// ----------------------------------------------------
// Al Mustafa — Single deployable Cloud Functions file
// Reward + Watermark + Analytics + ViralBoost + Admin APIs
// All-in-one (with fraud checks, rate limiter, country helper)
// ----------------------------------------------------

// Required modules
const functions = require("firebase-functions");                      // اردو: فائر بیس فنکشنز
const admin = require("firebase-admin");                             // اردو: فائر بیس ایڈمن
const express = require("express");                                  // اردو: ایکسپریس ویب فریم ورک
const ffmpeg = require("fluent-ffmpeg");                             // اردو: ffmpeg لائبریری
const ffmpegStatic = require("ffmpeg-static");                       // اردو: static ffmpeg بائنری
const path = require("path");                                        // اردو: path یوٹیلٹی
const fs = require("fs");                                            // اردو: فائل سسٹم
const os = require("os");                                            // اردو: عارضی فولڈر کے لئے
const fetch = require("node-fetch");                                 // اردو: HTTP fetch
const geoip = require("geoip-lite");                                 // اردو: IP -> country لوک اپ
const { RateLimiterMemory } = require("rate-limiter-flexible");      // اردو: rate limiter
const { Storage } = require("@google-cloud/storage");                // اردو: Google Cloud Storage client (optional upload)

// Initialize Firebase Admin
admin.initializeApp();                                               // اردو: ایڈمن انشلائز کریں
const db = admin.firestore();                                        // اردو: فائر اسٹور ریفرنس
const storage = new Storage();                                       // اردو: اگر آپ storage استعمال کریں تو

// Tell ffmpeg where binary is
ffmpeg.setFfmpegPath(ffmpegStatic);                                 // اردو: ffmpeg کا راستہ بتائیں

// Express app (main API)
const app = express();
app.use(express.json());                                              // اردو: JSON body parser

// ----------------------- Config -----------------------
const COINS = { view: 1, share: 5, upload_bonus: 20 };               // اردو: coins config
const VIEW_REWARD_WINDOW_SEC = 10;                                   // اردو: view reward duplicates روکنے کی ونڈو (سیکنڈ)
const SHARE_REWARD_WINDOW_SEC = 30;                                  // اردو: share reward duplicates روکنے کی ونڈو (سیکنڈ)
const RATE_LIMIT_POINTS = 10;                                        // اردو: default points per duration
const RATE_LIMIT_DURATION = 5;                                       // اردو: duration(seconds)

// Endpoints base names (for frontend constants)
const ANALYTICS_PREFIX = "/analytics";
const REWARD_PREFIX = "/reward";
const WATERMARK_PREFIX = "/watermark";
const ADMIN_PREFIX = "/admin";
const adminApi = require("./adminApi");

// ------------------- Rate Limiter (Memory) -------------------
// per-IP and per-user limiter using memory store
const ipLimiter = new RateLimiterMemory({
  points: RATE_LIMIT_POINTS,                                         // اردو: کتنے request points
  duration: RATE_LIMIT_DURATION                                     // اردو: ہر کتنے سیکنڈز میں
});
const userLimiter = new RateLimiterMemory({
  points: RATE_LIMIT_POINTS,
  duration: RATE_LIMIT_DURATION
});

// helper to get client IP robustly
function getClientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (xf) return String(xf).split(",")[0].trim();
  if (req.ip) return req.ip;
  if (req.connection && req.connection.remoteAddress) return req.connection.remoteAddress;
  return null;
}

// ------------------- Anti-Fraud helpers -------------------

// Check idempotency / duplicate reward using Firestore records
async function recentlyRewarded(userId, postId, type, windowSec) {
  if (!userId) return false;
  const cutoff = Date.now() - (windowSec * 1000);
  const q = db.collection("rewards")
    .where("userId", "==", userId)
    .where("postId", "==", postId)
    .where("type", "==", type)
    .where("createdAt", ">", admin.firestore.Timestamp.fromMillis(cutoff))
    .limit(1);
  const snap = await q.get();
  return !snap.empty;
}

// write ledger and increment user coins atomically
async function creditCoinsToUser(userId, postId, coins, type = "view", meta = {}) {
  const userRef = db.collection("users").doc(userId);
  const ledgerRef = db.collection("rewards").doc();
  await db.runTransaction(async (t) => {
    const userDoc = await t.get(userRef);
    const current = (userDoc.exists && userDoc.data().coins) || 0;
    t.set(userRef, { coins: current + coins, lastRewardAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    t.set(ledgerRef, {
      userId,
      postId: postId || null,
      type,
      coins,
      status: "credited",
      source: "cloudFunc",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      meta
    });
  });
}

// ------------------- Geo helper -------------------
function countryFromIp(ip) {
  try {
    if (!ip) return { country: "XX", city: null };
    const cleaned = String(ip).split(",")[0].trim();
    const geo = geoip.lookup(cleaned);
    if (!geo) return { country: "XX", city: null };
    return { country: geo.country || "XX", city: geo.city || null };
  } catch (e) {
    return { country: "XX", city: null };
  }
}

// ------------------- Analytics/logging endpoint -------------------
// POST /analytics/log
app.post(`${ANALYTICS_PREFIX}/log`, async (req, res) => {
  // اردو: analytics event receive — view/like/share/comment
  try {
    // rate-limit per IP
    const ip = getClientIp(req);
    try { await ipLimiter.consume(ip || "unknown"); } catch (rlErr) {
      return res.status(429).json({ error: "Too many requests (ip rate-limit)" });
    }

    const { event, postId, userId, referrer, platform, meta } = req.body;
    if (!event) return res.status(400).json({ error: "missing event" });

    const geo = countryFromIp(ip);
    const doc = {
      event,
      postId: postId || null,
      userId: userId || null,
      ip: ip || null,
      country: geo.country,
      city: geo.city,
      referrer: referrer || null,
      platform: platform || "web",
      meta: meta || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    // write raw analytics
    await db.collection("analytics").add(doc);

    // aggregated per-post counters and per-country
    if (postId) {
      const statsRef = db.doc(`stats/posts/${postId}`);
      const inc = {};
      if (event === "view") inc.views = admin.firestore.FieldValue.increment(1);
      if (event === "like") inc.likes = admin.firestore.FieldValue.increment(1);
      if (event === "share") inc.shares = admin.firestore.FieldValue.increment(1);
      if (event === "comment") inc.comments = admin.firestore.FieldValue.increment(1);

      await statsRef.set(inc, { merge: true });

      // per-post country breakdown
      const countryRef = db.doc(`stats/posts/${postId}_countries`);
      await countryRef.set({ [geo.country]: admin.firestore.FieldValue.increment(1) }, { merge: true });
    }

    // global country-level counters
    const countryGlobalRef = db.doc(`stats/countries/${geo.country}`);
    await countryGlobalRef.set({
      views: admin.firestore.FieldValue.increment(event === "view" ? 1 : 0),
      likes: admin.firestore.FieldValue.increment(event === "like" ? 1 : 0),
      shares: admin.firestore.FieldValue.increment(event === "share" ? 1 : 0),
      comments: admin.firestore.FieldValue.increment(event === "comment" ? 1 : 0),
      lastSeen: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return res.json({ ok: true });
  } catch (err) {
    console.error("analytics/log error:", err);
    return res.status(500).json({ error: "server error", details: err.message });
  }
});

// ------------------- Reward endpoints (with fraud checks) -------------------

// helper: rate-limit and user-limit wrapper
async function consumeLimits(req, userId) {
  const ip = getClientIp(req) || "unknown";
  // consume ipLimiter
  await ipLimiter.consume(ip);
  // consume per-user limiter (if userId available)
  if (userId) await userLimiter.consume(userId);
}

// POST /reward/credit-view
app.post(`${REWARD_PREFIX}/credit-view`, async (req, res) => {
  // اردو: view reward — duplicate protection
  try {
    const ip = getClientIp(req);
    const { userId, postId } = req.body;
    if (!userId || !postId) return res.status(400).json({ error: "missing userId or postId" });

    // rate-limiter
    try { await consumeLimits(req, userId); } catch (rl) {
      return res.status(429).json({ error: "Too many requests (rate limit)" });
    }

    // fraud: check recent reward
    const already = await recentlyRewarded(userId, postId, "view", VIEW_REWARD_WINDOW_SEC);
    if (already) return res.status(409).json({ error: "reward recently granted — duplicate prevented" });

    // optional: extra server-side heuristics: if ip-country mismatch with user's profile country, mark pending
    const geo = countryFromIp(ip);
    // (you can fetch user profile country and compare — left minimal here)

    // credit
    await creditCoinsToUser(userId, postId, COINS.view, "view", { ip, country: geo.country });

    // log analytics
    await db.collection("analytics").add({
      event: "view_reward",
      postId,
      userId,
      ip,
      country: geo.country,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: "reward_endpoint"
    });

    return res.json({ ok: true, credited: COINS.view });
  } catch (err) {
    console.error("credit-view error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /reward/credit-share
app.post(`${REWARD_PREFIX}/credit-share`, async (req, res) => {
  // اردو: share reward — duplicate protection + extra checks
  try {
    const ip = getClientIp(req);
    const { userId, postId } = req.body;
    if (!userId || !postId) return res.status(400).json({ error: "missing userId or postId" });

    // rate-limiter
    try { await consumeLimits(req, userId); } catch (rl) {
      return res.status(429).json({ error: "Too many requests (rate limit)" });
    }

    // fraud: check recent share reward
    const already = await recentlyRewarded(userId, postId, "share", SHARE_REWARD_WINDOW_SEC);
    if (already) return res.status(409).json({ error: "reward recently granted — duplicate prevented" });

    // credit
    await creditCoinsToUser(userId, postId, COINS.share, "share", { ip });

    // log analytics
    const geo = countryFromIp(ip);
    await db.collection("analytics").add({
      event: "share_reward",
      postId,
      userId,
      ip,
      country: geo.country,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: "reward_endpoint"
    });

    return res.json({ ok: true, credited: COINS.share });
  } catch (err) {
    console.error("credit-share error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Admin/manual credit endpoint (admin only)
// POST /reward/credit-manual  (requires admin check — here we require a simple adminKey header for demo)
const ADMIN_SECRET_HEADER = "x-admin-secret";
const ADMIN_SECRET = functions.config().admin?.secret || "change-me-secret"; // set via firebase functions:config:set admin.secret="xxx"

// middleware to check simple admin header for admin-only routes (demo)
function requireAdmin(req, res, next) {
  const key = req.headers[ADMIN_SECRET_HEADER];
  if (!key || key !== ADMIN_SECRET) return res.status(403).json({ error: "forbidden: admin only" });
  return next();
}

// POST /reward/credit-manual
app.post(`${REWARD_PREFIX}/credit-manual`, requireAdmin, async (req, res) => {
  try {
    const { userId, postId, coins, type } = req.body;
    if (!userId || !coins) return res.status(400).json({ error: "missing userId or coins" });
    await creditCoinsToUser(userId, postId || null, Number(coins), type || "manual", { admin: true });
    return res.json({ ok: true, credited: Number(coins) });
  } catch (err) {
    console.error("credit-manual error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ------------------- Watermark endpoint (ffmpeg) -------------------
// POST /watermark/process
// Body: { mediaUrl, watermarkText, postId, uploadToStorage: true|false }
app.post(`${WATERMARK_PREFIX}/process`, async (req, res) => {
  // اردو: heavy job — careful with timeouts (Cloud Functions default timeout). Consider Cloud Run for heavy processing.
  try {
    // admin-only access recommended (use admin secret)
    const key = req.headers[ADMIN_SECRET_HEADER];
    if (!key || key !== ADMIN_SECRET) return res.status(403).json({ error: "forbidden: admin only" });

    const { mediaUrl, watermarkText, postId, uploadToStorage } = req.body;
    if (!mediaUrl) return res.status(400).json({ error: "missing mediaUrl" });

    const tmpIn = path.join(os.tmpdir(), `in_${Date.now()}.mp4`);
    const tmpOut = path.join(os.tmpdir(), `out_${Date.now()}.mp4`);

    // download
    const r = await fetch(mediaUrl);
    if (!r.ok) throw new Error("failed to download media");
    const buffer = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(tmpIn, buffer);

    // run ffmpeg (drawtext watermark bottom-left with box)
    await new Promise((resolve, reject) => {
      ffmpeg(tmpIn)
        .videoFilters({
          filter: "drawtext",
          options: {
            fontfile: "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            text: watermarkText || "Al Mustafa Quran Academy",
            fontsize: 28,
            fontcolor: "white@0.9",
            box: 1,
            boxcolor: "0x0b3d0bAA",
            boxborderw: 10,
            x: 10,
            y: "h-th-20"
          }
        })
        .outputOptions(["-preset", "fast"])
        .save(tmpOut)
        .on("end", () => resolve())
        .on("error", (e) => reject(e));
    });

    let resultUrl = null;
    if (uploadToStorage) {
      // upload to Firebase Storage default bucket
      const bucket = admin.storage().bucket();
      const dest = `watermarked/${Date.now()}_${postId || "out"}.mp4`;
      await bucket.upload(tmpOut, { destination: dest });
      const file = bucket.file(dest);
      const [signedUrl] = await file.getSignedUrl({ action: "read", expires: Date.now() + 3600 * 1000 }); // 1 hour
      resultUrl = signedUrl;
    }

    // cleanup local tmp files
    try { fs.unlinkSync(tmpIn); } catch (e) {}
    try { fs.unlinkSync(tmpOut); } catch (e) {}

    return res.json({ ok: true, message: "watermark complete", url: resultUrl });
  } catch (err) {
    console.error("watermark/process error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ------------------- ViralBoost (simple example) -------------------
// This module can be more advanced — here is a simple boost marker
// POST /viral/boost -> { postId, factor, reason } (admin only)
app.post("/viral/boost", requireAdmin, async (req, res) => {
  try {
    const { postId, factor, reason } = req.body;
    if (!postId) return res.status(400).json({ error: "missing postId" });

    // mark the post with a viralBoost doc
    await db.collection("viralBoost").doc(postId).set({
      postId,
      factor: factor || 2,
      reason: reason || null,
      promotedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return res.json({ ok: true, message: "viral boost applied" });
  } catch (err) {
    console.error("viral/boost error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ------------------- Country breakdown helper endpoints (Admin) -------------------
// GET /admin/country-summary?limit=10
// returns aggregated country stats for charts
app.get(`${ADMIN_PREFIX}/country-summary`, requireAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const snap = await db.collection("stats").doc("countries_agg").get();
    // We keep a precomputed doc for speed; but if not present, compute on the fly:
    if (snap.exists) {
      return res.json({ ok: true, data: snap.data() });
    }

    // Fallback: compute by reading stats/countries collection
    const countriesSnap = await db.collection("stats").listDocuments();
    const out = {};
    for (const docRef of countriesSnap) {
      const d = await docRef.get();
      if (!d.exists) continue;
      out[docRef.id] = d.data();
    }
    return res.json({ ok: true, data: out });
  } catch (err) {
    console.error("admin/country-summary error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /admin/post-country-breakdown?postId=xxx
app.get(`${ADMIN_PREFIX}/post-country-breakdown`, requireAdmin, async (req, res) => {
  try {
    const { postId } = req.query;
    if (!postId) return res.status(400).json({ error: "missing postId" });

    const countryRef = db.doc(`stats/posts/${postId}_countries`);
    const snap = await countryRef.get();
    if (!snap.exists) return res.json({ ok: true, data: {} });

    return res.json({ ok: true, data: snap.data() });
  } catch (err) {
    console.error("admin/post-country-breakdown error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ------------------- Moderation endpoints (Admin) -------------------
// POST /admin/moderation/add  -> { postId, status, reason }
app.post(`${ADMIN_PREFIX}/moderation/add`, requireAdmin, async (req, res) => {
  try {
    const { postId, status, reason, handledBy } = req.body;
    if (!postId || !status) return res.status(400).json({ error: "missing postId or status" });
    await db.collection("moderation").doc(postId).set({
      postId, status, reason: reason || null, handledBy: handledBy || null, createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return res.json({ ok: true });
  } catch (err) {
    console.error("admin/moderation/add error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /admin/moderation/list
app.get(`${ADMIN_PREFIX}/moderation/list`, requireAdmin, async (req, res) => {
  try {
    const q = db.collection("moderation").orderBy("createdAt", "desc").limit(200);
    const snap = await q.get();
    const all = [];
    snap.forEach(d => all.push(d.data()));
    return res.json({ ok: true, data: all });
  } catch (err) {
    console.error("admin/moderation/list error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ------------------- Admin: rebuild countries_agg summary (manual) -------------------
// POST /admin/rebuild-countries (admin only)
app.post(`${ADMIN_PREFIX}/rebuild-countries`, requireAdmin, async (req, res) => {
  try {
    // scan stats/countries collection and assemble an aggregate doc
    const snap = await db.collection("stats").listDocuments();
    const agg = {};
    for (const docRef of snap) {
      const d = await docRef.get();
      if (!d.exists) continue;
      agg[docRef.id] = d.data();
    }
    await db.collection("stats").doc("countries_agg").set(agg);
    return res.json({ ok: true, message: "rebuilt" });
  } catch (err) {
    console.error("admin/rebuild-countries error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ------------------- Utility: health & info -------------------
app.get("/health", (req, res) => {
  return res.json({ ok: true, ts: Date.now(), project: "al-mustafa-onlin-quran-academy" });
});

// ------------------- Mount app as Firebase Function -------------------
// Single entry: exports.api
exports.api = functions.https.onRequest(app);

// ------------------- Optional: legacy individual exports for compatibility (if you want) -------------------
// If you prefer separate function names too (keeps previous clients working)
exports.analytics = functions.https.onRequest(app);            // Urdu: backwards compat (same app)
exports.reward = functions.https.onRequest(app);
exports.watermarkMedia = functions.https.onRequest(app);
exports.adminApi = functions.https.onRequest(app);
exports.adminApi = functions.https.onRequest(adminApi);

// End of file
