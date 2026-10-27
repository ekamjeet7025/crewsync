# Architecture and engineering decisions

## Product boundary
CrewSync supports four workflows: event/shift creation, joining, replacement, attendance. Supporting functionality exists only to make those workflows usable.

## Data model
| Collection | Important fields | Purpose |
|---|---|---|
| User | name, unique email, passwordHash, role, scheduleVersion | Identity and concurrency lock for a volunteer's schedule |
| Event | owner, title, location, startsAt, endsAt, status | An organiser-owned event |
| Shift | event, title, dates, capacity, assignments[], cancelled | Bounded roster for a duty |
| Audit | event, actor, actorName, message, timestamps | Explain changes to the crew |
| AuthLimit | hashed IP/window ID, count, expiresAt | Shared login rate limit with TTL cleanup |

Assignments embed user ID, display name, cover flag, and attendance state. A shift has a maximum capacity of 100 so its roster remains bounded. Email and password hash are never included in volunteer rosters.

## Why transactions?
A join modifies a volunteer's schedule, a shift roster, and activity history. A replacement removes one member and adds another. These changes must either all happen or none happen.

### Protecting the last place
Two requests read capacity 1 and empty assignments. Without coordination both could succeed. Both transactions write the same shift document. MongoDB permits one to commit and retries the conflicting transaction; the retry observes the full roster and returns HTTP 409.

### Protecting overlaps across different shifts
Writing only the shift is insufficient: the same person could join two overlapping shifts simultaneously. Each transaction first increments that user's scheduleVersion. That shared write serialises the person's scheduling changes even when the target shifts differ.

### Interval rule
Two intervals overlap when:
```
existing.start < requested.end AND existing.end > requested.start
```
Adjacent shifts are allowed: a shift ending at 14:00 does not overlap one beginning at 14:00.

### Replacements
Requested -> still assigned -> replacement accepts -> original removed and replacement added in one transaction.
Capacity stays unchanged. Two simultaneous acceptances cannot both claim the same request. Withdrawing a request is also a transactional update.

### Cancellation
Cancellation updates the event and all of its shifts in one transaction. Cancelled shifts no longer participate in scheduling-conflict checks. Historical records are retained. Concurrent writes to affected shifts conflict and are revalidated.

## Authorization
Every protected API call verifies the JWT, loads the current database user, then checks the requested resource's owner where appropriate. Roles sent by a browser during later operations are ignored. Registering as an organiser creates an independent organiser, not a system administrator.

## Authentication and browser protections
- bcrypt password hashes.
- JWT issuer, audience, algorithm, and expiry checks.
- HTTP-only, SameSite=Lax cookie; Secure in production.
- Custom X-CrewSync header on mutations; no cross-origin access is enabled.
- JSON body size limit, explicit input whitelists, identifier validation.
- Security headers and restrictive content security policy.
- MongoDB-backed authentication attempt counter, shared across server instances.
- Errors expose actionable user messages rather than database details or stack traces.

## State and UI
React maintains session, fetched dashboard data, selected page/event, and form/loading/error state. Each successful mutation refreshes the dashboard. A 30-second refresh picks up other users' changes. The API remains authoritative; disabled buttons are convenience, not enforcement.

## Decisions deliberately avoided
- No Redux: one workspace does not need a global state framework.
- No WebSockets: polling is sufficient for this project and simpler to deploy.
- No AI API: it adds no value to scheduling correctness.
- No payments, SMS, or file uploads: unrelated to the four workflows.
- Same-origin hosting: avoids unnecessary CORS and third-party-cookie configuration.

## Growth limitations
The dashboard currently returns the relevant event/shift set in one response. Pagination and event-scoped reads are appropriate for larger deployments. Shared demonstration accounts are useful for evaluation but unsuitable for private real-world coordination.
