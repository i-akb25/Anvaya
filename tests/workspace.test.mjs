import test from 'node:test';
import assert from 'node:assert/strict';
import {validWorkspace,emptyWorkspace} from '../lib/workspace.ts';
import {materials} from '../lib/materials.ts';
test('workspace accepts planner and notebook data, rejects malformed or unbounded backups',()=>{
 assert.equal(validWorkspace(emptyWorkspace),true);
 const good={version:1,tasks:[{id:'a',title:'Read',exam:'upsc',date:'2026-10-14',done:false}],papers:{private:{text:'Recall notes',seconds:24}}};
 assert.equal(validWorkspace(good),true);
 for(const value of [null,{}, {...good,version:2},{...good,tasks:[{...good.tasks[0],done:'false'}]},{...good,papers:{private:{text:'x',seconds:-1}}},{...good,papers:JSON.parse('{"__proto__":{"text":"x","seconds":0}}')},{...good,tasks:Array(1001).fill(good.tasks[0])},{...good,papers:{private:{text:'x'.repeat(100001),seconds:0}}}])assert.equal(validWorkspace(value),false);
});
test('paper library keeps separate GATE papers and authority-hosted original links',()=>{
 const papers=materials.filter(m=>m.kind==='paper');assert.deepEqual(papers.map(m=>m.examId),['gate-ee','gate-ec','gate-in']);
 assert.equal(new Set(materials.map(m=>m.id)).size,materials.length);
 for(const p of papers){assert.equal(new URL(p.url).hostname,'gate2027.iitm.ac.in');assert.match(p.url,new RegExp(p.examId.slice(5).toUpperCase()+'\\.pdf$'));assert.ok(p.keyUrl);}
});
test('corrupt saved workspace is surfaced, and failed writes preserve existing data',async()=>{
 const {readWorkspace,saveWorkspace,workspaceKey}=await import('../lib/workspace.ts');
 let raw='{"broken":true}';let quota=false;
 const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>key===workspaceKey?raw:null,setItem:(_key,value)=>{if(quota)throw Error('quota');raw=value}}});
 try{
  assert.throws(()=>readWorkspace());assert.equal(raw,'{"broken":true}');
  raw=JSON.stringify(emptyWorkspace);quota=true;assert.throws(()=>saveWorkspace({...emptyWorkspace,tasks:[{id:'1',title:'Read',exam:'cat',date:'2026-10-14',done:false}]}));assert.deepEqual(JSON.parse(raw),emptyWorkspace);
  quota=false;saveWorkspace({...emptyWorkspace,papers:{private:{text:'Saved note',seconds:2}}});assert.equal(readWorkspace().papers.private.text,'Saved note');
 }finally{if(original)Object.defineProperty(globalThis,'localStorage',original);else delete globalThis.localStorage;}
});
