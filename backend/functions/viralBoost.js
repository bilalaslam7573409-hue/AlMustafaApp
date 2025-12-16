const express = require("express");
const admin = require("firebase-admin");
const app = express();
app.use(express.json());

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

app.post("/", async (req, res) => {
  const { postId, userId, platform } = req.body;

  if (!postId) return res.status(400).send("missing postId");

  const postRef = db.collection("videos").doc(postId);

  await postRef.set(
    {
      shareCount: admin.firestore.FieldValue.increment(1),
      boostScore: admin.firestore.FieldValue.increment(5),
      lastSharedAt: admin.firestore.FieldValue.serverTimestamp(),
      sharedBy: admin.firestore.FieldValue.arrayUnion({ userId, platform }),
    },
    { merge: true }
  );

  return res.json({ ok: true, boosted: true });
});

module.exports = app;
