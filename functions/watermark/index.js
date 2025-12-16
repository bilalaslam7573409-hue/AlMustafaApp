// ✅ D:\AlMustafaApp\functions\watermark\index.js
// Node/Express style placeholder — adapt to your cloud provider (Firebase Functions, Netlify, etc.)
const express = require("express");
const fetch = require("node-fetch");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());

/*
  Expected POST body: { postId, url, type }
  Steps (example):
  1) Download file to /tmp
  2) Run ffmpeg to overlay watermark PNG or text
  3) Upload processed file to your storage (e.g., Firebase Storage) and update DB
*/

app.post("/watermark", async (req, res) => {
  const { postId, url, type } = req.body;
  if (!postId || !url) return res.status(400).send("missing fields");

  try {
    const tmpIn = path.join("/tmp", `${postId}_in${type==="video"?".mp4":".jpg"}`);
    const tmpOut = path.join("/tmp", `${postId}_out${type==="video"?".mp4":".jpg"}`);

    // download file (simple)
    const r = await fetch(url);
    const buffer = await r.buffer();
    fs.writeFileSync(tmpIn, buffer);

    // watermark command using ffmpeg (text watermark)
    if (type === "video") {
      // overlay text bottom-left with gold color
      const cmd = `ffmpeg -y -i "${tmpIn}" -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='🕌 Al Mustafa    WhatsApp:+92XXXXXXXXX':fontcolor=white@0.9:fontsize=24:box=1:boxcolor=0x0b3d0bAA:boxborderw=10:x=10:y=H-th-10" -c:a copy "${tmpOut}"`;
      await execPromise(cmd);
    } else {
      // image watermark (text)
      const cmd = `ffmpeg -y -i "${tmpIn}" -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='🕌 Al Mustafa  WhatsApp:+92XXXXXXXXX':fontcolor=white@0.9:fontsize=24:box=1:boxcolor=0x0b3d0bAA:boxborderw=6:x=10:y=H-th-10" "${tmpOut}"`;
      await execPromise(cmd);
    }

    // TODO: upload tmpOut to your storage (Firebase / S3) -> get processedURL
    // TODO: update DB post doc with processedURL and set status=published

    // cleanup
    fs.unlinkSync(tmpIn);
    // leave out file for upload step

    return res.json({ ok: true, message: "watermark applied (placeholder). Now upload tmpOut to storage and update DB." });
  } catch (err) {
    console.error("watermark error", err);
    return res.status(500).json({ ok: false, err: err.message });
  }
});

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve({ stdout, stderr });
    });
  });
}

module.exports = app;
