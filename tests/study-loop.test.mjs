import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BACKUP_FORMAT, STORAGE_KEY, LEGACY_KEY, DraftConflictError,
  buildTest, createAttempt, validateAttempt, validateDraft, claimDraft, saveDraft,
  discardDraft, elapsedSeconds, readWorkspace, saveAttempt, readAttempts,
  exportAttempts, importAttempts, clearAttempts, markReviewed,
} from '../lib/practice.ts';
import {BANK_VERSION, BANK_KIND} from '../lib/question-bank.ts';
import {topicPerformance, revisionQueue, questionKey} from '../lib/analytics.ts';

const config={mode:'mixed',topic:'Indian Polity',count:6,durationMinutes:10,positive:2,negative:.5,examId:'general'};
const store=new Map();
globalThis.window={localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)}};
const clock=Date.parse('2026-10-14T15:00:00Z');
const draft=(changes={})=>({id:'session-1',writerId:'tab-1',bankVersion:BANK_VERSION,kind:BANK_KIND,config,questionIds:['q1','q2'],answers:{},marked:[],index:0,startedAt:clock,updatedAt:clock,...changes});
const attempt=(answers,day=1,examId='general')=>({...createAttempt({...config,examId},answers,['q1','q2'],30,`attempt-${day}-${examId}`),createdAt:`2026-10-${String(day).padStart(2,'0')}T15:00:00.000Z`});

test('a recovered draft keeps answers, navigation, review flags and its original deadline',()=>{
  store.clear();claimDraft(draft());
  saveDraft(draft({answers:{q1:2},marked:['q2'],index:1,updatedAt:clock+20_000}));
  const recovered=readWorkspace().draft;
  assert.deepEqual(recovered.answers,{q1:2});assert.equal(recovered.index,1);assert.deepEqual(recovered.marked,['q2']);
  assert.equal(elapsedSeconds(recovered,clock+90_999),90);
  assert.equal(elapsedSeconds(recovered,clock+999_999),600);
  assert.equal(elapsedSeconds(recovered,clock-5000),0);
});
test('resuming in a second tab rejects writes from the previous owner',()=>{
  store.clear();claimDraft(draft());claimDraft(draft({writerId:'tab-2',updatedAt:clock+1000}));
  assert.throws(()=>saveDraft(draft({answers:{q1:1}})),DraftConflictError);
  assert.equal(readWorkspace().draft.writerId,'tab-2');
  assert.equal(saveAttempt(createAttempt(config,{q1:2},['q1','q2'],40,'session-1'),'tab-1'),false);
  assert.deepEqual(readAttempts(),[]);
});
test('submitting clears the matching draft, saves exactly once, and prevents revival',()=>{
  store.clear();claimDraft(draft());const a=createAttempt(config,{q1:2},['q1','q2'],40,'session-1');
  assert.equal(saveAttempt(a,'tab-1'),true);assert.equal(readWorkspace().draft,null);
  assert.equal(saveAttempt(a),true);assert.equal(readAttempts().length,1);
  assert.throws(()=>claimDraft(draft()),/already submitted/);
});
test('a different unfinished session is not silently replaced',()=>{
  store.clear();claimDraft(draft());assert.throws(()=>claimDraft(draft({id:'session-2'})),/existing session/);
  discardDraft('session-2');assert.equal(readWorkspace().draft.id,'session-1');
  discardDraft('session-1');assert.equal(readWorkspace().draft,null);
});
test('invalid answers, navigation, bank versions and exam IDs are rejected',()=>{
  for(const changes of [{answers:{q1:100}},{marked:['missing']},{index:-1},{index:2},{startedAt:NaN},{updatedAt:clock-1},{bankVersion:'unknown'},{kind:'official'}]) assert.throws(()=>validateDraft(draft(changes)));
  assert.throws(()=>buildTest({...config,examId:'imaginary-exam'}));
  assert.throws(()=>createAttempt(config,{},['q1','missing'],10));
  assert.throws(()=>createAttempt(config,{},['q1','q1'],10));
  assert.throws(()=>validateAttempt({...attempt({}),kind:'official'}));
});
test('legacy backups gain explicit illustrative bank provenance without changing score',()=>{
  store.clear();const a=attempt({q1:2,q2:0});delete a.kind;delete a.bankVersion;delete a.config.examId;
  store.set(LEGACY_KEY,JSON.stringify([a]));const state=readWorkspace();
  assert.equal(state.attempts[0].bankVersion,BANK_VERSION);assert.equal(state.attempts[0].kind,'illustrative');
  assert.equal(state.attempts[0].config.examId,'general');assert.equal(state.attempts[0].score,1.5);
  assert.equal(importAttempts(JSON.stringify({format:'anvaya-practice-v1',attempts:[a]})),1);
  assert.equal(JSON.parse(exportAttempts()).format,BACKUP_FORMAT);
});
test('workspace backup round trip includes an unfinished session and review acknowledgements',()=>{
  store.clear();saveAttempt(attempt({q1:0}));claimDraft(draft());markReviewed(questionKey('general',BANK_VERSION,'q1'),'2026-10-02T15:00:00.000Z');
  const before=readWorkspace(),backup=exportAttempts();clearAttempts();importAttempts(backup);
  assert.deepEqual(readWorkspace(),before);
});
test('malformed draft or reviews reject the whole import before any data changes',()=>{
  store.clear();saveAttempt(attempt({q1:2}));const before=store.get(STORAGE_KEY);
  for(const change of [{draft:{id:'incomplete'}},{reviews:[{key:'bad',reviewedAt:'not-a-date'}]},{attempts:[{...attempt({}),bankVersion:'unsupported'}]}]) {
    assert.throws(()=>importAttempts(JSON.stringify({format:BACKUP_FORMAT,attempts:[],...change})));
    assert.equal(store.get(STORAGE_KEY),before);
  }
});
test('quota failures preserve both completed and recovery data',()=>{
  store.clear();saveAttempt(attempt({q1:2}));claimDraft(draft());const before=store.get(STORAGE_KEY);
  const original=window.localStorage.setItem;window.localStorage.setItem=()=>{throw Error('quota')};
  try {
    assert.throws(()=>importAttempts(JSON.stringify({format:BACKUP_FORMAT,attempts:[attempt({},2)]})),/quota/);
    assert.equal(saveAttempt(createAttempt(config,{},['q1'],30,'session-1'),'tab-1'),false);
    assert.equal(store.get(STORAGE_KEY),before);
  } finally {window.localStorage.setItem=original}
});
test('corrupt saved data is surfaced and never overwritten by a new attempt',()=>{
  store.clear();store.set(STORAGE_KEY,'broken-json');
  assert.throws(()=>readWorkspace());assert.equal(saveAttempt(attempt({q1:2})),false);
  assert.equal(store.get(STORAGE_KEY),'broken-json');
});
test('merging retains only 50 latest attempts, deduplicates IDs and clears no unrelated draft',()=>{
  store.clear();claimDraft(draft());
  for(let i=0;i<55;i++)saveAttempt({...attempt({},1),id:`item-${i}`,createdAt:new Date(clock+i*1000).toISOString()});
  assert.equal(readAttempts().length,50);assert.equal(readAttempts()[0].id,'item-54');assert.equal(readWorkspace().draft.id,'session-1');
  const backup=exportAttempts();importAttempts(backup);assert.equal(readAttempts().length,50);
});
test('deleting practice data cannot resurrect old migrated history',()=>{
  store.clear();store.set(LEGACY_KEY,JSON.stringify([attempt({})]));saveAttempt(attempt({},2));claimDraft(draft());
  markReviewed('general:bank:q1');clearAttempts();assert.deepEqual(readWorkspace(),{attempts:[],draft:null,reviews:[]});assert.equal(store.has(LEGACY_KEY),false);
});
test('topic observations and revision progress stay separate across GATE papers',()=>{
  const ee=attempt({q1:0,q2:1},1,'gate-ee');const ec=attempt({q1:2,q2:1},2,'gate-ec');
  const stats=topicPerformance([ee,ec],'gate-ee');assert.equal(stats.find(row=>row.topic==='Indian Polity').accuracy,0);
  assert.equal(topicPerformance([ee,ec],'gate-ec').find(row=>row.topic==='Indian Polity').accuracy,100);
  assert.equal(revisionQueue([ee,ec],[],'gate-ee').length,1);assert.equal(revisionQueue([ee,ec],[],'gate-ec').length,0);
});
test('accuracy excludes unanswered observations and penalties use each attempt marking scheme',()=>{
  const rows=topicPerformance([attempt({q1:2},1),attempt({q1:0,q2:1},2)]);
  const polity=rows.find(row=>row.topic==='Indian Polity'),history=rows.find(row=>row.topic==='History');
  assert.equal(polity.accuracy,50);assert.equal(polity.penalties,.5);assert.equal(history.accuracy,100);assert.equal(history.skipped,1);assert.equal(history.observations,2);
});
test('revision queue follows the latest response and resurfaces a new mistake after self-review',()=>{
  const wrong=attempt({q1:0,q2:1},1),right=attempt({q1:2,q2:1},2),wrongAgain=attempt({q1:0,q2:1},3);
  const key=questionKey('general',BANK_VERSION,'q1');
  assert.equal(revisionQueue([wrong],[]).length,1);assert.equal(revisionQueue([wrong,right],[]).length,0);
  assert.equal(revisionQueue([wrong],[{key,reviewedAt:'2026-10-02T16:00:00Z'}]).length,0);
  assert.equal(revisionQueue([wrong,right,wrongAgain],[{key,reviewedAt:'2026-10-02T16:00:00Z'}]).length,1);
  assert.equal(revisionQueue([attempt({},1)],[]).filter(row=>row.reason==='unanswered').length,2);
});

test('backup merge does not replace a different local recovery session',()=>{
  store.clear();claimDraft(draft());const before=store.get(STORAGE_KEY);
  assert.throws(()=>importAttempts(JSON.stringify({format:BACKUP_FORMAT,attempts:[],draft:draft({id:'other-session'})})),/saved session/);
  assert.equal(store.get(STORAGE_KEY),before);
});
test('importing a completed copy of the recovery attempt does not revive it',()=>{
  store.clear();claimDraft(draft());
  importAttempts(JSON.stringify({format:BACKUP_FORMAT,attempts:[createAttempt(config,{},['q1','q2'],600,'session-1')],draft:draft()}));
  assert.equal(readWorkspace().draft,null);assert.equal(readAttempts().length,1);
});

test('equal timestamp attempts use latest-first saved history order for revision',()=>{
  const wrong=attempt({q1:0,q2:1},1),right={...attempt({q1:2,q2:1},1),id:'later-same-millisecond'};
  assert.equal(revisionQueue([right,wrong],[]).length,0);
});
