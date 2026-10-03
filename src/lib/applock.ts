/**
 * Client-side app lock. The PIN is never stored in plain text and never
 * leaves the device: we keep a random salt + SHA-256 hash of (salt + pin)
 * in localStorage, and only an "unlocked" flag in sessionStorage.
 */

const PIN_KEY = "vs_pin_hash";
const SALT_KEY = "vs_pin_salt";
const UNLOCK_KEY = "vs_unlocked";

function ls(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

async function hash(pin: string, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hasPin() {
  return !!ls()?.getItem(PIN_KEY);
}

export async function setPin(pin: string) {
  const store = ls();
  if (!store) return;
  const salt = crypto.getRandomValues(new Uint8Array(16)).join("-");
  store.setItem(SALT_KEY, salt);
  store.setItem(PIN_KEY, await hash(pin, salt));
  unlock();
}

export function clearPin() {
  const store = ls();
  store?.removeItem(PIN_KEY);
  store?.removeItem(SALT_KEY);
  unlock();
}

export async function checkPin(pin: string) {
  const store = ls();
  const saved = store?.getItem(PIN_KEY);
  const salt = store?.getItem(SALT_KEY);
  if (!saved || !salt) return true;
  return (await hash(pin, salt)) === saved;
}

export function isUnlocked() {
  if (!hasPin()) return true;
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return true;
  }
}

export function unlock() {
  try {
    sessionStorage.setItem(UNLOCK_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function lockNow() {
  try {
    sessionStorage.removeItem(UNLOCK_KEY);
  } catch {
    /* ignore */
  }
}
