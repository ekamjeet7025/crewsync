import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
const binary = path.resolve('node_modules/.cache/mongodb-memory-server/mongod-test.exe');
const data = path.resolve('.local-data');
mkdirSync(data, { recursive: true });
const repl = await MongoMemoryReplSet.create({ binary: existsSync(binary) ? { systemBinary: binary } : undefined, instanceOpts: [{ dbPath: data, port: 27118 }], replSet: { count: 1, storageEngine: 'wiredTiger' } });
process.env.MONGO_URI = repl.getUri();
process.env.MONGO_DB = 'crewsync_local';
process.env.JWT_SECRET = randomBytes(48).toString('hex');
process.env.SEED_PASSWORD = 'CrewSyncDemo2026!';
process.env.NODE_ENV = 'development';
const { connect } = await import('./db.js');
const { seedDemo } = await import('./demo-data.js');
await connect(); await seedDemo();
const { default: app } = await import('./app.js');
const server = app.listen(3100, '127.0.0.1', () => console.log('CrewSync local demo: http://127.0.0.1:3100 (MongoDB data persists in .local-data)'));
async function stop(){server.close(); await (await import('mongoose')).default.disconnect(); await repl.stop({doCleanup:false});process.exit(0)}
process.on('SIGINT',stop);process.on('SIGTERM',stop);

