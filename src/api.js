export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch('/api' + path, { ...options, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-CrewSync': '1', ...options.headers }, body: options.body ? JSON.stringify(options.body) : undefined });
  } catch { throw new Error('Cannot reach CrewSync. Check your connection and try again.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || 'Something went wrong. Please try again.'); error.status = response.status; throw error; }
  return data;
}

