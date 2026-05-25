import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const STORAGE_KEY = 'yorokobi_env';

function cleanString(value) {
  return String(value || '').trim();
}

export function getEnv() {
  try {
    const env = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      url: cleanString(env.url),
      key: cleanString(env.key),
      locId: cleanString(env.locId),
      locName: cleanString(env.locName)
    };
  } catch {
    return { url: '', key: '', locId: '', locName: '' };
  }
}

export function saveEnv(url, key, locId, locName) {
  const clean = {
    url: cleanString(url),
    key: cleanString(key),
    locId: cleanString(locId),
    locName: cleanString(locName)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  return clean;
}

export function hasValidEnv() {
  const e = getEnv();
  return Boolean(e.url && e.key && e.locId);
}

export function getClient(override = null) {
  const env = override ? { ...getEnv(), ...override } : getEnv();
  if (!env.url || !env.key) return null;

  try {
    return createClient(env.url, env.key, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: 'public' },
      realtime: { params: { eventsPerSecond: 10 } }
    });
  } catch {
    return null;
  }
}

export function verifyPin(input, locName = '') {
  const pin = cleanString(input);
  if (pin === '0000') return true;

  const name = cleanString(locName)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!name) return false;
  if (name.includes('carranza')) return pin === '3333';
  if (name.includes('anahuac')) return pin === '6666';
  if (name.includes('industrial')) return pin === '9999';

  return false;
}

export function sanitize(value) {
  const d = document.createElement('div');
  d.textContent = String(value ?? '');
  return d.innerHTML;
}
