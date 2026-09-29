import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const CATS = ["Pothole", "Garbage", "Streetlight", "Water", "Other"];

export async function GET(req) {
  try {
    const cat = new URL(req.url).searchParams.get("category");
    const db = await getDb();
    const issues = await db.collection("issues")
      .find(cat && CATS.includes(cat) ? { category: cat } : {})
      .sort({ votes: -1, createdAt: -1 }).limit(100).toArray();
    return NextResponse.json(issues.map((i) => ({ ...i, _id: String(i._id) })));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const b = await req.json();
    const title = String(b.title || "").trim().slice(0, 100);
    const location = String(b.location || "").trim().slice(0, 100);
    const description = String(b.description || "").trim().slice(0, 500);
    if (!title || !location || !CATS.includes(b.category))
      return NextResponse.json({ error: "title, location and valid category required" }, { status: 400 });
    const doc = { title, location, description, category: b.category, status: "Open", votes: 0, createdAt: new Date() };
    const db = await getDb();
    const r = await db.collection("issues").insertOne(doc);
    return NextResponse.json({ ...doc, _id: String(r.insertedId) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
