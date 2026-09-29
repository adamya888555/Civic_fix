"use client";
import { useEffect, useState, useCallback } from "react";

const CATS = ["Pothole", "Garbage", "Streetlight", "Water", "Other"];
const STATUSES = ["Open", "In Progress", "Resolved"];
const COLORS = { Open: "#d9534f", "In Progress": "#f0ad4e", Resolved: "#5cb85c" };
const card = { background: "#fff", borderRadius: 10, padding: 14, marginBottom: 10, boxShadow: "0 1px 3px #0001" };
const input = { padding: 8, border: "1px solid #ccc", borderRadius: 6, width: "100%", boxSizing: "border-box", marginBottom: 8 };

export default function Home() {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("");
  const [err, setErr] = useState("");
  const [admin, setAdmin] = useState("");
  const [f, setF] = useState({ title: "", location: "", category: "Pothole", description: "" });

  const load = useCallback(async () => {
    const r = await fetch("/api/issues" + (filter ? `?category=${filter}` : ""));
    const d = await r.json();
    r.ok ? (setIssues(d), setErr("")) : setErr(d.error);
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault();
    const r = await fetch("/api/issues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json();
    if (!r.ok) return setErr(d.error);
    setF({ ...f, title: "", location: "", description: "" });
    load();
  }
  async function patch(id, body) {
    const r = await fetch(`/api/issues/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-key": admin }, body: JSON.stringify(body) });
    if (!r.ok) setErr((await r.json()).error);
    load();
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 20 }}>
      <h1>CivicFix</h1>
      <p style={{ color: "#555" }}>Report local issues, upvote the ones that matter, and track their resolution.</p>
      {err && <p style={{ color: "#c00" }}>{err}</p>}

      <form onSubmit={submit} style={card}>
        <input style={input} placeholder="Issue title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
        <input style={input} placeholder="Location (e.g. Sector 17 market)" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} required />
        <select style={input} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <textarea style={input} rows={2} placeholder="Details (optional)" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <button style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: 0, borderRadius: 6 }}>Report issue</button>
      </form>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select style={{ ...input, marginBottom: 0 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All categories</option>{CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input style={{ ...input, marginBottom: 0 }} type="password" placeholder="Admin key (optional)" value={admin} onChange={(e) => setAdmin(e.target.value)} />
      </div>

      {issues.map((i) => (
        <div key={i._id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <strong>{i.title}</strong>
            <span style={{ color: "#fff", background: COLORS[i.status], borderRadius: 12, padding: "2px 10px", fontSize: 12, height: "fit-content" }}>{i.status}</span>
          </div>
          <div style={{ fontSize: 13, color: "#666", margin: "4px 0" }}>{i.category} · {i.location} · {new Date(i.createdAt).toLocaleDateString()}</div>
          {i.description && <p style={{ margin: "6px 0" }}>{i.description}</p>}
          <button onClick={() => patch(i._id, { action: "upvote" })} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #ccc", background: "#fff" }}>▲ {i.votes}</button>
          {admin && <select style={{ marginLeft: 8, padding: 4 }} value={i.status} onChange={(e) => patch(i._id, { status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>}
        </div>
      ))}
      {!issues.length && <p style={{ color: "#888" }}>No issues yet. Be the first to report one.</p>}
    </main>
  );
}
