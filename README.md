# CivicFix: Cloud-based civic issue tracker

## 1. Problem analysis
**Problem:** In Indian cities, complaints about potholes, uncollected garbage, dead streetlights and water leaks are scattered across phone calls, WhatsApp groups and slow municipal portals. Consequences:
- Authorities have no single, prioritised view of what citizens care about most.
- Duplicate complaints waste effort; citizens get no visibility on progress.
- Repairs are reactive and often delayed because urgency is unclear.

**Stakeholders:** residents (report, vote, track), municipal staff (triage, update status), local councillors (see hot spots).

**Requirements**
| Functional | Non-functional |
|---|---|
| Submit an issue (title, location, category) | Available 24x7 from any device |
| Upvote to signal urgency (dedupes "me too" reports) | Scales during spikes (e.g. monsoon) |
| Filter by category; ranked by votes | Low cost / pay-per-use |
| Admin updates status Open -> In Progress -> Resolved | Input validated; admin actions protected |

## 2. Why cloud?
- **Elasticity:** Vercel serverless functions scale to zero and burst automatically.
- **DBaaS:** MongoDB Atlas is managed (backups, replication), so no server maintenance.
- **Global access and CI/CD:** every `git push` deploys; HTTPS and CDN are included.
- **Cost:** both free tiers are enough for a prototype (pay-per-use model).

## 3. Architecture
Browser (React UI) -> Vercel CDN/Edge -> Next.js API routes (serverless functions) -> MongoDB Atlas (`civicfix.issues`)

Model layers: Vercel = PaaS/serverless (FaaS), Atlas = DBaaS, the app = SaaS for end users.

**Data model (`issues`):** `{ title, location, category, description, status, votes, createdAt }`

**API**
- `GET /api/issues?category=` list (sorted by votes)
- `POST /api/issues` create
- `PATCH /api/issues/:id` `{action:"upvote"}` (public) or `{status}` (requires `x-admin-key`)

**Design decisions:** the Mongo client is cached globally to avoid connection exhaustion in serverless; server-side validation and length limits; `$inc` gives atomic vote counts.

## 4. Deploy
1. **Atlas:** create a free M0 cluster -> Database Access: add a user -> Network Access: allow `0.0.0.0/0` (Vercel uses dynamic IPs) -> Connect -> copy the connection string.
2. **Local test:** `cp .env.example .env.local`, fill in values, `npm install && npm run dev`.
3. **GitHub:** push this folder to a repo.
4. **Vercel:** Import the repo -> Environment Variables: `MONGODB_URI`, `ADMIN_KEY` -> Deploy.

## 5. Limitations and future work
Votes are not per-user (add auth, e.g. NextAuth, to prevent repeat voting); add image upload (Vercel Blob), map view with geolocation, email/SMS notifications, and per-issue comments.
