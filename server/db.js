import mongoose from 'mongoose';
let pending;
export async function connect() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured');
  pending ||= mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || 'crewsync', serverSelectionTimeoutMS: 10000 }).catch(error => { pending = null; throw error; });
  await pending;
}

