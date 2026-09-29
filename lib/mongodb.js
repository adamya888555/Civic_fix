import { MongoClient } from "mongodb";

// Cache the client across serverless invocations (avoids connection exhaustion on Vercel)
let promise = global._mongoPromise;
export function getDb() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (!promise) {
    promise = global._mongoPromise = new MongoClient(process.env.MONGODB_URI).connect();
  }
  return promise.then((c) => c.db("civicfix"));
}
