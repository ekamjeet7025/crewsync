# CrewSync demo: 3–5 minutes
This is a recording plan and narration script, **not a recorded video**. Record the working application after running the integration tests and verifying deployment.

## Preparation
- Run npm run demo, or seed the deployed database.
- Open an organiser session and a separate private-browser volunteer session.
- Accounts: organiser@crewsync.demo, volunteer@crewsync.demo, cover@crewsync.demo.
- Local-demo password: CrewSyncDemo2026!
- Use a clean browser window, readable zoom, no visible secrets.
- Have a future event available and the started Crew Orientation shift for attendance.
- Use Windows Snipping Tool screen recording or a recorder you already trust. Record your own voice; do not spend the video scrolling through source code.

## 0:00–0:30 — Problem and audience
Say: "CrewSync helps college event organisers coordinate volunteers. Group chats make it hard to spot empty duties, overlapping assignments, and who is responsible when someone needs a replacement. CrewSync gives organisers and volunteers one shared workflow."

Show the dashboard, coverage count, and event cards.

## 0:30–1:20 — Organiser planning
Say: "An organiser creates an event and adds shifts with a location, start and end time, and required headcount. Each organiser can manage only their own events."

Create a short future event. Add a registration shift with capacity one. Add a second overlapping shift. Show the event and its coverage.

## 1:20–2:10 — Volunteer sign-up and rejection
Switch to the volunteer session. Open the new event and join the first shift.
Say: "The API checks capacity, duplicate membership, start time, and schedule conflicts before confirming."

Try the overlapping shift. The interface shows Schedule clash; also explain that the same rule is enforced server-side. Refresh to show the assignment persists.

## 2:10–3:00 — Replacement
From My shifts, select Find cover.
Say: "Requesting cover does not abandon the duty. I remain assigned until another eligible volunteer accepts."

Use the replacement account to accept the request. Refresh both sessions.
Say: "The transfer is atomic: the original volunteer is removed and the new volunteer is added together. Two people cannot claim the same request."

## 3:00–3:40 — Attendance and accountability
Return to the organiser. Open Attendance and the already-started Crew Orientation shift. Mark a volunteer Present. Show the updated count and recent activity.

Say: "Attendance opens at the shift start and only the event owner can change it."

## 3:40–4:20 — Engineering and close
Say: "CrewSync uses React, Express, Node.js, and MongoDB. MongoDB transactions protect the last available place. A shared user-document write also prevents simultaneous bookings into different overlapping shifts. Authentication uses a hashed password and HTTP-only cookie. The product handles loading, empty, success, and error states."

Show the README and verified links briefly. State only test results that actually passed.

## Publish and verify
Upload the recording to a location your evaluator can access. If using an unlisted video, check it in an incognito window. Put the verified link in docs/SUBMISSION.md. Do not submit this script as the video.
