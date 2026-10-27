import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connect } from './db.js';
import { User, Event, Shift, Audit } from './models.js';
import { AppError, ensure, text, date, objectId, own, log, changeAssignment } from './service.js';
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], fontSrc: ["'self'"], objectSrc: ["'none'"], upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null } } }));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('X-CrewSync') !== '1') return res.status(403).json({ error: 'Missing request protection header.' }); next(); });
app.get('/api/health', async (req, res) => { await connect(); res.json({ status: 'ok', database: 'connected' }); });
app.use('/api', async (req, res, next) => { await connect(); next(); });
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' };
function publicUser(u) { return { _id: u._id, name: u.name, email: u.email, role: u.role }; }
function signIn(res, user) { ensure(process.env.JWT_SECRET?.length >= 32, 503, 'Authentication is not configured.'); res.cookie('crewsync_session', jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, { expiresIn: '12h', issuer: 'crewsync', audience: 'crewsync-web' }), { ...cookieOptions, maxAge: 43200000 }); res.json({ user: publicUser(user) }); }
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many sign-in attempts. Please try again in 15 minutes.' } });
app.post('/api/auth/register', authLimit, async (req, res) => {
  const name = text(req.body.name, 'Name', 60); const email = text(req.body.email, 'Email', 160).toLowerCase(); const password = text(req.body.password, 'Password', 72);
  ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 400, 'Enter a valid email address.'); ensure(password.length >= 10, 400, 'Use a password with at least 10 characters.');
  ensure(['volunteer', 'organiser'].includes(req.body.role), 400, 'Choose a valid account type.');
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: req.body.role }); signIn(res, user);
});
app.post('/api/auth/login', authLimit, async (req, res) => {
  const email = text(req.body.email, 'Email', 160).toLowerCase(); const password = text(req.body.password, 'Password', 72);
  const user = await User.findOne({ email });
  const valid = await bcrypt.compare(password, user?.passwordHash || '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxB.XT0H4Ji0RN1M8lJ8F8Mx9rG');
  ensure(user && valid, 401, 'Email or password is incorrect.'); signIn(res, user);
});
app.post('/api/auth/logout', (req, res) => { res.clearCookie('crewsync_session', cookieOptions); res.json({ ok: true }); });
app.use('/api', async (req, res, next) => {
  try { const payload = jwt.verify(req.cookies.crewsync_session || '', process.env.JWT_SECRET, { issuer: 'crewsync', audience: 'crewsync-web', algorithms: ['HS256'] }); req.user = await User.findById(payload.sub); ensure(req.user, 401, 'Please sign in again.'); }
  catch { throw new AppError(401, 'Please sign in to continue.'); } next();
});
app.get('/api/auth/me', (req, res) => res.json({ user: publicUser(req.user) }));
app.get('/api/dashboard', async (req, res) => {
  const events = await Event.find(req.user.role === 'organiser' ? { owner: req.user._id } : { status: 'published' }).sort({ startsAt: 1 }).lean();
  const shifts = await Shift.find({ event: { $in: events.map(e => e._id) }, cancelled: false }).sort({ startsAt: 1 }).lean();
  const activity = await Audit.find(req.user.role === 'organiser' ? { event: { $in: events.map(e => e._id) } } : { actor: req.user._id }).sort({ createdAt: -1 }).limit(12).lean();
  res.json({ events, shifts, activity });
});
app.post('/api/events', async (req, res) => {
  ensure(req.user.role === 'organiser', 403, 'Only organisers can create events.');
  const startsAt = date(req.body.startsAt, 'Start'); const endsAt = date(req.body.endsAt, 'End');
  ensure(endsAt > startsAt && startsAt > new Date(), 400, 'Choose a future start and an end after the start.');
  const data = { title: text(req.body.title, 'Title'), description: text(req.body.description, 'Description', 2000), location: text(req.body.location, 'Location'), category: text(req.body.category || 'Campus', 'Category', 40), startsAt, endsAt, owner: req.user._id };
  const event = await mongoose.connection.transaction(async session => { const [e] = await Event.create([data], { session }); await log(e._id, req.user, `created ${e.title}`, session); return e; });
  res.status(201).json({ event });
});
app.post('/api/events/:id/shifts', async (req, res) => {
  objectId(req.params.id); const startsAt = date(req.body.startsAt, 'Start'); const endsAt = date(req.body.endsAt, 'End');
  const capacity = req.body.capacity; ensure(Number.isInteger(capacity) && capacity >= 1 && capacity <= 100, 400, 'Capacity must be a whole number between 1 and 100.');
  const data = { title: text(req.body.title, 'Duty'), location: text(req.body.location, 'Location'), startsAt, endsAt, capacity, event: req.params.id };
  const shift = await mongoose.connection.transaction(async session => {
    const event = await Event.findByIdAndUpdate(req.params.id, { $set: { updatedAt: new Date() } }, { session, new: true }); own(event, req.user);
    ensure(event.status === 'published', 409, 'This event is cancelled.');
    ensure(startsAt >= event.startsAt && endsAt <= event.endsAt && endsAt > startsAt && startsAt > new Date(), 400, 'The shift must be in the future and within the event dates.');
    const [s] = await Shift.create([data], { session }); await log(event._id, req.user, `added ${s.title}`, session); return s;
  }); res.status(201).json({ shift });
});
app.post('/api/events/:id/cancel', async (req, res) => {
  objectId(req.params.id);
  await mongoose.connection.transaction(async session => { const event = await Event.findById(req.params.id).session(session); own(event, req.user); ensure(event.status !== 'cancelled', 409, 'This event is already cancelled.'); event.status = 'cancelled'; await event.save({ session }); await Shift.updateMany({ event: event._id }, { $set: { cancelled: true } }, { session }); await log(event._id, req.user, `cancelled ${event.title}`, session); });
  res.json({ ok: true });
});
app.post('/api/shifts/:id/:action', async (req, res, next) => {
  if (!['join', 'cover', 'request-cover', 'withdraw-cover'].includes(req.params.action)) return next();
  const shift = await changeAssignment(req.user, req.params.id, req.params.action, req.body.userId); res.json({ shift });
});
app.patch('/api/shifts/:id/attendance', async (req, res) => {
  objectId(req.params.id); objectId(req.body.userId); ensure(['present', 'absent', 'pending'].includes(req.body.status), 400, 'Invalid attendance status.');
  await mongoose.connection.transaction(async session => {
    const shift = await Shift.findById(req.params.id).session(session); ensure(shift && !shift.cancelled, 404, 'Shift not found.'); const event = await Event.findById(shift.event).session(session); own(event, req.user);
    ensure(shift.startsAt <= new Date(), 409, 'Attendance opens when the shift starts.');
    const assignment = shift.assignments.find(a => String(a.user) === req.body.userId); ensure(assignment, 404, 'Volunteer is not assigned to this shift.');
    assignment.attendance = req.body.status; await shift.save({ session }); await log(event._id, req.user, `marked ${assignment.name} ${req.body.status} for ${shift.title}`, session);
  }); res.json({ ok: true });
});
app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.use(express.static('dist'));
app.get('/{*path}', (req, res) => res.sendFile('index.html', { root: 'dist' }));
app.use((error, req, res, next) => {
  if (error.code === 11000) return res.status(409).json({ error: 'An account with this email already exists.' });
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'Invalid JSON request.' });
  const status = error.status || (error.name === 'VersionError' ? 409 : 500);
  if (status >= 500) console.error('Request failed:', error.name, error.code || '');
  res.status(status).json({ error: status >= 500 ? 'We could not complete this request. Please try again.' : error.message });
});
export default app;

