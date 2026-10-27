import React, { useState } from 'react';
import { api } from '../api';
import { Brand, Icon, Field } from './ui';
export default function Auth({ onLogin }) {
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


