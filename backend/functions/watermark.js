// ✅ watermark.js — server-side watermarking

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const os = require("os");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

exports.watermarkMedia = async (req, res) => {
  try {
    const { mediaUrl, watermarkText } = req.body;
    if (!mediaUrl || !watermarkText) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    const tempFile = path.join(os.tmpdir(), "input.mp4");
    const outputFile = path.join(os.tmpdir(), "output.mp4");

    // Download file locally
    const bucket = admin.storage().bucket();
    const file = bucket.file(mediaUrl.replace(/^.*\/o\//, "").split("?")[0]);
    await file.download({ destination: tempFile });

    // Apply watermark text (bottom-left corner)
    await new Promise((resolve, reject) => {
      ffmpeg(tempFile)
        .videoFilters(`drawtext=text='${watermarkText}':x=10:y=H-th-10:fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5`)
        .on("end", resolve)
        .on("error", reject)
        .save(outputFile);
    });

    // Upload new watermarked file
    const outName = `watermarked/${Date.now()}_${path.basename(mediaUrl)}`;
    await bucket.upload(outputFile, {
      destination: outName,
      contentType: "video/mp4",
    });

    const [url] = await bucket.file(outName).getSignedUrl({
      action: "read",
      expires: "03-01-2100",
    });

    fs.unlinkSync(tempFile);
    fs.unlinkSync(outputFile);

    return res.json({ success: true, watermarkedUrl: url });
  } catch (err) {
    console.error("Watermark error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
