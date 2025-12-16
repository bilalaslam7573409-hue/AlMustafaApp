// AdminDashboard.js
import React from "react";
import IntlOverview from "../admin/pages/IntlOverview";
import PostStatsPage from "./pages/PostStatsPage";
import UsersPage from "./pages/UsersPage";
import ModerationPage from "./pages/ModerationPage";

export default function AdminDashboard() {
  const [route, setRoute] = React.useState("overview");
  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard — Al Mustafa</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={()=>setRoute("overview")}>Overview</button>
        <button onClick={()=>setRoute("posts")}>Post Stats</button>
        <button onClick={()=>setRoute("users")}>Users</button>
        <button onClick={()=>setRoute("moderation")}>Moderation</button>
      </div>
      <div>
        {route === "overview" && <IntlOverview />}
        {route === "posts" && <PostStatsPage />}
        {route === "users" && <UsersPage />}
        {route === "moderation" && <ModerationPage />}
      </div>
    </div>
  );
}
