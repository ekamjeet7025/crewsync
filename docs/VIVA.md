# Explain CrewSync in your own words

## One-minute explanation
"CrewSync coordinates campus event volunteers. Organisers create events and shifts, volunteers join duties, replacements transfer assignments safely, and organisers record attendance. The main engineering challenge is maintaining correct rosters when several users act at once."

## Likely questions
**Why is this more than CRUD?**
Joining depends on capacity, overlapping times, current membership, and event state. Replacement is an atomic transfer, not simply deleting one row and creating another.

**Why MongoDB transactions?**
Several related writes must commit together. If the replacement cannot be added, the original volunteer must not disappear.

**Why update scheduleVersion?**
Two simultaneous requests could otherwise join different overlapping shifts. Both write the same user's document, forcing a conflict and a recheck.

**Authentication versus authorization?**
Authentication asks who you are. Authorization checks whether you own this particular event or assignment.

**What prevents bypassing a disabled button?**
The API repeats every important check. The frontend is not trusted to enforce business rules.

**How do you check overlaps?**
Existing start is before requested end AND existing end is after requested start. Adjacent shifts do not overlap.

**What happens if a volunteer requests cover?**
They stay assigned. Responsibility changes only after a replacement successfully accepts.

**What if two volunteers accept the same request?**
Their transactions compete on the same shift. One commits; the other retries and finds that the request is gone.

**Why HTTP-only cookies?**
Browser JavaScript cannot read them. Secure production cookies and same-origin mutation protection reduce exposure. XSS prevention and server-side authorization still matter.

**Why polling instead of WebSockets?**
Thirty-second updates are enough for this initial scope and simpler to deploy and debug.

**Can anyone become an organiser?**
Yes, for their own events only. Organiser is a product role, not system-wide admin authority.

**What would you add with more time?**
Pagination, verified campus membership, invitation-based organising teams, password reset, audit export, and notification delivery. Add these only after validating a real need.

**What are the honest limitations?**
No password reset or token revocation, no event editing, no WebSockets, and no private college tenant boundary. The dashboard needs pagination at larger scale. Test and deployment status must be reported accurately.

## Files to understand before the demo
Read server/service.js first, then server/app.js, server/models.js, src/api.js, and the state logic in src/main.jsx. Practise explaining a join request from click to database commit to updated dashboard.
