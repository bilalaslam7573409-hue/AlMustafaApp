// D:\AlMustafaApp\frontend\src\admin\pages\IntlOverview.js
import React, { useEffect, useState } from "react";
import { fetchCountryStats, fetchTopCountries, downloadCountriesCSV } from "../../api/adminClient";
import { saveBlobAsFile } from "../../utils/downloadCSV";

export default function IntlOverview() {
  const [countries, setCountries] = useState([]);
  const [topViews, setTopViews] = useState([]);
  const [topLikes, setTopLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);
      const cs = await fetchCountryStats();
      setCountries(cs.countries || []);

      const tv = await fetchTopCountries("views");
      setTopViews(tv.top || []);

      const tl = await fetchTopCountries("likes");
      setTopLikes(tl.top || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleDownloadCountriesCSV() {
    try {
      setLoading(true);
      const blob = await downloadCountriesCSV();
      saveBlobAsFile(blob, "countries_stats.csv");
    } catch (err) {
      console.error(err);
      setError(err.message || "CSV download failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ direction: "rtl", textAlign: "right" }}>International Overview — ملکوں کی جھلک</h2>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <button onClick={loadAll} disabled={loading}>Refresh</button>
          <button onClick={handleDownloadCountriesCSV} style={{ marginLeft: 8 }} disabled={loading}>Download CSV</button>
        </div>
        <div style={{ color: "#666" }}>{loading ? "Loading..." : "Live"}</div>
      </div>

      {error && <div style={{ color: "red", marginBottom: 8 }}>Error: {error}</div>}

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h3 style={{ textAlign: "right" }}>Top Countries - Views</h3>
          <ol>
            {topViews.map(it => <li key={it.country} style={{ direction: "rtl" }}>{it.country} — {it.value}</li>)}
          </ol>
        </div>

        <div style={{ flex: 1, minWidth: 280 }}>
          <h3 style={{ textAlign: "right" }}>Top Countries - Likes</h3>
          <ol>
            {topLikes.map(it => <li key={it.country} style={{ direction: "rtl" }}>{it.country} — {it.value}</li>)}
          </ol>
        </div>

        <div style={{ flex: 1, minWidth: 320 }}>
          <h3 style={{ textAlign: "right" }}>All Countries (Live)</h3>
          <div style={{ maxHeight: 360, overflow: "auto", border: "1px solid #eee", padding: 8 }}>
            <table style={{ width: "100%", direction: "rtl" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "right" }}>ملک</th>
                  <th style={{ textAlign: "right" }}>Views</th>
                  <th style={{ textAlign: "right" }}>Likes</th>
                  <th style={{ textAlign: "right" }}>Shares</th>
                  <th style={{ textAlign: "right" }}>Comments</th>
                </tr>
              </thead>
              <tbody>
                {countries.map(c => (
                  <tr key={c.country}>
                    <td style={{ textAlign: "right" }}>{c.country}</td>
                    <td style={{ textAlign: "right" }}>{c.views}</td>
                    <td style={{ textAlign: "right" }}>{c.likes}</td>
                    <td style={{ textAlign: "right" }}>{c.shares}</td>
                    <td style={{ textAlign: "right" }}>{c.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
