// pages/UsersPage.js
import React, {useEffect, useState} from "react";
import { adminApiEndpoint } from "../../config/api";

export default function UsersPage(){
  const [rows, setRows] = useState([]);
  useEffect(()=> {
    (async ()=>{
      const res = await fetch(`${adminApiEndpoint}/users?limit=200`, { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }});
      const j = await res.json();
      setRows(j.rows || []);
    })();
  },[]);
  return (
    <div>
      <h2>Users</h2>
      <table border="1" cellPadding="6">
        <thead><tr><th>UID</th><th>Name</th><th>Email</th><th>Role</th><th>Coins</th></tr></thead>
        <tbody>
          {rows.map(r=> <tr key={r.id}><td>{r.id}</td><td>{r.displayName}</td><td>{r.email}</td><td>{r.role}</td><td>{r.coins||0}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
