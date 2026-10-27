import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { existsSync, mkdtempSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
let repl, server, base, organiser, otherOrganiser, alice, bob, charlie, event, shift;
const future = h => new Date(Date.now() + h*3600000).toISOString();
async function call(path, { method='GET', body, cookie, headers={} } = {}) {
  const res = await fetch(base + '/api' + path, {method,headers:{'Content-Type':'application/json','X-CrewSync':'1',...(cookie?{Cookie:cookie}:{}),...headers},body:body?JSON.stringify(body):undefined});
  return { status:res.status, data:await res.json(), cookie:res.headers.get('set-cookie')?.split(';')[0] };
}
async function register(name, role='volunteer') {const r=await call('/auth/register',{method:'POST',body:{name,email:name+'@test.example',password:'TestingPass2026!',role}});assert.equal(r.status,200);return {...r.data.user,cookie:r.cookie}}
async function addShift(title, capacity=1,start=25,end=26) {const r=await call('/events/'+event._id+'/shifts',{method:'POST',cookie:organiser.cookie,body:{title,location:'Hall',startsAt:future(start),endsAt:future(end),capacity}});assert.equal(r.status,201,JSON.stringify(r.data));return r.data.shift}
before(async()=>{
  const binary=path.resolve('node_modules/.cache/mongodb-memory-server/mongod-test.exe');
  mkdirSync('artifacts',{recursive:true});
  const testDb=mkdtempSync(path.resolve('artifacts/test-db-'));
  repl=await MongoMemoryReplSet.create({instanceOpts:[{dbPath:testDb}],binary:existsSync(binary)?{systemBinary:binary}:undefined,replSet:{count:1,storageEngine:'wiredTiger'}});
  process.env.MONGO_URI=repl.getUri();process.env.MONGO_DB='crewsync_test';process.env.JWT_SECRET='isolated-test-secret-with-more-than-32-characters';process.env.NODE_ENV='test';
  const {default:app}=await import('../server/app.js');server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base='http://127.0.0.1:'+server.address().port;
  await (await import('../server/db.js')).connect();
  const models=await import('../server/models.js');await Promise.all([models.User.init(),models.Event.init(),models.Shift.init(),models.Audit.init()]);
  organiser=await register('organiser','organiser');otherOrganiser=await register('other','organiser');alice=await register('alice');bob=await register('bob');charlie=await register('charlie');
});
after(async()=>{await mongoose.disconnect();if(server)await new Promise(resolve=>server.close(resolve));if(repl)await repl.stop()});
test('authentication, duplicate accounts, cookies, and CSRF protection',async()=>{
  assert.equal((await call('/dashboard')).status,401);
  assert.equal((await call('/auth/login',{method:'POST',body:{email:'alice@test.example',password:'wrong'}})).status,401);
  assert.equal((await call('/auth/register',{method:'POST',body:{name:'Alice',email:'alice@test.example',password:'TestingPass2026!',role:'volunteer'}})).status,409);
  assert.equal((await call('/auth/logout',{method:'POST',headers:{'X-CrewSync':''}})).status,403);
  const me=await call('/auth/me',{cookie:alice.cookie});assert.equal(me.status,200);assert.equal(me.data.user.passwordHash,undefined);
});
test('event creation validates dates and authorisation',async()=>{
  const body={title:'Test festival',description:'Integration test event',location:'Campus',category:'Campus',startsAt:future(24),endsAt:future(48)};
  assert.equal((await call('/events',{method:'POST',cookie:alice.cookie,body})).status,403);
  assert.equal((await call('/events',{method:'POST',cookie:organiser.cookie,body:{...body,endsAt:future(2)}})).status,400);
  const result=await call('/events',{method:'POST',cookie:organiser.cookie,body});assert.equal(result.status,201);event=result.data.event;
});
test('shift dates and capacity are validated; ownership enforced',async()=>{
  const body={title:'Welcome',location:'Hall',startsAt:future(25),endsAt:future(26),capacity:1};
  assert.equal((await call('/events/'+event._id+'/shifts',{method:'POST',cookie:otherOrganiser.cookie,body})).status,403);
  assert.equal((await call('/events/'+event._id+'/shifts',{method:'POST',cookie:organiser.cookie,body:{...body,capacity:0}})).status,400);
  assert.equal((await call('/events/'+event._id+'/shifts',{method:'POST',cookie:organiser.cookie,body:{...body,endsAt:future(60)}})).status,400);
  shift=await addShift('Welcome',1);
});
test('simultaneous requests cannot overfill the final place',async()=>{
  const responses=await Promise.all([alice,bob].map(u=>call('/shifts/'+shift._id+'/join',{method:'POST',cookie:u.cookie,body:{}})));
  assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
  const {Shift}=await import('../server/models.js');const saved=await Shift.findById(shift._id);assert.equal(saved.assignments.length,1);
  if(String(saved.assignments[0].user)!==alice._id)[alice,bob]=[bob,alice];
});
test('duplicate membership and overlapping shifts are rejected',async()=>{
  assert.equal((await call('/shifts/'+shift._id+'/join',{method:'POST',cookie:alice.cookie,body:{}})).status,409);
  const overlap=await addShift('Overlapping desk',3,25.5,27);
  assert.equal((await call('/shifts/'+overlap._id+'/join',{method:'POST',cookie:alice.cookie,body:{}})).status,409);
});
test('concurrent bookings by one user cannot bypass overlap checks',async()=>{
  const a=await addShift('Race A',4,29,32),b=await addShift('Race B',4,30,33);
  const results=await Promise.all([a,b].map(s=>call('/shifts/'+s._id+'/join',{method:'POST',cookie:charlie.cookie,body:{}})));
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
});
test('requesting cover retains original assignment; accepting transfers exactly once',async()=>{
  assert.equal((await call('/shifts/'+shift._id+'/request-cover',{method:'POST',cookie:alice.cookie,body:{}})).status,200);
  const {Shift}=await import('../server/models.js');let saved=await Shift.findById(shift._id);assert.equal(String(saved.assignments[0].user),alice._id);assert.equal(saved.assignments[0].replacementRequested,true);
  const results=await Promise.all([bob,charlie].map(u=>call('/shifts/'+shift._id+'/cover',{method:'POST',cookie:u.cookie,body:{userId:alice._id}})));
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
  saved=await Shift.findById(shift._id);assert.equal(saved.assignments.length,1);assert.notEqual(String(saved.assignments[0].user),alice._id);assert.equal(saved.assignments[0].replacementRequested,false);
});
test('attendance requires event ownership and a started shift',async()=>{
  const {Shift}=await import('../server/models.js');let saved=await Shift.findById(shift._id);const body={userId:String(saved.assignments[0].user),status:'present'};
  assert.equal((await call('/shifts/'+shift._id+'/attendance',{method:'PATCH',cookie:otherOrganiser.cookie,body})).status,403);
  assert.equal((await call('/shifts/'+shift._id+'/attendance',{method:'PATCH',cookie:organiser.cookie,body})).status,409);
  await Shift.updateOne({_id:shift._id},{$set:{startsAt:new Date(Date.now()-60000)}});
  assert.equal((await call('/shifts/'+shift._id+'/attendance',{method:'PATCH',cookie:organiser.cookie,body})).status,200);
  saved=await Shift.findById(shift._id);assert.equal(saved.assignments[0].attendance,'present');
});
test('persistent dashboard data and private organiser scope',async()=>{
  const board=await call('/dashboard',{cookie:organiser.cookie});assert.equal(board.status,200);assert.ok(board.data.events.length);assert.ok(board.data.activity.length);
  const other=await call('/dashboard',{cookie:otherOrganiser.cookie});assert.equal(other.data.events.length,0);
  const login=await call('/auth/login',{method:'POST',body:{email:'organiser@test.example',password:'TestingPass2026!'}});const reload=await call('/dashboard',{cookie:login.cookie});assert.equal(reload.data.events[0]._id,event._id);
});
test('event cancellation closes shifts and blocks further joining',async()=>{
  assert.equal((await call('/events/'+event._id+'/cancel',{method:'POST',cookie:otherOrganiser.cookie,body:{}})).status,403);
  assert.equal((await call('/events/'+event._id+'/cancel',{method:'POST',cookie:organiser.cookie,body:{}})).status,200);
  const {Shift}=await import('../server/models.js');assert.equal(await Shift.countDocuments({event:event._id,cancelled:false}),0);
  assert.equal((await call('/shifts/'+shift._id+'/join',{method:'POST',cookie:alice.cookie,body:{}})).status,404);
});
test('bad resource IDs and missing endpoints return clear errors',async()=>{
  assert.equal((await call('/shifts/not-an-id/join',{method:'POST',cookie:alice.cookie,body:{}})).status,400);
  assert.equal((await call('/missing',{cookie:alice.cookie})).status,404);
});
