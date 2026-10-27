import 'dotenv/config';
import mongoose from 'mongoose';
import { connect } from './db.js';
import { seedDemo } from './demo-data.js';
await connect();
await seedDemo();
console.log('Demo data ready. Accounts: organiser@crewsync.demo, volunteer@crewsync.demo, cover@crewsync.demo');
await mongoose.disconnect();

