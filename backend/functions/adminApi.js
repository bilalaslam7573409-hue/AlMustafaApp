// ---------------------------------------------------------
//        🕌 Al Mustafa — ADMIN DASHBOARD API (FULL)
//     Country Stats + Post Stats + CSV Export System
// ---------------------------------------------------------

const express = require("express");
const admin = require("firebase-admin");
const { stringify } = require("csv-stringify/sync");
const rateLimit = require("rate-limiter-flexible");

const router = express();

// Middleware
router.use(express.json());

// ---------------------------------------------------------
//  ✔ Rate Limiter for Admin API (Extra Security)
// ---------------------------------------------------------
const rateLimiter = new rateLimit.RateLimiterMemory({
  points: 20,  // Max requests
  duration: 10 // Per 10 seconds
});

async function limit(req, res, next) {
  try {
    await rateLimiter.consume("admin-api");
    next();
  } catch (err) {
    return res.status(429).json({ error: "Too Many Requests (Rate Limited)" });
  }
}

router.use(limit);

// ---------------------------------------------------------
//  ✔ Admin Authentication (Role = admin required)
// ---------------------------------------------------------
async function isAdmin(req, res, next) {
  try {
    const adminSecret = process.env.ADMIN_SECRET || "ALMUSTAFA999";
    const headerKey = req.headers["x-admin-key"];

    if (!headerKey || headerKey !== adminSecret) {
      return res.status(401).json({ error: "Unauthorized: Invalid Admin Key" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

router.use(isAdmin);

// ---------------------------------------------------------
//  ✔ Fetch ALL Countries Stats (Views, Likes, Shares, Comments)
// ---------------------------------------------------------
router.get("/country-stats", async (req, res) => {
  try {
    const snap = await admin.firestore().collection("stats/countries").get();
    const data = [];

    snap.forEach((doc) => {
      const row = doc.data();
      data.push({
        country: doc.id,
        views: row.views || 0,
        likes: row.likes || 0,
        shares: row.shares || 0,
        comments: row.comments || 0,
        total: row.total || 0
      });
    });

    res.json({ ok: true, countries: data });
  } catch (err) {
    console.error("country-stats error:", err);
    return res.status(500).json({ error: err.message });
  }
});
// ---------------------------------------------------------
//  ✔ Top Countries API (for frontend charts)
// ---------------------------------------------------------
router.get("/topCountries", async (req, res) => {
  try {
    const event = req.query.event || "total";

    const snap = await admin.firestore().collection("stats").listDocuments();
    const out = [];

    for (const docRef of snap) {
      const d = await docRef.get();
      if (!d.exists) continue;
      const data = d.data();
      let value = 0;

      if (event === "views") value = data.views || 0;
      else if (event === "likes") value = data.likes || 0;
      else if (event === "shares") value = data.shares || 0;
      else if (event === "comments") value = data.comments || 0;
      else value = data.total || ((data.views || 0) + (data.likes || 0) + (data.shares || 0) + (data.comments || 0));

      out.push({ country: docRef.id, value });
    }

    out.sort((a, b) => b.value - a.value);

    return res.json({ ok: true, top: out.slice(0, 50) });
  } catch (err) {
    console.error("topCountries error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
//  ✔ Fetch Stats of ONE Post (with country details)
// ---------------------------------------------------------
router.get("/post/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    const statsRef = admin.firestore().doc(`stats/posts/${postId}`);
    const statsDoc = await statsRef.get();

    const breakdownRef = admin.firestore().doc(`stats/posts/${postId}_countries`);
    const breakdownDoc = await breakdownRef.get();

    return res.json({
      ok: true,
      postId,
      stats: statsDoc.exists ? statsDoc.data() : {},
      countryBreakdown: breakdownDoc.exists ? breakdownDoc.data() : {}
    });
  } catch (err) {
    console.error("post-stats error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
//  ✔ Admin CSV Download — Country Stats
// ---------------------------------------------------------
router.get("/download/countries", async (req, res) => {
  try {
    const snap = await admin.firestore().collection("stats/countries").get();

    const rows = [];

    snap.forEach((doc) => {
      const row = doc.data();

      rows.push({
        country: doc.id,
        views: row.views || 0,
        likes: row.likes || 0,
        shares: row.shares || 0,
        comments: row.comments || 0,
        total: row.total || 0
      });
    });

    const csv = stringify(rows, { header: true });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=countries_stats.csv");
    return res.send(csv);
  } catch (err) {
    console.error("csv-download error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
//  ✔ Admin CSV Download — Raw Logs (analytics collection)
// ---------------------------------------------------------
router.get("/download/analytics", async (req, res) => {
  try {
    const snap = await admin.firestore().collection("analytics").limit(5000).get();

    const rows = [];

    snap.forEach((doc) => {
      const d = doc.data();
      rows.push({
        event: d.event,
        postId: d.postId,
        userId: d.userId,
        country: d.country,
        city: d.city,
        platform: d.platform,
        referrer: d.referrer,
        timestamp: d.timestamp && d.timestamp.toDate()
      });
    });

    const csv = stringify(rows, { header: true });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=analytics_raw.csv");
    return res.send(csv);
  } catch (err) {
    console.error("csv-raw-log error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
//  ✔ Admin — All Users Summary (for dashboard)
// ---------------------------------------------------------
router.get("/users", async (req, res) => {
  try {
    const snap = await admin.firestore().collection("users").limit(5000).get();

    const users = [];

    snap.forEach((doc) => {
      const u = doc.data();
      users.push({
        id: doc.id,
        name: u.name || "",
        coins: u.coins || 0,
        role: u.role || "user",
        country: u.country || "",
        joined: u.createdAt || null
      });
    });

    res.json({ ok: true, users });
  } catch (err) {
    console.error("admin users error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
//  ✔ End
// ---------------------------------------------------------
module.exports = router;
