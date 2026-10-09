# Security and Privacy Checklist

## Before the First Push

- [x] `.gitignore` ignores `.env` and other `.env.*` files, while allowing `.env.example` files.
- [x] No actual `.env`, `.pem`, or `id_rsa` files appear in the tracked file list; only the root, client, and server `.env.example` files are tracked.
- [x] All three `.env.example` files use placeholders and example URLs, not working credentials.
- [x] The reported personal email was removed from current tracked files and rewritten out of all five commits on `main`. A targeted check found no matching email or private-key marker in reachable history. This does not replace a final review for other personal data or credentials.

## The Application

- [x] SQL queries use parameterized values; card values are passed separately from SQL in `server/cardsRepo.js`.
- [x] Server-side validation limits every text field in `server/server.js`, including image URLs (2,048 characters); JSON request bodies are capped at 100 KB.
- [x] CORS uses the configured `CORS_ORIGINS` allowlist in `server/server.js`.
- [x] The API's error handler returns a generic 500 response rather than a stack trace. The supplied Compose configuration sets `NODE_ENV=production` and enables Basic Authentication; keep credentials in ignored `.env` files or deployment settings.
- [x] Helmet is installed and enabled with `import helmet from 'helmet'` and `app.use(helmet())` in `server/server.js`.
- [x] `express-rate-limit` limits `/api` to 100 requests per IP per 15 minutes and returns 429 when the limit is exceeded. A live-server check confirmed this behavior.
- [ ] The supplied Compose configuration connects as PostgreSQL's `postgres` superuser. Use a least-privilege application role before exposing the API or database publicly. Docker is unavailable in this environment, so no role migration was applied or tested.
- [x] Password hashing is N/A: this app has no user accounts or stored per-user passwords; the optional production gate is shared Basic Authentication.
- [x] Ownership checks are N/A: the database schema and API are for one collection, with no multi-user support.
- [x] `npm audit --prefix client` and `npm audit --prefix server` each reported zero vulnerabilities on 2026-10-09.

## Privacy

- [ ] Confirm that no classmates' personal information appears anywhere in the repository or in any final recording. The checked-in app screenshots reviewed contain no people; no demo video is linked in `docs/05-demo-video.md` yet.
- [x] The stale Haunted Sightings fixture in `client/src/api/seed.json` has been cleared; it no longer contains unrelated sample reports.
- [ ] Confirm that real tester data has been removed from the database, browser storage, screenshots, and any recording before submission. Docker is unavailable here, and the target browser storage was not inspected, so those data stores remain unverified.
- [x] N/A: the card form requests card details, not account or identity information. A `DemoNotice` component contains a storage explanation, but it is not rendered by the current `App.jsx`; do not count it as an on-screen disclosure.
- [x] All six app screenshots in `assets/` were reviewed; they show the interface and card artwork, not photographs of people. Review any future footage before publishing a demo video.
- [ ] Verify the ownership, license, or attribution requirements for the card artwork, logo, fonts, and other bundled assets before public distribution.

## Journal Note

The main risks are leaking self-hosting credentials and exposing the API or database. Environment files are ignored, example files contain placeholders, SQL values are parameterized, CORS is allowlisted, Helmet is enabled, API rate limiting and image length validation are in place, and both package audits report zero vulnerabilities. The public site uses browser-only demo mode; the supplied Compose setup binds the API to localhost and keeps PostgreSQL off published host ports. Production Basic Authentication is enabled by the Compose configuration. The reported email was rewritten out of reachable `main` history; finish the full personal-data and credential review, verify local/tester data, and confirm asset licensing before making the repository public. Review any future demo recording before sharing it.