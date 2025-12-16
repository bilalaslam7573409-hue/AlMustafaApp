// ✅ D:\AlMustafaApp\frontend\src\components\UploadPost\UploadPost.js
import React, { useState } from "react";
import { storage, db, auth } from "../../firebase"; // must exist
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Box, TextField, Button, LinearProgress, Typography } from "@mui/material";
import imageCompression from "browser-image-compression";

/*
 UploadPost:
 - file select (video/image)
 - client-side compress image / check video size
 - generate thumbnail (for video using canvas)
 - preview watermark overlay
 - upload file to Firebase Storage, create Firestore post doc
 - call cloud function to apply server-side watermark (placeholder URL)
 - call reward-cloud-function placeholder to grant coins to uploader
*/

export default function UploadPost() {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("video");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);
  const [thumbDataUrl, setThumbDataUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const pickFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type.startsWith("image/")) setType("image");
    else if (f.type.startsWith("video/")) setType("video");
    setFile(f);

    // if image, compress
    if (f.type.startsWith("image/")) {
      const options = { maxSizeMB: 1.2, maxWidthOrHeight: 1600, useWebWorker: true };
      try {
        const compressed = await imageCompression(f, options);
        const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
        setThumbDataUrl(dataUrl);
      } catch (err) {
        console.error("image compress error", err);
      }
    } else {
      // for video, generate thumbnail frame at 1s
      generateVideoThumbnail(f);
    }
  };

  const generateVideoThumbnail = (videoFile) => {
    const url = URL.createObjectURL(videoFile);
    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.currentTime = 1;
    video.addEventListener("loadeddata", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL("image/jpeg");
      setThumbDataUrl(dataURL);
      URL.revokeObjectURL(url);
    });
  };

  const handleUpload = async () => {
    if (!file) return alert("Please choose a file.");
    if (title.trim().length === 0) return alert("Please add a title.");
    if (title.length > 150) return alert("Title must be 150 characters or less.");

    setUploading(true);
    try {
      // upload to Firebase Storage
      const uid = auth.currentUser?.uid || "anon";
      const path = `${type === "video" ? "videos" : "images"}/${uid}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on("state_changed", (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(Math.round(prog));
      });

      await new Promise((resolve, reject) => {
        uploadTask.then(async (snap) => {
          const downloadURL = await getDownloadURL(snap.ref);
          // create Firestore post doc
          const postDoc = {
            ownerId: auth.currentUser?.uid || null,
            ownerName: auth.currentUser?.displayName || "Guest",
            title: title.slice(0, 150),
            caption,
            type,
            originalUrl: downloadURL,
            thumbnail: thumbDataUrl || null,
            createdAt: serverTimestamp(),
            likes: 0,
            comments: 0,
            shares: 0,
            status: "pending", // moderation pipeline will update
          };
          const docRef = await addDoc(collection(db, "posts"), postDoc);

          // call cloud function to apply server watermark & moderation (placeholder)
          try {
            await fetch("/.netlify/functions/watermark", { // change endpoint according to your cloud function
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ postId: docRef.id, url: downloadURL, type }),
            });
          } catch (err) {
            console.warn("Watermark function call failed (placeholder)", err);
          }

          // call reward coins cloud function to credit uploader
          try {
            await fetch("/.netlify/functions/creditCoins", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: auth.currentUser?.uid, postId: docRef.id, coins: 10 }),
            });
          } catch (err) {
            console.warn("Reward credit function call failed (placeholder)", err);
          }

          resolve();
        }).catch(reject);
      });

      alert("Uploaded. Post created and sent for processing.");
      // reset
      setFile(null); setTitle(""); setCaption(""); setThumbDataUrl(""); setProgress(0);
    } catch (err) {
      console.error("upload error", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Upload Post (Image / Video)</Typography>

      <input type="file" accept="video/*,image/*" onChange={pickFile} />
      {thumbDataUrl && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle2">Thumbnail preview with watermark</Typography>
          <div style={{ position: "relative", display: "inline-block", marginTop: 8 }}>
            <img src={thumbDataUrl} alt="thumb" style={{ maxWidth: 320, borderRadius: 8, display: "block" }} />
            {/* client-side watermark preview */}
            <div style={{
              position: "absolute", left: 10, top: 10, background: "rgba(11,61,11,0.6)", color: "#fff",
              padding: "4px 8px", borderRadius: 6, fontWeight: 700, fontSize: 12
            }}>🕌 Al Mustafa — WhatsApp: +92XXXXXXXXX</div>
          </div>
        </Box>
      )}

      <TextField fullWidth label="Title (max 150 chars)" value={title} onChange={(e)=> setTitle(e.target.value)} sx={{ mt: 1 }} inputProps={{ maxLength: 150 }} />
      <TextField fullWidth label="Caption" value={caption} onChange={(e)=> setCaption(e.target.value)} sx={{ mt: 1 }} multiline rows={3} />

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button variant="contained" onClick={handleUpload} disabled={uploading}>Upload</Button>
        <Button variant="outlined" onClick={() => { setFile(null); setThumbDataUrl(""); setTitle(""); setCaption(""); }}>Reset</Button>
      </Box>

      {uploading && <Box sx={{ mt: 2 }}><LinearProgress variant="determinate" value={progress} /></Box>}
    </Box>
  );
}
