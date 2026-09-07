import {makeStamp, LIMIT, today} from './model.js';
import {KEY, load, save, decode, encode} from './storage.js';
import {render} from './view.js';
/** @typedef {import('./model.js').Stamp} Stamp */
/** @template {HTMLElement} T @param {string} selector @returns {T} */
function el(selector) {
  const node = document.querySelector(selector);
  if (!node) throw new Error(`Missing interface element: ${selector}`);
  return /** @type {T} */ (node);
}
const form = /** @type {HTMLFormElement} */ (el('#stamp-form'));
const date = /** @type {HTMLInputElement} */ (el('#date'));
const place = /** @type {HTMLInputElement} */ (el('#place'));
const memory = /** @type {HTMLTextAreaElement} */ (el('#memory'));
const search = /** @type {HTMLInputElement} */ (el('#search'));
const dialog = /** @type {HTMLDialogElement} */ (el('#confirm'));
/** @param {string} selector @param {string} value */
function text(selector,value) {el(selector).textContent=value;}
const storage = () => window.localStorage;
let loaded = load(storage);
let stamps = loaded.stamps;
let raw = loaded.raw;
let blocked = !!loaded.error;
let filter = 'all';
let editing = '';
let timer = 0;
/** @type {null | (() => boolean)} */ let pending = null;
/** @type {HTMLElement|null} */ let returnFocus = null;
/** @param {string} message */
function notify(message) {
  clearTimeout(timer);
  text('#toast',message);
  el('#toast').hidden = false;
  timer = window.setTimeout(() => {el('#toast').hidden = true;}, 4500);
}
/** @param {string} message */
function warn(message) {
  text('#storage-message',message);
  el('#storage-warning').hidden = !message;
  text('#save-state',message ? 'Storage needs attention. See above.' : 'Saved on this browser. Yours to keep.');
  el('#raw-backup').hidden = !message || raw === null;
}
/** @param {string} message */
function formError(message) { text('#form-error',message); el('#form-error').hidden = !message; }
function draw() { render(stamps,filter,search.value); }
/** @param {Stamp[]} next @param {string} message */
function commit(next, message) {
  if (blocked) {formError('Retry storage or restore a valid backup. Your form is kept.');el('#storage-warning').scrollIntoView({block:'center'});return false;}
  const result = save(next,raw,storage);
  if (result.error) {warn(result.error);formError(result.error);return false;}
  stamps = next;raw = result.raw;warn('');formError('');draw();notify(message);return true;
}
function updateStatus() {
  const dream = new FormData(form).get('status') === 'dream';
  date.required = !dream;
  date.max = dream ? '' : today();
  text('#date-label',dream ? 'Planned date' : 'Date visited');
  text('#date-hint',dream ? 'Optional' : 'Required');
  el('#save').innerHTML = `${editing ? 'Save changes' : dream ? 'Add a dream' : 'Add to my passport'} <span aria-hidden="true">↗</span>`;
}
function reset() {editing='';form.reset();date.value=today();text('#form-title','A new memory');text('#form-caption','Somewhere worth remembering.');el('#cancel-edit').hidden=true;text('#memory-count','0 / 240');formError('');updateStatus();}
/** @param {Stamp} stamp @param {boolean} [visit] */
function edit(stamp, visit = false) {
  editing=stamp.id;place.value=stamp.place;date.value=visit ? today() : stamp.date;memory.value=stamp.memory;
  /** @type {HTMLInputElement} */ (el(`input[name=color][value=${stamp.color}]`)).checked=true;
  /** @type {HTMLInputElement} */ (el(`input[name=status][value=${visit ? 'visited' : stamp.status}]`)).checked=true;
  text('#form-title',visit ? 'A dream, collected.' : 'Keep the details right.');
  text('#form-caption',visit ? 'When did you make it there?' : `Editing ${stamp.place}`);
  el('#cancel-edit').hidden=false;text('#memory-count',`${memory.value.length} / 240`);formError('');updateStatus();
  el('#composer').scrollIntoView({block:'start'});(visit ? date : place).focus({preventScroll:true});
}
/** @param {string} title @param {string} description @param {string} action @param {() => boolean} callback */
function confirmAction(title,description,action,callback) {
  returnFocus = /** @type {HTMLElement} */ (document.activeElement);
  pending=callback;text('#dialog-title',title);text('#dialog-description',description);
  text('#confirm-action',action);text('#confirm button',action === 'Delete stamp' ? 'Keep stamp' : 'Cancel');dialog.returnValue='';dialog.showModal();
}
dialog.addEventListener('close', () => {
  const callback=pending;pending=null;
  const changed=dialog.returnValue === 'confirm' && callback?.();
  if (!changed && returnFocus?.isConnected) returnFocus.focus();
  else el('#collection').focus({preventScroll:true});
  returnFocus=null;
});
form.addEventListener('submit', event => {
  event.preventDefault();formError('');
  try {
    if (!editing && stamps.length >= LIMIT) throw new Error(`This passport holds ${LIMIT} places. Back up and remove an entry before adding another.`);
    const data=new FormData(form);
    const previous=stamps.find(s=>s.id===editing);
    if (editing && !previous) throw new Error('This stamp has changed. Cancel editing and open it again.');
    const stamp=makeStamp({place:place.value,date:date.value,memory:memory.value,color:String(data.get('color')),status:String(data.get('status'))},previous);
    if (commit(editing ? stamps.map(s=>s.id===editing ? stamp : s) : [stamp,...stamps],editing ? 'Memory updated.' : stamp.status === 'dream' ? 'A new dream, tucked away.' : 'A new memory, stamped.')) {
      filter='all';search.value='';reset();draw();place.focus({preventScroll:true});
    }
  } catch(error) {formError(error instanceof Error ? error.message : 'Something went wrong. Your form has been kept.');}
});
form.addEventListener('change',updateStatus);
memory.addEventListener('input',()=>{text('#memory-count',`${memory.value.length} / 240`);});
el('#cancel-edit').addEventListener('click',()=>{reset();place.focus();});
search.addEventListener('input',draw);
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  const value=button.getAttribute('data-filter');
  if (!value || !['all','visited','dream'].includes(value)) {warn('Unknown filter. Reload the page to restore the controls.');return;}
  filter=value;draw();
}));
el('#pages').addEventListener('click',event=>{
  if (!(event.target instanceof Element)) return;
  const button=event.target.closest('button');if (!button) return;
  const action=button.dataset.action;
  if (action === 'start') {place.focus();return;}
  if (action === 'clear') {filter='all';search.value='';draw();search.focus();return;}
  const id=button.closest('article')?.dataset.id;
  const stamp=stamps.find(s=>s.id===id);
  if (!stamp || !['edit','toggle','delete'].includes(action || '')) {warn('Stamp unavailable. Retry storage to refresh.');return;}
  if (action === 'edit') edit(stamp);
  if (action === 'toggle') {
    if (stamp.status === 'dream') edit(stamp,true);
    else if (commit(stamps.map(s=>s.id===id ? {...s,status:'dream'} : s),'Moved to your dreams. You can mark it visited again.')) {
      if (editing===id) reset();el('#collection').focus({preventScroll:true});
    }
  }
  if (action === 'delete') confirmAction('Remove this stamp?',`“${stamp.place}” and its memory will be deleted from this browser. This removes one place and cannot be undone.`, 'Delete stamp',()=>{
    const success=commit(stamps.filter(s=>s.id!==id),'Stamp removed.');if (success && editing===id) reset();return success;
  });
});
/** @param {string} content @param {string} filename */
function download(content,filename) {
  try {const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Backup download requested. Check your downloads.');}
  catch {warn('Allow downloads for this site, then try again.');}
}
el('#export').addEventListener('click',()=>download(encode(stamps),`stamp-rally-${today()}.json`));
el('#raw-backup').addEventListener('click',()=>{if(raw!==null)download(raw,'stamp-rally-original.json');});
el('#retry').addEventListener('click',()=>{
  loaded=load(storage);blocked=!!loaded.error;
  if (!blocked) {stamps=loaded.stamps;raw=loaded.raw;draw();formError('');notify('Passport reloaded. Unsaved form details are still here.');}
  warn(loaded.error);
});
const fileInput=/** @type {HTMLInputElement} */ (el('#import-file'));
el('#import').addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',async()=>{
  const file=fileInput.files?.[0];if(!file)return;
  const importButton=/** @type {HTMLButtonElement} */ (el('#import'));
  importButton.disabled=true;importButton.textContent='Reading backup…';
  try {
    if(file.size>2_000_000)throw new Error('Choose a Stamp Rally backup smaller than 2 MB.');
    const restored=decode(await file.text());
    confirmAction('Restore this passport?',`Replace the ${stamps.length} places currently shown with ${restored.length} places from this backup? Back up your current passport first if you want to keep it.`, 'Replace passport',()=>{
      const result=save(restored,raw,storage);
      if(result.error){warn(result.error);return false;}
      stamps=restored;raw=result.raw;blocked=false;filter='all';search.value='';reset();warn('');draw();notify('Passport restored.');return true;
    });
  } catch(error) {warn(error instanceof Error ? error.message : 'The backup could not be read. Try another file.');}
  finally {fileInput.value='';importButton.disabled=false;importButton.textContent='Restore backup';}
});
window.addEventListener('storage',event=>{
  if(event.key===KEY || event.key===null){blocked=true;warn('Another tab changed this passport. Your form is kept. Back up this view, then retry storage.');}
});
window.addEventListener('error',()=>{el('#boot').hidden=false;text('#boot','Could not open the passport. Back up if possible, then reload. Saved data is untouched.');});
reset();draw();warn(loaded.error);el('#boot').hidden=true;
