import React, { useState, useEffect, useRef } from 'react';
import { Field, Icon } from './ui';
import { fullDay, localInput } from '../utils';
export function Modal({ title, subtitle, children, close }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current; dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} onCancel={close} onClick={e => { if (e.target === ref.current) close(); }}><div className="modal-heading"><div><h2>{title}</h2><p className="muted">{subtitle}</p></div><button className="icon-button" onClick={close} aria-label="Close dialog"><Icon name="x"/></button></div>{children}</dialog>;
}

export function Editor({ type, event, close, save }) {
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


