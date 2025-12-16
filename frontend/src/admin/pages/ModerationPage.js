// pages/ModerationPage.js
import React, {useEffect, useState} from "react";
import { adminApiEndpoint } from "../../config/api";

export default function ModerationPage() {
  const [items, setItems] = useState([]);
  useEffect(()=> {
    (async ()=> {
      const res = await fetch(`${adminApiEndpoint}/events?limit=200`, { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }});
      const j = await res.json();
      setItems(j.rows || []);
    })();
  },[]);
  return (
    <div>
      <h2>Moderation / Raw Events</h2>
      <table border="1" cellPadding="6">
        <thead><tr><th>Time</th><th>Event</th><th>PostId</th><th>Country</th><th>Platform</th><th>User</th></tr></thead>
        <tbody>
          {items.map(it=> <tr key={it.id}><td>{it.timestamp?.toDate ? it.timestamp.toDate().toISOString() : it.timestamp}</td><td>{it.event}</td><td>{it.postId}</td><td>{it.country}</td><td>{it.platform}</td><td>{it.userId}</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}
