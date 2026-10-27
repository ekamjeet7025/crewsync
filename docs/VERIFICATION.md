# Verification status
Recorded on 27 October 2026. This file distinguishes implementation from execution evidence.

| Check | Result |
|---|---|
| Production frontend build | Passed (final build) |
| Server JavaScript syntax | Passed |
| Validation/authorization unit tests | 5 passed, 0 failed |
| Database integration suite | Implemented, blocked before assertions by execution sandbox |
| Desktop/mobile browser checks | Not completed; Windows browser automation stopped |
| Git history | Separate local repository with development commits |
| GitHub publication | Not completed; new remote repository not created |
| Public deployment | Not completed; Vercel team authorization required |
| Recorded demo video | Not completed; narration and recording plan prepared |
| Official submission form | Not submitted; form URL not provided |

## Observed environment blockers
- The command sandbox denies loopback database connections with connect EACCES 127.0.0.1.
- The first temporary database attempt hit a WiredTiger file-rename permission error. The integration harness now uses an ignored project-local artifacts directory, but network permissions still prevent end-to-end execution here.
- External npm registry requests failed with network/DNS errors. Existing dependency installations and copied package cache were used for the local build.
- Browser automation could not reliably determine the current Windows browser URL and stopped for the turn.
- Vercel returned 403 for team project creation and provided a team authorization link.
- The GitHub connector has file/commit operations but no new-repository creation operation.

## Run in a normal terminal
```powershell
npm run check
npm run test:unit
npm run test:integration
npm run build
npm run demo
```
After integration tests pass, record their actual results here. Do not mark them passed based on the build.

## Manual workflow checks
1. Register an organiser; create a future event and shift.
2. Register two volunteers in separate browser sessions.
3. Compete for one place; only one should join.
4. Try overlapping duties; the second should be rejected.
5. Request cover; original assignment must remain.
6. Accept from the other account; exactly one replacement should appear.
7. Verify attendance is blocked before the shift starts.
8. Use the seeded started orientation shift; mark attendance and refresh.
9. Attempt organiser operations using another organiser; expect forbidden.
10. Cancel an event; its shifts must no longer be available.
11. Verify mobile navigation, sign-out, modal keyboard focus, empty states, and error messages.
12. Verify public links and seeded credentials in an incognito browser.
