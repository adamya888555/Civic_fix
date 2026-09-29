import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const STATUSES = ["Open", "In Progress", "Resolved"];

export async function PATCH(req, { params }) {
  try {
    if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
    const b = await req.json();
    const _id = new ObjectId(params.id);
    const col = (await getDb()).collection("issues");
    if (b.action === "upvote") {
      await col.updateOne({ _id }, { $inc: { votes: 1 } });
    } else if (STATUSES.includes(b.status)) {
      if (req.headers.get("x-admin-key") !== process.env.ADMIN_KEY)
        return NextResponse.json({ error: "admin key required" }, { status: 401 });
      await col.updateOne({ _id }, { $set: { status: b.status } });
    } else {
      return NextResponse.json({ error: "invalid action" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
