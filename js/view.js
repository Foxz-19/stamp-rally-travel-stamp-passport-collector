import {initials, displayDate, summary, select} from './model.js';
/** @typedef {import('./model.js').Stamp} Stamp */
/** Escape user text. @param {string} value */
export function escape(value) { return value.replace(/[&<>"']/g, c => /** @type {Record<string,string>} */ ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }
/** @param {Stamp} stamp @param {number} index */
export function cardHTML(stamp, index) {
  const place = escape(stamp.place);
  return `<article class="page ${stamp.color} ${stamp.status}" data-id="${stamp.id}" aria-label="${place}">
    <div class="page-top"><span>${stamp.status === 'dream' ? 'Dream destination' : 'Collected'}</span><span class="page-number">${String(index+1).padStart(2,'0')}</span></div>
    <div class="stamp" style="--tilt:${stamp.tilt}deg" aria-hidden="true"><small>Stamp Rally</small><b>${escape(initials(stamp.place))}</b><span>${stamp.status === 'dream' ? 'ONE DAY' : escape(displayDate(stamp.date)).toUpperCase()}</span></div>
    <h3>${place}</h3>${stamp.date ? `<time datetime="${stamp.date}">${stamp.status === 'dream' ? 'Dream · ' : ''}${escape(displayDate(stamp.date))}</time>` : '<span class="date-text">A journey to come</span>'}
    <p class="memory${stamp.memory ? '' : ' missing'}">${stamp.memory ? escape(stamp.memory) : 'A memory still to be written.'}</p>
    <div class="page-actions"><button data-action="toggle" aria-label="${stamp.status === 'dream' ? 'Mark visited' : 'Make a dream'}: ${place}">${stamp.status === 'dream' ? 'I’ve been here' : 'Make a dream'}</button><button data-action="edit" aria-label="Edit ${place}">Edit</button><button class="delete" data-action="delete" aria-label="Delete ${place}">Delete</button></div></article>`;
}
/** @param {boolean} first */
export function emptyHTML(first) {
  return first ? `<div class="empty"><div><h3>Every passport<br>starts somewhere.</h3><p>A favorite city. A tiny café. That place you can’t stop dreaming about. Give it a page.</p><button data-action="start">Add your first place</button></div><div class="example red" aria-label="Illustrative stamp, not part of your passport"><small>A LITTLE PREVIEW</small><div class="stamp" aria-hidden="true"><small>Stamp Rally</small><b>KY</b><span>YOUR NEXT STORY</span></div><p>Somewhere unforgettable.</p><span>Example only · your passport starts empty</span></div></div>` : `<div class="empty"><div><h3>No places on this page.</h3><p>Try a different search or show all places. Your passport is still here.</p><button data-action="clear">Show all places</button></div></div>`;
}
/** @param {Stamp[]} stamps @param {string} filter @param {string} query */
export function render(stamps, filter, query) {
  const counts = summary(stamps);
  const summaryNode = document.getElementById('summary');
  if (summaryNode) summaryNode.innerHTML = `<strong>${counts.visited}</strong> collected <span>/</span> <strong>${counts.dream}</strong> still dreaming`;
  const visible = select(stamps,filter,query);
  const pages = document.getElementById('pages');
  if (pages) pages.innerHTML = visible.length ? visible.map(s => cardHTML(s,stamps.indexOf(s))).join('') : emptyHTML(!stamps.length);
  const results = document.getElementById('results');
  if (results) results.textContent = `${visible.length} ${visible.length === 1 ? 'place' : 'places'} shown.`;
  document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === filter)));
}
