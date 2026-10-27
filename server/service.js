import mongoose from 'mongoose';
import { User, Event, Shift, Audit } from './models.js';
export class AppError extends Error { constructor(status, message) { super(message); this.status = status; } }
export function ensure(condition, status, message) { if (!condition) throw new AppError(status, message); }
export function text(value, label, max = 120) { ensure(typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max, 400, `${label} must be 1–${max} characters.`); return value.trim(); }
export function date(value, label) { const d = new Date(value); ensure(typeof value === 'string' && Number.isFinite(d.getTime()), 400, `${label} must be a valid date.`); return d; }
export function objectId(value) { ensure(typeof value === 'string' && /^[a-f\d]{24}$/i.test(value), 400, 'Invalid resource ID.'); return value; }
export function own(event, user) { ensure(event, 404, 'Event not found.'); ensure(String(event.owner) === String(user._id), 403, 'Only this event’s organiser can perform this action.'); }
export async function log(event, user, message, session) { await Audit.create([{ event, actor: user._id, actorName: user.name, message }], { session }); }
// The user write serialises bookings across different shifts; the shift write protects capacity.
// MongoDB retries transient transaction conflicts, rechecking all rules against current data.
export async function changeAssignment(user, shiftId, action, targetUser) {
  objectId(shiftId);
  if (action === 'cover') objectId(targetUser);
  return mongoose.connection.transaction(async session => {
    await User.updateOne({ _id: user._id }, { $inc: { scheduleVersion: 1 } }, { session });
    const shift = await Shift.findById(shiftId).session(session);
    ensure(shift && !shift.cancelled, 404, 'Shift not found or cancelled.');
    const event = await Event.findById(shift.event).session(session);
    ensure(event?.status === 'published', 409, 'This event is no longer accepting changes.');
    ensure(shift.startsAt > new Date(), 409, 'This shift has already started.');
    ensure(user.role === 'volunteer', 403, 'Use a volunteer account to join shifts.');
    const current = shift.assignments.find(a => String(a.user) === String(user._id));
    if (action === 'join' || action === 'cover') {
      ensure(!current, 409, 'You are already assigned to this shift.');
      const conflict = await Shift.exists({ cancelled: false, 'assignments.user': user._id, startsAt: { $lt: shift.endsAt }, endsAt: { $gt: shift.startsAt } }).session(session);
      ensure(!conflict, 409, 'This shift overlaps another shift you have joined.');
      if (action === 'cover') {
        const leaving = shift.assignments.find(a => String(a.user) === targetUser && a.replacementRequested);
        ensure(leaving, 409, 'This replacement request has already been filled or withdrawn.');
        shift.assignments = shift.assignments.filter(a => String(a.user) !== targetUser);
      } else ensure(shift.assignments.length < shift.capacity, 409, 'This shift is full. Try another shift.');
      shift.assignments.push({ user: user._id, name: user.name });
    } else {
      ensure(current, 404, 'You are not assigned to this shift.');
      if (action === 'request-cover') { ensure(!current.replacementRequested, 409, 'You already requested a replacement.'); current.replacementRequested = true; }
      else if (action === 'withdraw-cover') { ensure(current.replacementRequested, 409, 'There is no replacement request to withdraw.'); current.replacementRequested = false; }
      else throw new AppError(400, 'Unknown assignment action.');
    }
    await shift.save({ session });
    const messages = { join: `joined ${shift.title}`, cover: `accepted cover for ${shift.title}`, 'request-cover': `requested cover for ${shift.title}`, 'withdraw-cover': `withdrew a cover request for ${shift.title}` };
    await log(event._id, user, messages[action], session);
    return shift;
  });
}

