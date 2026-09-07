/** @typedef {'red'|'blue'|'green'|'purple'|'gold'} Ink */
/** @typedef {'visited'|'dream'} Status */
/** @typedef {{id:string,place:string,date:string,color:Ink,memory:string,status:Status,tilt:number}} Stamp */
/** @typedef {{place:string,date:string,color:string,memory:string,status:string}} Draft */
export const COLORS = ['red', 'blue', 'green', 'purple', 'gold'];
export const LIMIT = 1000;
/** Local calendar day. @param {Date} [now] */
export function today(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
/** @param {string} value */
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01') return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(+date) && date.toISOString().slice(0,10) === value;
}
/** @param {Draft} draft @param {string} [now] */
export function validate(draft, now = today()) {
  if (!draft.place.trim() || draft.place.trim().length > 80) return 'Enter a place name between 1 and 80 characters.';
  if (!['visited','dream'].includes(draft.status)) return 'Choose Visited or A dream.';
  if (!COLORS.includes(draft.color)) return 'Choose one of the five stamp inks.';
  if (draft.status === 'visited' && !draft.date) return 'Choose the date you visited this place.';
  if (draft.date && !validDate(draft.date)) return 'Enter a valid calendar date.';
  if (draft.status === 'visited' && draft.date > now) return 'A visit cannot be in the future. Choose A dream for an upcoming trip.';
  if (draft.memory.length > 240) return 'Keep your memory to 240 characters or fewer.';
  return '';
}
/** @param {unknown} value @returns {value is Stamp} */
export function isStamp(value) {
  if (!value || typeof value !== 'object') return false;
  const s = /** @type {Record<string, unknown>} */ (value);
  return typeof s.id === 'string' && /^[\w-]{1,80}$/.test(s.id) &&
    typeof s.place === 'string' && !!s.place.trim() && s.place.length <= 80 &&
    typeof s.date === 'string' && (!s.date || validDate(s.date)) &&
    (s.status === 'dream' || (s.status === 'visited' && !!s.date)) &&
    typeof s.color === 'string' && COLORS.includes(s.color) &&
    typeof s.memory === 'string' && s.memory.length <= 240 &&
    typeof s.tilt === 'number' && Number.isFinite(s.tilt) && Math.abs(s.tilt) <= 7;
}
/** @param {Draft} draft @param {Stamp} [previous] @returns {Stamp} */
export function makeStamp(draft, previous) {
  const error = validate(draft);
  if (error) throw new Error(error);
  return {id: previous?.id ?? crypto.randomUUID(), place:draft.place.trim(), date:draft.date,
    color:/** @type {Ink} */ (draft.color), memory:draft.memory.trim(),
    status:/** @type {Status} */ (draft.status), tilt:previous?.tilt ?? Math.round((Math.random()*12-6)*10)/10};
}
/** @param {string} place */
export function initials(place) {
  const words = place.trim().split(/[\s,.-]+/u).filter(Boolean);
  return (words.length > 1 ? [...words[0]][0] + [...words[words.length-1]][0] : [...(words[0] || '?')].slice(0,2).join('')).toLocaleUpperCase();
}
/** @param {Stamp[]} stamps */
export function summary(stamps) {
  const visited = stamps.filter(s => s.status === 'visited').length;
  return {visited, dream:stamps.length-visited};
}
/** @param {Stamp[]} stamps @param {string} filter @param {string} query */
export function select(stamps, filter, query) {
  const needle = query.trim().toLocaleLowerCase();
  return stamps.filter(s => (filter === 'all' || s.status === filter) && `${s.place} ${s.memory}`.toLocaleLowerCase().includes(needle));
}
/** @param {string} date */
export function displayDate(date) {
  return date ? new Intl.DateTimeFormat('en', {day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${date}T12:00:00`)) : 'A journey to come';
}
