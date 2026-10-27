import { createHash } from 'node:crypto';
import mongoose from 'mongoose';
const limitSchema = new mongoose.Schema({ _id: String, count: { type: Number, default: 0 }, expiresAt: { type: Date, expires: 0 } });
const AuthLimit = mongoose.models.AuthLimit || mongoose.model('AuthLimit', limitSchema);
export function securityHeaders(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
  });
  if (process.env.NODE_ENV === 'production') res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}
export async function authLimit(req, res, next) {
  const window = Math.floor(Date.now() / 900000);
  const id = createHash('sha256').update((req.ip || 'unknown') + ':' + window).digest('hex');
  const record = await AuthLimit.findOneAndUpdate({ _id: id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 1) * 900000) } }, { upsert: true, new: true });
  if (record.count > 50) { res.set('Retry-After', String(Math.ceil(((window + 1) * 900000 - Date.now()) / 1000))); return res.status(429).json({ error: 'Too many sign-in attempts. Please try again in 15 minutes.' }); }
  next();
}

