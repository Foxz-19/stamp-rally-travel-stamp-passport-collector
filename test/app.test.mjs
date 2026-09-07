import {test} from 'node:test';
import a from 'node:assert/strict';
import {validDate,validate,isStamp,makeStamp,initials,summary,select} from '../js/model.js';
import {load,save,decode,encode} from '../js/storage.js';
import {cardHTML,emptyHTML} from '../js/view.js';
const draft={place:'Kyoto',date:'2024-04-12',memory:'Rain',color:'red',status:'visited'};
const stamp=makeStamp(draft);
function store(value=null){return {getItem(){return value;},setItem(key,next){value=next;}};}
test('validation: dates, bounds, palette, status and dreams',()=>{
  a.ok(validDate('2024-02-29'));
  for(const date of ['2023-02-29','2024-04-31','0000-01-01','bad'])a.ok(!validDate(date));
  for(const patch of [{date:''},{date:'2999-01-01'},{place:' '},{place:'a'.repeat(81)},{memory:'x'.repeat(241)},{color:'pink'},{status:'bad'}])a.ok(validate({...draft,...patch}));
  a.equal(validate({...draft,status:'dream',date:''}),'');
  a.throws(()=>makeStamp({...draft,place:''}));
});
test('edit retains identity; international initials',()=>{
  const edited=makeStamp({...draft,place:' Tokyo '},stamp);
  a.equal(edited.place,'Tokyo');a.equal(edited.id,stamp.id);a.equal(edited.tilt,stamp.tilt);
  a.equal(initials('Kyoto, Japan'),'KJ');a.equal(initials('東京'),'東京');
});
test('counts and filters',()=>{
  const all=[stamp,{...stamp,id:'dream',status:'dream',place:'Oslo',memory:''}];
  a.deepEqual(summary(all),{visited:1,dream:1});a.deepEqual(summary([]),{visited:0,dream:0});
  a.equal(select(all,'dream','').length,1);a.equal(select(all,'all','RAIN').length,1);a.equal(select(all,'visited','Oslo').length,0);
});
test('boundary rejects malformed schema and duplicate IDs',()=>{
  for(const patch of [{id:'<bad>'},{color:'pink'},{tilt:NaN},{tilt:99},{memory:3},{date:'2023-02-29'},{date:''}])a.ok(!isStamp({...stamp,...patch}));
  for(const raw of ['{oops','{"version":2,"stamps":[]}',encode([stamp,stamp])])a.throws(()=>decode(raw));
  a.deepEqual(decode(encode([stamp])),[stamp]);
});
test('empty, corrupt and blocked storage never reseed',()=>{
  a.deepEqual(load(()=>store()).stamps,[]);
  const storage=store('bad');a.ok(load(()=>storage).error);a.equal(storage.getItem(),'bad');
  a.match(load(()=>{throw Error();}).error,/cannot be read/);
});
test('save, quota failure and concurrent modification',()=>{
  const storage=store();const result=save([stamp],null,()=>storage);
  a.equal(result.error,'');a.deepEqual(load(()=>storage).stamps,[stamp]);
  storage.setItem=()=>{throw Error();};a.ok(save([],result.raw,()=>storage).error);
  a.equal(storage.getItem(),result.raw);a.match(save([],null,()=>storage).error,/another tab/);
});
test('rendering: escaped text, actions, dates, dreams and empty states',()=>{
  const html=cardHTML({...stamp,place:'<script>',memory:'<img onerror="x">'},0);
  a.ok(!html.includes('<script>')&&!html.includes('<img'));a.match(html,/&lt;script&gt;/);
  for(const action of ['edit','toggle','delete'])a.ok(html.includes(`data-action="${action}"`));
  a.match(html,/datetime="2024-04-12"/);
  a.match(cardHTML({...stamp,status:'dream',date:''},0),/A journey to come/);
  a.match(emptyHTML(true),/Example only/);a.match(emptyHTML(false),/Show all places/);
});
