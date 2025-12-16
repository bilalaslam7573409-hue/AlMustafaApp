// pages/PostStatsPage.js
import React, {useState} from "react";
import { adminApiEndpoint } from "../../config/api";

export default function PostStatsPage(){
  const [postId, setPostId] = useState("");
  const [data, setData] = useState(null);
  async function load(){
    if(!postId) return alert("postId de do");
    const res = await fetch(`${adminApiEndpoint}/postStats?postId=${encodeURIComponent(postId)}`, { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }});
    const j = await res.json();
    setData(j);
  }
  return (
    <div>
      <h2>Post Stats</h2>
      <div>
        <input placeholder="Post ID" value={postId} onChange={e=>setPostId(e.target.value)} />
        <button onClick={load}>Load</button>
      </div>
      {data && (
        <div style={{marginTop:12}}>
          <h3>Totals</h3>
          <pre>{JSON.stringify(data.counts, null, 2)}</pre>
          <h3>Country Breakdown</h3>
          <pre>{JSON.stringify(data.countries, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
