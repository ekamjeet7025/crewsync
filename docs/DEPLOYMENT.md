# Deploy CrewSync

## Current status
No public deployment has been verified yet. The Vercel connector can read the account but needs team access approval before it can create this project. Do not submit a guessed URL.

## GitHub repository
Create a new empty repository named **crewsync** under your account. Do not initialise it with a README or license because this folder already has a Git history.

From the crew sync folder:
```powershell
git remote add origin https://github.com/ekamjeet7025/crewsync.git
git push -u origin main
```
If origin already exists, inspect git remote -v first. Do not force-push. Do not push this project into the ShopKart repository.

## Database
Use MongoDB Atlas or another MongoDB replica set.
- Choose a separate database, e.g. crewsync.
- Configure a database user and network access appropriate to the hosting service.
- Keep connection strings in server-side environment variables.
- Transactions must be supported; standalone MongoDB will not work for scheduling.

## Vercel
1. Import the new CrewSync GitHub repository.
2. Project root: repository root.
3. Framework: Vite.
4. Build command: npm run build.
5. Output directory: dist.
6. Add server-side environment variables: MONGO_URI, MONGO_DB, JWT_SECRET, NODE_ENV=production.
7. Deploy. vercel.json routes /api/* to the Express function.
8. If using sample accounts, run npm run seed locally against the same database with SEED_PASSWORD configured. This seed is non-destructive.
9. Open /api/health and verify it returns status=ok and database=connected.
10. Register an account, create an event and shift, then use a second account to join. Refresh and verify persistence.

The frontend uses relative /api URLs, so it does not need VITE_API_URL.

## Alternative: a single Node service
The same project can run on a Node hosting service:
- Build: npm install && npm run build
- Start: npm start
- Environment variables: same as above, plus the service's PORT where required.
- Express serves the built frontend and API from the same origin.

## Release checks
- Run npm run check, npm test, and npm run build.
- Make sure .env and .local-data are not tracked.
- Verify the deployed link in a signed-out/incognito browser.
- Confirm organisers cannot manage each other's events.
- Confirm a refresh preserves assignments.
- Check mobile layout and a rejected operation.
- Add the actual repository and deployment links to README and SUBMISSION.md only after verifying them.

## Troubleshooting
| Symptom | Check |
|---|---|
| querySrv timeout | DNS/network access and Atlas URI |
| connect EACCES in agent runtime | Run from your normal terminal; this sandbox blocks loopback networking |
| Transaction numbers only allowed on replica set | Use Atlas or the local demo replica set |
| Secure cookie not sent on local HTTP | NODE_ENV=development locally |
| Authentication not configured | JWT_SECRET must have at least 32 characters |
| No demo events | Run npm run seed with SEED_PASSWORD |
| Demo events are now in the past | Create new events; seed does not reset data |
| API returns HTML | Check rewrites and api/index.js deployment |
