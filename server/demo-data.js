import bcrypt from 'bcrypt';
import { User, Event, Shift, Audit } from './models.js';
const id = n => n.toString(16).padStart(24, '0');
export async function seedDemo() {
  if (await Event.exists({ _id: id(101) })) return;
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 10) throw new Error('Set SEED_PASSWORD to at least 10 characters');
  const passwordHash = await bcrypt.hash(password, 12);
  const people = [
    [1, 'Ekamjeet Singh', 'organiser@crewsync.demo', 'organiser'],
    [2, 'Aarav Sharma', 'volunteer@crewsync.demo', 'volunteer'],
    [3, 'Riya Kapoor', 'cover@crewsync.demo', 'volunteer'],
    [4, 'Meera Patel', 'meera@crewsync.demo', 'volunteer'],
    [5, 'Kabir Singh', 'kabir@crewsync.demo', 'volunteer'],
    [6, 'Ananya Rao', 'ananya@crewsync.demo', 'volunteer'],
    [7, 'Dev Mehta', 'dev@crewsync.demo', 'volunteer'],
    [8, 'Ishaan Das', 'ishaan@crewsync.demo', 'volunteer']
  ];
  for (const [n, name, email, role] of people) await User.updateOne({ _id: id(n) }, { $setOnInsert: { name, email, role, passwordHash } }, { upsert: true });
  const base = Date.now();
  const at = hours => new Date(base + hours * 3600000);
  const eventData = [
    [101,'Campus Culture Fest','An evening of performances, food, and campus community. Help us welcome guests, keep the stage running, and make this a memorable night.','Open-air auditorium','Cultural',26,34],
    [102,'Build Together: Hack Night','Bring ideas to life with the campus developer community. Our crew supports registration, mentors, and late-night logistics.','Innovation lab','Technology',50,60],
    [103,'Campus Sports Day','A day of friendly competition and team spirit. Join the crew supporting athletes, spectators, and the games.','Sports ground','Sports',74,82],
    [104,'Crew Orientation','Our live practice session for volunteer check-in and attendance. This is sample data for exploring CrewSync.','Student activity centre','Campus',-1,3]
  ];
  // Create the marker event last so a partial setup can be retried safely.
  for (const [n,title,description,location,category,start,end] of [...eventData].reverse()) {
    await Event.updateOne({ _id: id(n) }, { $setOnInsert: { title,description,location,category,startsAt:at(start),endsAt:at(end),owner:id(1),status:'published' } }, { upsert:true });
  }
  const assignments = (numbers, cover = false) => numbers.map((n,i) => ({ user:id(n),name:people.find(p=>p[0]===n)[1],replacementRequested:cover && i===0,attendance:'pending' }));
  const shiftData = [
    [201,101,'Welcome & registration','Main entrance',26,28,4,[2,4,5],false],
    [202,101,'Stage & backstage crew','Backstage',26,29,5,[6,7],false],
    [203,101,'Guest experience','Auditorium',28,31,4,[3,4,8],true],
    [204,101,'Wrap-up crew','Event grounds',31,34,3,[5],false],
    [205,102,'Registration desk','Innovation lab entrance',50,52,3,[4,5],false],
    [206,102,'Mentor support','Lab floor',52,55,4,[6,7,8],false],
    [207,102,'Hospitality & logistics','Innovation lab',55,59,4,[3,4],false],
    [208,103,'Ground coordination','Sports ground',74,77,4,[5,6],false],
    [209,103,'Athlete check-in','Sports pavilion',74,76,3,[4],false],
    [210,104,'Orientation welcome desk','Student activity centre',-1,2,4,[2,3,4],false]
  ];
  for(const [n,event,title,location,start,end,capacity,who,cover] of shiftData) await Shift.updateOne({_id:id(n)},{$setOnInsert:{event:id(event),title,location,startsAt:at(start),endsAt:at(end),capacity,assignments:assignments(who,cover),cancelled:false}},{upsert:true});
  await Audit.updateOne({_id:id(301)},{$setOnInsert:{event:id(101),actor:id(1),actorName:'Ekamjeet Singh',message:'published Campus Culture Fest and opened volunteer shifts'}},{upsert:true});
  await Audit.updateOne({_id:id(302)},{$setOnInsert:{event:id(101),actor:id(2),actorName:'Aarav Sharma',message:'joined Welcome & registration'}},{upsert:true});
  await Audit.updateOne({_id:id(303)},{$setOnInsert:{event:id(101),actor:id(3),actorName:'Riya Kapoor',message:'requested cover for Guest experience'}},{upsert:true});
}

