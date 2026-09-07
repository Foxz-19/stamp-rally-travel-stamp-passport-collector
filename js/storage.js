import {isStamp, LIMIT} from './model.js';
/** @typedef {import('./model.js').Stamp} Stamp */
export const KEY = 'stamp-rally.v1';
/** @param {string} raw @returns {Stamp[]} */
export function decode(raw) {
  const data = JSON.parse(raw);
  if (!data || data.version !== 1 || !Array.isArray(data.stamps) || data.stamps.length > LIMIT ||
      !data.stamps.every(isStamp) || new Set(data.stamps.map((/** @type {Stamp} */ s) => s.id)).size !== data.stamps.length) {
    throw new Error('This is not a valid Stamp Rally backup (version 1).');
  }
  return data.stamps;
}
/** @param {Stamp[]} stamps */
export function encode(stamps) { return JSON.stringify({version:1,stamps}); }
/** @param {() => Storage} getStorage */
export function load(getStorage) {
  let raw = null;
  try {
    raw = getStorage().getItem(KEY);
    return {stamps:raw === null ? [] : decode(raw), raw, error:''};
  } catch {
    return {stamps:/** @type {Stamp[]} */ ([]), raw,
      error:raw === null ? 'Browser storage cannot be read. Allow site storage, then retry.' : 'Saved data is damaged. The original is untouched. Download it, then restore a valid backup or retry storage.'};
  }
}
/** @param {Stamp[]} stamps @param {string|null} expected @param {() => Storage} getStorage */
export function save(stamps, expected, getStorage) {
  try {
    const store = getStorage();
    if (store.getItem(KEY) !== expected) return {raw:expected, error:'Your passport changed in another tab. Back up this view, then retry storage before saving again.'};
    const raw = encode(stamps);
    decode(raw);
    store.setItem(KEY, raw);
    return {raw,error:''};
  } catch {
    return {raw:expected,error:'Could not save. Your form and previous passport are safe. Free or allow browser storage, then try again.'};
  }
}
