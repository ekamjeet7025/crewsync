import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const userSchema = new Schema({ name: { type: String, required: true }, email: { type: String, unique: true, required: true }, passwordHash: { type: String, required: true }, role: { type: String, enum: ['organiser', 'volunteer'], required: true }, scheduleVersion: { type: Number, default: 0 } }, { timestamps: true });
const eventSchema = new Schema({ title: String, description: String, location: String, category: String, startsAt: Date, endsAt: Date, owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }, status: { type: String, enum: ['published', 'cancelled'], default: 'published' } }, { timestamps: true });
const assignmentSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User' }, name: String, replacementRequested: { type: Boolean, default: false }, attendance: { type: String, enum: ['pending', 'present', 'absent'], default: 'pending' } }, { _id: false });
const shiftSchema = new Schema({ event: { type: Schema.Types.ObjectId, ref: 'Event', required: true }, title: String, location: String, startsAt: Date, endsAt: Date, capacity: Number, assignments: [assignmentSchema], cancelled: { type: Boolean, default: false } }, { timestamps: true, optimisticConcurrency: true });
shiftSchema.index({ 'assignments.user': 1, startsAt: 1, endsAt: 1 });
shiftSchema.index({ event: 1, startsAt: 1 });
const auditSchema = new Schema({ event: { type: Schema.Types.ObjectId, ref: 'Event' }, actor: { type: Schema.Types.ObjectId, ref: 'User' }, actorName: String, message: String }, { timestamps: true });
auditSchema.index({ event: 1, createdAt: -1 });
export const User = mongoose.models.User || model('User', userSchema);
export const Event = mongoose.models.Event || model('Event', eventSchema);
export const Shift = mongoose.models.Shift || model('Shift', shiftSchema);
export const Audit = mongoose.models.Audit || model('Audit', auditSchema);

