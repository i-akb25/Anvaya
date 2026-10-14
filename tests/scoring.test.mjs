import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluate} from '../lib/scoring.ts';
import {buildTest,createAttempt,saveAttempt,readAttempts,exportAttempts,importAttempts,clearAttempts} from '../lib/practice.ts';
const config={mode:'mixed',topic:'Indian Polity',count:6,durationMinutes:10,positive:1,negative:.25};
const store=new Map();
globalThis.window={localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)}};
test('scoring counts correct, incorrect and unanswered responses',()=>{
assert.deepEqual(evaluate({a:1,b:0},[{id:'a',correct:1},{id:'b',correct:1},{id:'c',correct:0}],2,.5),{correct:1,incorrect:1,unanswered:1,score:1.5,maxScore:6,accuracy:50});
assert.equal(evaluate({},[],1,.25).accuracy,0);
assert.throws(()=>evaluate({},[],NaN,0));
});
test('test configuration validates bounds and filters available topics',()=>{
assert.equal(buildTest({...config,mode:'topic',topic:'Electrical Engineering'}).length,1);
assert.equal(buildTest({...config,count:100}).length,6);
for(const change of [{durationMinutes:0},{count:1.5},{negative:-1},{positive:Infinity},{mode:'unknown'}])assert.throws(()=>buildTest({...config,...change}));
});
test('history round trip, score recalculation, deduplication and deletion',()=>{
store.clear();const a=createAttempt(config,{q1:2},['q1','q2'],10);assert.ok(saveAttempt(a));
const backup=exportAttempts();clearAttempts();assert.equal(readAttempts().length,0);
assert.equal(importAttempts(backup),1);assert.equal(importAttempts(backup),1);
const data=JSON.parse(backup);data.attempts[0].score=999;importAttempts(JSON.stringify(data));assert.equal(readAttempts()[0].score,1);
clearAttempts();assert.deepEqual(readAttempts(),[]);
});
test('invalid backups do not overwrite existing history',()=>{
store.clear();saveAttempt(createAttempt(config,{},['q1'],0));const before=exportAttempts();
for(const input of ['{}','{',JSON.stringify({format:'anvaya-practice-v1',attempts:[{id:'broken'}]}),'x'.repeat(2_000_001)])assert.throws(()=>importAttempts(input));
assert.deepEqual(JSON.parse(exportAttempts()).attempts,JSON.parse(before).attempts);
const data=JSON.parse(before);data.attempts[0].answers={q1:999};assert.throws(()=>importAttempts(JSON.stringify(data)));
});
test('unavailable or corrupt browser storage fails safely',()=>{
store.set('anvaya-practice-v1','broken');assert.deepEqual(readAttempts(),[]);
const original=window.localStorage;window.localStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
assert.deepEqual(readAttempts(),[]);assert.equal(saveAttempt(createAttempt(config,{},['q1'],0)),false);window.localStorage=original;
});
