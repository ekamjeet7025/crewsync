import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { api } from './api';
import './styles.css';

const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/></>,
  swap: <><path d="M4 7h16l-4-4M20 17H4l4 4M20 7l-4 4M4 17l4-4"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></>,
  pin: <><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  logout: <><path d="M9 4H4v16h5M9 12h12m-4-4 4 4-4 4"/></>,
  x: <path d="m6 6 12 12M6 18 18 6"/>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1"/></>,
  spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></>,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></>
};
function Icon({ name, size = 20, ...rest }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>{icons[name] || icons.calendar}</svg>; }
const day = value => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const fullDay = value => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const time = value => new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
const initials = name => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
const localInput = value => { const d = new Date(value); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
function Brand() { return <div className="brand"><span className="brand-mark"><Icon name="check" size={25}/></span><span>Crew<span className="brand-light">Sync</span><span className="brand-dot">.</span></span></div>; }
function Empty({ title, children, icon = 'calendar' }) { return <div className="empty"><span className="empty-icon"><Icon name={icon} size={28}/></span><h3>{title}</h3><p>{children}</p></div>; }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }

function Auth({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try { const data = await api('/auth/' + (register ? 'register' : 'login'), { method: 'POST', body }); onLogin(data.user); }
    catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  return <div className="auth-layout">
    <section className="auth-story"><Brand/><div className="story-content"><span className="eyebrow light"><span className="live-dot"/> MADE FOR THE PEOPLE BEHIND THE EVENT</span><h1>Great events.<br/>Even better<br/><em>teamwork.</em></h1><p>Bring your crew together. Fill every shift.<br/>Make the moments that matter happen.</p><div className="story-card"><div className="avatar-stack"><span>EK</span><span>AS</span><span>RK</span><span>+YOU</span></div><div><strong>One crew. Everything in sync.</strong><small>Less coordination. More collaboration.</small></div><span className="story-check"><Icon name="check"/></span></div></div><div className="story-footer"><span>Built for campus communities</span><span>Plan · Join · Show up</span></div></section>
    <main className="auth-main"><div className="auth-box"><span className="eyebrow">YOUR NEXT GREAT EVENT STARTS HERE</span><h2>{register ? 'Find your people.' : 'Welcome back.'}</h2><p className="muted">{register ? 'Create an account and become part of the crew.' : 'Your crew is counting on you. Let’s get started.'}</p><form onSubmit={submit}>
    {register && <Field label="Full name"><input name="name" autoComplete="name" required maxLength={60} placeholder="Ekamjeet Singh"/></Field>}
    <Field label="Email address"><input name="email" type="email" autoComplete="email" required maxLength={160} placeholder="you@college.edu"/></Field>
    <Field label="Password"><input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 10 : undefined} maxLength={72} required placeholder={register ? 'At least 10 characters' : 'Enter your password'}/></Field>
    {register && <Field label="I’m here to"><select name="role"><option value="volunteer">Volunteer at events</option><option value="organiser">Organise events</option></select></Field>}
    {error && <div className="alert error" role="alert">{error}</div>}
    <button className="button primary full" disabled={busy}>{busy ? 'Just a moment…' : register ? 'Create account' : 'Sign in'}<Icon name="arrow"/></button></form>
    <p className="auth-switch">{register ? 'Already part of the crew?' : 'New to CrewSync?'} <button onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Sign in' : 'Create an account'}</button></p>
    <div className="auth-note"><Icon name="shield"/><span>Your shifts and event data are saved securely.<br/>Organisers manage only their own events.</span></div></div><footer>Every volunteer. Every shift. In sync.</footer></main>
  </div>;
}

function Modal({ title, subtitle, children, close }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current; dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} onCancel={close} onClick={e => { if (e.target === ref.current) close(); }}><div className="modal-heading"><div><h2>{title}</h2><p className="muted">{subtitle}</p></div><button className="icon-button" onClick={close} aria-label="Close dialog"><Icon name="x"/></button></div>{children}</dialog>;
}

function Editor({ type, event, close, save }) {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    const body = Object.fromEntries(new FormData(e.currentTarget));
    body.startsAt = new Date(body.startsAt).toISOString(); body.endsAt = new Date(body.endsAt).toISOString();
    if (type === 'shift') body.capacity = Number(body.capacity);
    try { await save(type === 'event' ? '/events' : `/events/${event._id}/shifts`, body); close(); }
    catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  return <Modal close={close} title={type === 'event' ? 'Bring your next event to life.' : 'Add a duty to the roster.'} subtitle={type === 'event' ? 'Set the scene. You can add volunteer shifts next.' : `${event.title} · ${fullDay(event.startsAt)}`}>
    <form onSubmit={submit}><Field label={type === 'event' ? 'Event name' : 'Duty name'}><input name="title" placeholder={type === 'event' ? 'e.g. Campus Culture Fest' : 'e.g. Registration desk'} required maxLength={120}/></Field>
    {type === 'event' && <><Field label="About the event"><textarea name="description" required maxLength={2000} rows={3} placeholder="What are we making happen?"/></Field><Field label="Category"><select name="category"><option>Campus</option><option>Cultural</option><option>Technology</option><option>Sports</option><option>Community</option></select></Field></>}
    <Field label="Location"><input name="location" defaultValue={event?.location || ''} placeholder="e.g. Main auditorium" required maxLength={120}/></Field>
    <div className="form-row"><Field label="Starts"><input name="startsAt" type="datetime-local" defaultValue={event ? localInput(event.startsAt) : ''} required/></Field><Field label="Ends"><input name="endsAt" type="datetime-local" defaultValue={event ? localInput(event.endsAt) : ''} required/></Field></div>
    <p className="form-hint">Times use your device’s local timezone.</p>
    {type === 'shift' && <Field label="Volunteers needed"><input name="capacity" type="number" min="1" max="100" defaultValue="4" required/></Field>}
    {error && <div className="alert error" role="alert">{error}</div>}
    <div className="modal-actions"><button type="button" className="button" onClick={close}>Cancel</button><button className="button primary" disabled={busy}>{busy ? 'Saving…' : type === 'event' ? 'Publish event' : 'Create shift'}<Icon name="arrow"/></button></div></form>
  </Modal>;
}

function EventArt({ category, index }) {
  const variant = category === 'Technology' ? 1 : category === 'Sports' ? 2 : index % 3;
  return <div className={`event-art art-${variant}`} aria-hidden="true"><div className="art-grid"/><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-orbit orbit-three"/><span className="art-word">{variant === 0 ? 'MAKE\nMOMENTS.' : variant === 1 ? 'BUILD\nTOGETHER.' : 'PLAY\nYOUR PART.'}</span><span className="art-star">✳</span><span className="art-caption">THE CREW MAKES IT HAPPEN ↗</span></div>;
}

function App() {
  const [user, setUser] = useState(null); const [boot, setBoot] = useState(true);
  const [data, setData] = useState({ events: [], shifts: [], activity: [] });
  const [page, setPage] = useState('overview'); const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState(''); const [filter, setFilter] = useState('upcoming');
  const [loading, setLoading] = useState(false); const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(null); const [busy, setBusy] = useState('');
  const [editor, setEditor] = useState(null); const [cancelEvent, setCancelEvent] = useState(null);
  const organiser = user?.role === 'organiser';
  useEffect(() => { api('/auth/me').then(d => setUser(d.user)).catch(error => { if (error.status !== 401) setLoadError(error.message); }).finally(() => setBoot(false)); }, []);
  const refresh = useCallback(async () => {
    setLoading(true);
    try { setData(await api('/dashboard')); setLoadError(''); }
    catch (error) { if (error.status === 401) setUser(null); else setLoadError(error.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (user) { refresh(); const interval = setInterval(refresh, 30000); return () => clearInterval(interval); } }, [user, refresh]);
  useEffect(() => { if (notice) { const id = setTimeout(() => setNotice(null), 7000); return () => clearTimeout(id); } }, [notice]);
  async function mutate(path, body = {}, method = 'POST', message = 'All set. Your changes are saved.') {
    setBusy(path);
    try { await api(path, { method, body }); await refresh(); setNotice({ message, type: 'success' }); }
    catch (error) { setNotice({ message: error.message, type: 'error' }); }
    finally { setBusy(''); }
  }
  async function save(path, body) { await api(path, { method: 'POST', body }); await refresh(); setNotice({ message: 'Published. Your crew can see it now.', type: 'success' }); }
  async function logout() { try { await api('/auth/logout', { method: 'POST' }); setUser(null); setData({ events: [], shifts: [], activity: [] }); setSelected(null); setPage('overview'); } catch (error) { setNotice({ message: error.message, type: 'error' }); } }
  const now = Date.now();
  const liveEvents = data.events.filter(e => e.status === 'published');
  const future = data.shifts.filter(s => new Date(s.endsAt).getTime() > now);
  const myShifts = data.shifts.filter(s => s.assignments.some(a => a.user === user?._id));
  const cover = future.flatMap(s => s.assignments.filter(a => a.replacementRequested).map(a => ({ shift: s, assignment: a })));
  const totalPlaces = future.reduce((n, s) => n + s.capacity, 0);
  const filled = future.reduce((n, s) => n + s.assignments.length, 0);
  const coverage = totalPlaces ? Math.round(filled / totalPlaces * 100) : 0;
  const activeEvent = data.events.find(e => e._id === selected);
  const filteredEvents = data.events.filter(e => (filter === 'all' || (filter === 'upcoming' ? new Date(e.endsAt).getTime() > now && e.status === 'published' : new Date(e.endsAt).getTime() <= now || e.status === 'cancelled')) && (e.title + ' ' + e.location + ' ' + e.category).toLowerCase().includes(search.toLowerCase()));
  function navigate(next) { setPage(next); setSelected(null); setSearch(''); }
  function openEvent(id) { setSelected(id); setPage('events'); }
  function shiftAction(shift, action, target) { return mutate(`/shifts/${shift._id}/${action}`, target ? { userId: target } : {}, 'POST', action === 'join' ? 'You’re on the crew! Your shift is confirmed.' : action === 'cover' ? 'You’ve taken over the shift. Thank you for stepping in.' : action === 'request-cover' ? 'Cover requested. You remain assigned until someone takes over.' : 'Cover request withdrawn.'); }

  function renderShift(shift, showEvent = false) {
    const mine = shift.assignments.find(a => a.user === user._id); const started = new Date(shift.startsAt).getTime() <= now;
    const ended = new Date(shift.endsAt).getTime() <= now; const full = shift.assignments.length >= shift.capacity;
    const conflict = myShifts.some(s => s._id !== shift._id && new Date(s.startsAt) < new Date(shift.endsAt) && new Date(s.endsAt) > new Date(shift.startsAt));
    const event = data.events.find(e => e._id === shift.event);
    return <article className="shift-card" key={shift._id}><div className="shift-date"><strong>{new Date(shift.startsAt).getDate()}</strong><span>{new Date(shift.startsAt).toLocaleDateString('en-IN', { month: 'short' })}</span></div><div className="shift-main"><div className="shift-title"><h3>{shift.title}</h3>{mine && <span className="badge green">{mine.replacementRequested ? 'Cover requested' : 'You’re assigned'}</span>}{ended && <span className="badge">Completed</span>}</div>{showEvent && <button className="text-link" onClick={() => openEvent(shift.event)}>{event?.title}</button>}<div className="meta"><span><Icon name="clock" size={15}/>{time(shift.startsAt)} – {time(shift.endsAt)}</span><span><Icon name="pin" size={15}/>{shift.location}</span></div><div className="shift-bottom"><span className={full ? 'green-text' : 'muted'}>{shift.assignments.length}/{shift.capacity} volunteers</span>{shift.assignments.length > 0 && <div className="mini-avatars">{shift.assignments.slice(0, 4).map(a => <span title={a.name} key={a.user}>{initials(a.name)}</span>)}</div>}</div></div><div className="shift-action">{organiser ? <span className={`badge ${full ? 'green' : 'amber'}`}>{full ? 'Fully staffed' : `${shift.capacity - shift.assignments.length} needed`}</span> : mine ? started ? <span className="badge">{mine.attendance === 'pending' ? 'Attendance pending' : mine.attendance}</span> : <button className="button small" disabled={!!busy} onClick={() => shiftAction(shift, mine.replacementRequested ? 'withdraw-cover' : 'request-cover')}><Icon name="swap" size={16}/>{mine.replacementRequested ? 'Withdraw request' : 'Find cover'}</button> : <button className="button primary small" disabled={!!busy || full || started || conflict} onClick={() => shiftAction(shift, 'join')}>{started ? 'Closed' : conflict ? 'Schedule clash' : full ? 'Full' : 'Join shift'}{!started && !conflict && !full && <Icon name="plus" size={16}/>}</button>}</div></article>;
  }

  function eventCards(items) { return items.length ? <div className="event-grid">{items.map((event, i) => {
    const shifts = data.shifts.filter(s => s.event === event._id); const places = shifts.reduce((n, s) => n + s.capacity, 0); const assigned = shifts.reduce((n, s) => n + s.assignments.length, 0);
    return <button className="event-card" key={event._id} onClick={() => openEvent(event._id)}><EventArt category={event.category} index={i}/><div className="event-card-content"><div className="event-card-top"><span className="category">{event.category}</span><span className={`badge ${event.status === 'cancelled' ? '' : new Date(event.endsAt).getTime() <= now ? '' : 'green'}`}>{event.status === 'cancelled' ? 'Cancelled' : new Date(event.endsAt).getTime() <= now ? 'Completed' : new Date(event.startsAt).getTime() <= now ? 'Live now' : 'Upcoming'}</span></div><h3>{event.title}</h3><div className="meta"><span><Icon name="calendar" size={15}/>{day(event.startsAt)}</span><span><Icon name="pin" size={15}/>{event.location}</span></div><div className="coverage-label"><span>{assigned} of {places} places filled</span><strong>{places ? Math.round(assigned / places * 100) : 0}%</strong></div><div className="progress"><span style={{ width: `${places ? assigned / places * 100 : 0}%` }}/></div><div className="card-footer"><span>{shifts.length} volunteer {shifts.length === 1 ? 'shift' : 'shifts'}</span><span className="round-arrow"><Icon name="arrow" size={17}/></span></div></div></button>;
  })}</div> : <Empty title="A little quiet here.">{organiser ? 'Create your first event, then add the shifts your crew can join.' : 'No events match this view. Check back soon or try a different filter.'}</Empty>; }

  if (boot) return <div className="boot"><Brand/><div className="spinner"/><p>Getting your crew together…</p></div>;
  if (!user) return <Auth onLogin={setUser}/>;
  const titles = { overview: 'Overview', events: organiser ? 'My events' : 'Explore events', shifts: 'My shifts', replacements: 'Find & offer cover', attendance: 'Attendance' };
  return <div className="app-layout"><aside className="sidebar"><Brand/><div className="workspace"><span className="workspace-icon"><Icon name="users"/></span><div><strong>Your workspace</strong><small>{organiser ? 'Organiser console' : 'Volunteer hub'}</small></div><span className="workspace-dot"/></div><span className="nav-caption">WORKSPACE</span><nav>{[['overview','grid','Overview'],['events','calendar', organiser ? 'My events' : 'Explore events'],...(!organiser ? [['shifts','clock','My shifts']] : []),['replacements','swap','Replacements'],...(organiser ? [['attendance','check','Attendance']] : [])].map(([key, icon, label]) => <button key={key} className={page === key ? 'nav-item active' : 'nav-item'} onClick={() => navigate(key)}><Icon name={icon}/><span>{label}</span>{key === 'replacements' && cover.length > 0 && <span className="nav-count">{cover.length}</span>}</button>)}</nav><div className="sidebar-bottom"><div className="crew-tip"><Icon name="spark" size={26}/><h4>Small acts.<br/>Big events.</h4><p>Every shift covered makes a difference.</p></div><div className="profile"><span className="avatar">{initials(user.name)}</span><div><strong>{user.name}</strong><small>{user.role}</small></div><button className="icon-button" onClick={logout} aria-label="Sign out" title="Sign out"><Icon name="logout" size={18}/></button></div></div></aside>
    <div className="app-body"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{activeEvent ? activeEvent.title : titles[page]}</strong></div><div className="topbar-right"><span className="today"><Icon name="calendar" size={16}/>{fullDay(new Date())}</span><button className={`icon-button ${loading ? 'rotating' : ''}`} onClick={refresh} disabled={loading} aria-label="Refresh data" title="Refresh data"><Icon name="refresh" size={18}/></button><span className="avatar small-avatar">{initials(user.name)}</span></div></header>
    <main className="main-content">{loadError && <div className="alert error" role="alert">{loadError} <button className="text-link" onClick={refresh}>Try again</button></div>}{notice && <div className={`toast ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}><Icon name={notice.type === 'error' ? 'x' : 'check'}/>{notice.message}<button className="icon-button" onClick={() => setNotice(null)} aria-label="Dismiss notification"><Icon name="x" size={16}/></button></div>}
    {page === 'overview' && <><div className="page-heading"><div><span className="eyebrow">LET’S MAKE GOOD THINGS HAPPEN</span><h1>Hello, {user.name.split(' ')[0]} <span className="wave">✳</span></h1><p>Here’s what’s happening with your crew.</p></div>{organiser && <button className="button primary" onClick={() => setEditor({ type: 'event' })}><Icon name="plus" size={18}/>Create event</button>}</div>
    <section className="welcome-banner"><div><span className="banner-tag"><span className="live-dot"/> EVERY SHIFT COUNTS</span><h2>{organiser ? 'Behind every great event,\nthere’s a great crew.' : 'Be part of something\nbigger than yourself.'}</h2><p>{organiser ? 'A little planning. A lot of teamwork. All in one place.' : 'Find your next shift and make your campus come alive.'}</p><button className="banner-link" onClick={() => navigate('events')}>{organiser ? 'Manage your events' : 'Find your next event'}<Icon name="arrow" size={18}/></button></div><div className="banner-art" aria-hidden="true"><div className="banner-circle"/><div className="floating-card card-one"><span className="floating-icon"><Icon name="check"/></span><div><strong>Every shift.</strong><small>The right people, in place.</small></div></div><div className="floating-card card-two"><div className="avatar-stack"><span>EK</span><span>AS</span><span>RK</span></div><strong>One team. In sync.</strong></div><span className="banner-spark">✳</span></div></section>
    <section className="stats-grid" aria-label="Workspace statistics">{(organiser ? [
      ['calendar','Active events',liveEvents.filter(e => new Date(e.endsAt).getTime() > now).length,'Good things in the making'],
      ['users','Places filled',filled,`Across ${future.length} active shifts`],
      ['shield','Crew coverage',coverage + '%',`${totalPlaces - filled} places still open`],
      ['swap','Cover requests',cover.length,'A chance to step in']
    ] : [['calendar','Available events',liveEvents.filter(e => new Date(e.endsAt).getTime() > now).length,'Find your next experience'],['clock','My upcoming shifts',myShifts.filter(s => new Date(s.endsAt).getTime() > now).length,'Your time makes a difference'],['check','Shifts attended',myShifts.filter(s => s.assignments.some(a => a.user === user._id && a.attendance === 'present')).length,'Thank you for showing up'],['swap','Cover requests',cover.length,'Help a teammate out']]).map(([icon,label,value,hint]) => <div className="stat-card" key={label}><div className="stat-label">{label}<span><Icon name={icon} size={19}/></span></div><strong>{value}</strong><small>{hint}</small></div>)}</section>
    <div className="section-heading"><div><h2>{organiser ? 'Your upcoming events' : 'Find your next moment'}</h2><p>A shared purpose. A crew to make it happen.</p></div><button className="text-link" onClick={() => navigate('events')}>View all events<Icon name="arrow" size={16}/></button></div>{eventCards(liveEvents.filter(e => new Date(e.endsAt).getTime() > now).slice(0,3))}
    <div className="lower-grid"><section className="panel"><div className="section-heading compact"><h2>{organiser ? 'Coverage watch' : 'Your next shifts'}</h2><Icon name={organiser ? 'shield' : 'clock'}/></div>{organiser ? future.filter(s => s.assignments.length < s.capacity).slice(0,4).map(s => <button className="watch-row" key={s._id} onClick={() => openEvent(s.event)}><span className="watch-icon"><Icon name="users" size={18}/></span><span><strong>{s.title}</strong><small>{data.events.find(e => e._id === s.event)?.title} · {day(s.startsAt)}</small></span><span className="badge amber">{s.capacity-s.assignments.length} needed</span></button>) : myShifts.filter(s => new Date(s.endsAt).getTime() > now).slice(0,3).map(s => <button className="watch-row" key={s._id} onClick={() => openEvent(s.event)}><span className="watch-icon"><Icon name="clock" size={18}/></span><span><strong>{s.title}</strong><small>{day(s.startsAt)} · {time(s.startsAt)}</small></span><Icon name="arrow" size={17}/></button>)}{(organiser ? future.filter(s => s.assignments.length < s.capacity).length === 0 : myShifts.filter(s => new Date(s.endsAt).getTime() > now).length === 0) && <Empty title={organiser ? 'No gaps to flag.' : 'Your next shift awaits.'}>{organiser ? 'New staffing needs will appear here.' : 'Explore events to join the crew.'}</Empty>}</section><section className="panel"><div className="section-heading compact"><h2>Recent activity</h2><span className="subtle-dot"/></div>{data.activity.length ? <div className="activity-list">{data.activity.slice(0,5).map(a => <div className="activity-item" key={a._id}><span className="activity-dot"/><div><p><strong>{a.actorName}</strong> {a.message}</p><small>{day(a.createdAt)} · {time(a.createdAt)}</small></div></div>)}</div> : <Empty title="The story starts here.">Your crew’s activity will appear as things get moving.</Empty>}</section></div></>}
    {page === 'events' && !activeEvent && <><div className="page-heading"><div><span className="eyebrow">MAKE SOMETHING HAPPEN</span><h1>{organiser ? 'Your events.' : 'Find your crew.'}</h1><p>{organiser ? 'The big picture, down to every little duty.' : 'Explore campus events and choose where you can help.'}</p></div>{organiser && <button className="button primary" onClick={() => setEditor({ type:'event' })}><Icon name="plus"/>Create event</button>}</div><div className="filter-bar"><div className="tabs">{['upcoming','past','all'].map(f => <button key={f} className={filter===f?'selected':''} onClick={() => setFilter(f)}>{f === 'past' ? 'Past & cancelled' : f === 'all' ? 'All events' : 'Upcoming'}</button>)}</div><label className="search"><Icon name="search" size={18}/><input aria-label="Search events" placeholder="Search events or locations" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>{eventCards(filteredEvents)}</>}
    {page === 'events' && activeEvent && <><button className="text-link back" onClick={() => setSelected(null)}>← Back to events</button><div className="page-heading"><div><span className="eyebrow">{activeEvent.category} EVENT</span><h1>{activeEvent.title}</h1><div className="meta"><span><Icon name="calendar" size={17}/>{fullDay(activeEvent.startsAt)}</span><span><Icon name="clock" size={17}/>{time(activeEvent.startsAt)} – {time(activeEvent.endsAt)}</span><span><Icon name="pin" size={17}/>{activeEvent.location}</span></div></div>{organiser && activeEvent.status === 'published' && new Date(activeEvent.endsAt).getTime()>now && <button className="button primary" onClick={() => setEditor({ type:'shift',event:activeEvent })}><Icon name="plus"/>Add shift</button>}</div><div className="event-description panel"><p>{activeEvent.description}</p><span className={`badge ${activeEvent.status==='published'?'green':''}`}>{activeEvent.status}</span></div><div className="section-heading"><div><h2>Volunteer shifts</h2><p>{organiser ? 'Keep each duty covered. Attendance is managed in the Attendance tab.' : 'Choose a shift that fits. We’ll check your schedule before confirming.'}</p></div></div><div className="shift-list">{data.shifts.filter(s=>s.event===activeEvent._id).map(s=>renderShift(s))}</div>{!data.shifts.some(s=>s.event===activeEvent._id) && <Empty title="No shifts yet.">{activeEvent.status==='cancelled'?'This event has been cancelled.':organiser?'Add your first shift to open volunteering.':'The organiser hasn’t published any shifts yet.'}</Empty>}{organiser && activeEvent.status==='published' && <div className="danger-zone"><div><strong>Need to call it off?</strong><p>Cancelling releases every volunteer assignment from scheduling conflicts.</p></div><button className="button danger" onClick={()=>setCancelEvent(activeEvent)}>Cancel event</button></div>}</>}
    {page === 'shifts' && <><div className="page-heading"><div><span className="eyebrow">YOUR TIME MAKES A DIFFERENCE</span><h1>On your calendar.</h1><p>Your confirmed duties, all in one place. Need help? Request cover.</p></div></div><div className="shift-list">{myShifts.map(s=>renderShift(s,true))}</div>{!myShifts.length && <Empty title="No shifts booked yet." icon="clock">Explore events and choose your first shift.</Empty>}</>}
    {page === 'replacements' && <><div className="page-heading"><div><span className="eyebrow">GOOD TEAMS SHOW UP FOR EACH OTHER</span><h1>A little help goes a long way.</h1><p>{organiser ? 'Track open cover requests across your events.' : 'Take over a teammate’s shift, or track your own requests.'}</p></div></div><div className="info-banner"><Icon name="shield"/><span>Requesting cover doesn’t remove an assignment. The original volunteer stays responsible until a replacement accepts.</span></div><div className="replacement-grid">{cover.map(({shift,assignment}) => <article className="panel cover-card" key={shift._id+assignment.user}><div className="cover-person"><span className="avatar">{initials(assignment.name)}</span><div><strong>{assignment.name}</strong><small>is looking for cover</small></div><span className="badge amber">Open request</span></div><h3>{shift.title}</h3><p className="muted">{data.events.find(e=>e._id===shift.event)?.title}</p><div className="meta"><span><Icon name="calendar" size={16}/>{day(shift.startsAt)}</span><span><Icon name="clock" size={16}/>{time(shift.startsAt)} – {time(shift.endsAt)}</span></div>{organiser ? <button className="button full" onClick={()=>openEvent(shift.event)}>View event<Icon name="arrow" size={16}/></button> : assignment.user===user._id ? <button className="button full" disabled={!!busy} onClick={()=>shiftAction(shift,'withdraw-cover')}>Withdraw my request</button> : <button className="button primary full" disabled={!!busy || shift.assignments.some(a=>a.user===user._id) || new Date(shift.startsAt).getTime()<=now} onClick={()=>shiftAction(shift,'cover',assignment.user)}>I can cover this<Icon name="arrow" size={16}/></button>}</article>)}</div>{!cover.length && <Empty title="All good on the cover front." icon="swap">Open replacement requests will appear here.</Empty>}</>}
    {page === 'attendance' && <><div className="page-heading"><div><span className="eyebrow">RECOGNISE THE PEOPLE WHO SHOW UP</span><h1>Take attendance.</h1><p>Mark volunteers present or absent once their shift begins.</p></div></div>{data.shifts.filter(s=>s.assignments.length).map(shift=><section className="panel attendance-panel" key={shift._id}><div className="section-heading compact"><div><h2>{shift.title}</h2><p>{data.events.find(e=>e._id===shift.event)?.title} · {day(shift.startsAt)} · {time(shift.startsAt)}</p></div><span className="badge">{shift.assignments.filter(a=>a.attendance==='present').length}/{shift.assignments.length} present</span></div>{new Date(shift.startsAt).getTime()>now && <p className="form-hint">Attendance opens when this shift starts.</p>}<div className="roster">{shift.assignments.map(a=><div className="roster-row" key={a.user}><span className="avatar small-avatar">{initials(a.name)}</span><strong>{a.name}</strong>{a.replacementRequested && <span className="badge amber">Needs cover</span>}<label className="attendance-control"><span className="sr-only">Attendance for {a.name} in {shift.title}</span><select value={a.attendance} disabled={!!busy || new Date(shift.startsAt).getTime()>now} onChange={e=>mutate(`/shifts/${shift._id}/attendance`,{userId:a.user,status:e.target.value},'PATCH','Attendance saved.')}><option value="pending">Pending</option><option value="present">Present</option><option value="absent">Absent</option></select></label></div>)}</div></section>)}{!data.shifts.some(s=>s.assignments.length) && <Empty title="Your roster is waiting." icon="users">Volunteers will appear here after joining a shift.</Empty>}</>}
    <footer className="app-footer"><span>CrewSync — built for the people behind the event.</span><span><span className="live-dot"/> {loading ? 'Syncing…' : 'Updates every 30 seconds'}</span></footer>
    </main></div>{editor && <Editor {...editor} close={()=>setEditor(null)} save={save}/>}
    {cancelEvent && <Modal title="Cancel this event?" subtitle={cancelEvent.title} close={()=>setCancelEvent(null)}><p className="muted">This closes every shift and removes the event from volunteer discovery. This cannot be undone.</p><div className="modal-actions"><button className="button" onClick={()=>setCancelEvent(null)}>Keep event</button><button className="button danger" disabled={!!busy} onClick={async()=>{await mutate(`/events/${cancelEvent._id}/cancel`,{},'POST','Event cancelled.');setCancelEvent(null);}}>Cancel event</button></div></Modal>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);

