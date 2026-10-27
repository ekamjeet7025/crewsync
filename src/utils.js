export const day = value => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
export const fullDay = value => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
export const time = value => new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
export const initials = name => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
export const localInput = value => { const d = new Date(value); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
