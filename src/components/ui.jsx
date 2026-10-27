import React from 'react';
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
export function Icon({ name, size = 20, ...rest }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>{icons[name] || icons.calendar}</svg>; }
export function Brand() { return <div className="brand"><span className="brand-mark"><Icon name="check" size={25}/></span><span>Crew<span className="brand-light">Sync</span><span className="brand-dot">.</span></span></div>; }
export function Empty({ title, children, icon = 'calendar' }) { return <div className="empty"><span className="empty-icon"><Icon name={icon} size={28}/></span><h3>{title}</h3><p>{children}</p></div>; }
export function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }

export function EventArt({ category, index }) {
  const variant = category === 'Technology' ? 1 : category === 'Sports' ? 2 : index % 3;
  return <div className={`event-art art-${variant}`} aria-hidden="true"><div className="art-grid"/><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-orbit orbit-three"/><span className="art-word">{variant === 0 ? 'MAKE\nMOMENTS.' : variant === 1 ? 'BUILD\nTOGETHER.' : 'PLAY\nYOUR PART.'}</span><span className="art-star">✳</span><span className="art-caption">THE CREW MAKES IT HAPPEN ↗</span></div>;
}
