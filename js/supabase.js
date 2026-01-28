import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const STORAGE_KEY = 'yorokobi_env';

export function getEnv() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } 
  catch { return {}; }
}

export function saveEnv(url, key, locId, locName) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, key, locId, locName }));
}

export function hasValidEnv() {
  const e = getEnv();
  return e.url && e.key && e.locId;
}

export function getClient(override = null) {
  const env = override || getEnv();
  if (!env.url || !env.key) return null;
  try {
    return createClient(env.url, env.key, {
      auth: { persistSession: false },
      db: { schema: 'public' }
    });
  } catch (e) { return null; }
}

export function verifyPin(input, locName = "") {
  if (input === "0000") return true;
  if (!locName) return false;
  const n = locName.toLowerCase();
  if (n.includes("carranza") && input === "3333") return true;
  if (n.includes("anahuac") && input === "6666") return true;
  if (n.includes("industrial") && input === "9999") return true;
  if (n.includes("maestro") && input === "0000") return true;
  return false;
}

export function sanitize(str) {
  const d = document.createElement('div');
  d.innerText = str; return d.innerHTML;
}
