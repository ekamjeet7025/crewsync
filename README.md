# CrewSync

**Every volunteer. Every shift. In sync.**

CrewSync is a full-stack MERN application for managing campus event volunteers. Organisers create events and shifts, volunteers sign up for duties and arrange replacements, and event owners track staffing and attendance in one place.

[Live application](https://crewsync-hazel.vercel.app) · [GitHub repository](https://github.com/ekamjeet7025/crewsync)

**Author:** Ekamjeet Singh

## Why CrewSync?

Group chats and spreadsheets make it difficult to track unfilled duties, conflicting schedules, and last-minute cancellations. CrewSync brings those tasks into a shared workspace with clear ownership and scheduling rules.

## Features

- **Role-based accounts:** register as an organiser or volunteer, sign in, and sign out.
- **Event management:** organisers create events, add shifts with times and capacity, and cancel their events.
- **Shift signups:** volunteers browse events and join available duties. The API rejects full shifts, duplicate signups, overlapping commitments, and shifts that have already started.
- **Replacement requests:** volunteers request cover while remaining responsible for their shift. An eligible teammate can accept, transferring the assignment through a database transaction.
- **Attendance and coverage:** event owners mark attendance after a shift starts and identify understaffed duties.
- **Activity history:** track changes to event staffing.
- **Responsive interface:** search, upcoming/past filters, loading and error states, and automatic dashboard refresh every 30 seconds.

## Try it online

1. Open [CrewSync](https://crewsync-hazel.vercel.app).
2. Create an organiser account to create events and shifts.
3. Use a separate volunteer account to test signups and replacement requests.
4. Return to the organiser account to review coverage and attendance.

Create your own account on the deployed application. The local demo accounts described below are not automatically created in production.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Authentication | bcrypt password hashing, JWT in an HTTP-only cookie |
| Hosting | Vercel static frontend and API function |
| Testing | Node.js test runner, MongoDB Memory Server replica set |

## Local setup

Requires **Node.js 22.12 or newer** and npm.

```powershell
git clone https://github.com/ekamjeet7025/crewsync.git
cd crewsync
npm install
```

### Option 1: Local demo

```powershell
npm run build
npm run demo
```

Open http://127.0.0.1:3100.

The demo starts a local MongoDB replica set, creates synthetic accounts and events, and persists data in the ignored `.local-data/` directory. The first run may download a MongoDB binary. Stop the server with Ctrl+C. Restarting preserves records but generates a new signing key, so you will need to sign in again.

These accounts are for the local demo only. All use the public demo password **CrewSyncDemo2026!**.

| Role | Email |
|---|---|
| Organiser | organiser@crewsync.demo |
| Volunteer | volunteer@crewsync.demo |
| Replacement volunteer | cover@crewsync.demo |

Use only synthetic information in shared demo accounts.

### Option 2: MongoDB Atlas

1. Copy `.env.example` to `.env`.
2. Configure `MONGO_URI`, `MONGO_DB`, and `JWT_SECRET`.
3. Ensure Atlas permits connections from your development machine.
4. Build and start the app:

```powershell
npm run build
npm start
```

Open http://localhost:3100. For frontend development, run `npm run dev` and `npm run client` in separate terminals. Vite serves the frontend at http://localhost:5174 and proxies API requests to port 3100.

MongoDB must support transactions: use Atlas or a local replica set. Optional synthetic data can be added with `npm run seed` after setting `SEED_PASSWORD`.

## Environment variables

| Variable | Description |
|---|---|
| `MONGO_URI` | Server-only MongoDB connection string |
| `MONGO_DB` | Database name; defaults to `crewsync` |
| `JWT_SECRET` | Random signing secret of at least 32 characters |
| `PORT` | Local server port; defaults to `3100` |
| `NODE_ENV` | Use `production` for secure cookies on HTTPS deployments |
| `SEED_PASSWORD` | Optional synthetic account password for `npm run seed`; at least 10 characters |

Keep actual credentials in your local `.env` or hosting environment settings. Never commit them or expose them through frontend environment variables.

## Project structure

| Path | Purpose |
|---|---|
| `src/main.jsx` | Application state and feature views |
| `src/components/` | Authentication, forms, dialogs, and shared UI |
| `src/api.js` | API requests and error handling |
| `src/styles.css`, `src/polish.css` | Responsive layout and visual styling |
| `server/app.js` | Express routes, authentication, and access checks |
| `server/service.js` | Scheduling rules and transactional assignment changes |
| `server/models.js` | Mongoose schemas and indexes |
| `server/security.js` | Security headers and persistent authentication rate limiting |
| `server/db.js` | MongoDB connection management |
| `api/index.js` | Vercel API function entry point |
| `tests/` | Validation and workflow tests |
| `vercel.json` | Build settings and frontend/API routing |

## Checks and tests

```powershell
npm run check
npm run test:unit
npm run test:integration
npm run build
```

Integration tests use an isolated MongoDB replica set. They cover capacity races, concurrent overlapping signups, replacement requests, owner-only attendance, persistence, and cancellation. They require an environment that can start the MongoDB test process; the first run may need to download its binary.

## Deployment and submission

**Live application:** https://crewsync-hazel.vercel.app

**Source code:** https://github.com/ekamjeet7025/crewsync

To deploy your own instance:

1. Import the repository into Vercel with the repository root as the root directory.
2. Keep the build and routing configuration supplied by `vercel.json`.
3. Add `MONGO_URI`, `MONGO_DB`, `JWT_SECRET`, and `NODE_ENV=production` to the appropriate Vercel environment.
4. Configure Atlas network access to allow your hosting service to connect.
5. Deploy, then open `/api/health`. A working database connection returns `{"status":"ok","database":"connected"}`.
6. Create an account and test the organiser and volunteer workflows. Redeploy after changing Vercel environment variables.

For submission, use the live application and repository links above.

## Scope and limitations

- Organisers can manage only their own events.
- Events are visible to signed-in volunteers; college email verification is not included.
- A request for cover does not release the original volunteer until a replacement accepts.
- Dates are stored in UTC and displayed in the viewer's local timezone.
- Dashboard updates use polling every 30 seconds.
- Email/SMS notifications, waitlists, event editing, password recovery, and server-side token revocation are outside the current scope.
- MongoDB transactions require a replica set or sharded deployment.

## Acknowledgements

CrewSync uses the open-source dependencies listed in `package.json`. AI assistance was used during implementation and documentation.
