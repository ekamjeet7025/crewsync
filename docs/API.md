# API reference
All responses are JSON. Mutations require Content-Type: application/json and X-CrewSync: 1. Authentication uses the crewsync_session cookie; browsers send it automatically.

| Method | URL | Access | Body |
|---|---|---|---|
| GET | /api/health | Public | None |
| POST | /api/auth/register | Public, rate limited | name, email, password, role |
| POST | /api/auth/login | Public, rate limited | email, password |
| POST | /api/auth/logout | Public | {} |
| GET | /api/auth/me | Signed in | None |
| GET | /api/dashboard | Signed in | None |
| POST | /api/events | Organiser | title, description, location, category, startsAt, endsAt |
| POST | /api/events/:id/shifts | Event owner | title, location, startsAt, endsAt, capacity |
| POST | /api/events/:id/cancel | Event owner | {} |
| POST | /api/shifts/:id/join | Volunteer | {} |
| POST | /api/shifts/:id/request-cover | Assigned volunteer | {} |
| POST | /api/shifts/:id/withdraw-cover | Requesting volunteer | {} |
| POST | /api/shifts/:id/cover | Eligible volunteer | userId of person requesting cover |
| PATCH | /api/shifts/:id/attendance | Event owner, after start | userId, status |

## Types
- role: organiser or volunteer
- attendance status: pending, present, absent
- dates: ISO 8601 strings, preferably with explicit timezone
- capacity: integer 1 through 100
- identifiers: 24-character hexadecimal ObjectIDs

## Successful responses
Authentication returns { user: { _id, name, email, role } }.
Dashboard returns { events, shifts, activity }.
Creation returns { event } or { shift }.
Cancellation and attendance return { ok: true }.

## Failures
All expected failures return { error: "Actionable message" }.
- 400: invalid fields, invalid ID, invalid interval or capacity.
- 401: missing or invalid session.
- 403: wrong role, wrong owner, or missing request protection header.
- 404: resource missing/cancelled, missing assignment, unknown endpoint.
- 409: duplicate account/assignment, overlapping shift, full shift, claimed cover request, disallowed state.
- 429: too many authentication attempts; Retry-After specifies wait.
- 500: unexpected/database failure, with a generic client message.

## Example event
```json
{
  "title": "Campus Culture Fest",
  "description": "A campus celebration organised by the student crew.",
  "location": "Open-air auditorium",
  "category": "Cultural",
  "startsAt": "2030-11-01T10:00:00.000Z",
  "endsAt": "2030-11-01T18:00:00.000Z"
}
```
Use dates in the future when testing.
