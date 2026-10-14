import {questions} from "./catalog.ts";
import {evaluate} from "./scoring.ts";
export type Mode="mixed"|"topic";
export type TestConfig={mode:Mode;topic:string;count:number;durationMinutes:number;positive:number;negative:number};
export type Attempt={id:string;createdAt:string;config:TestConfig;answers:Record<string,number>;questionIds:string[];elapsedSeconds:number;score:number;correct:number;incorrect:number;unanswered:number;accuracy:number};
export function buildTest(config:TestConfig){if(!Number.isInteger(config.count)||config.count<1||config.count>100||!Number.isInteger(config.durationMinutes)||config.durationMinutes<1||config.durationMinutes>240)throw new Error("Invalid test configuration");if(!["mixed","topic"].includes(config.mode)||typeof config.topic!=="string")throw new Error("Invalid selection mode");if(!Number.isFinite(config.positive)||!Number.isFinite(config.negative)||config.positive<=0||config.positive>100||config.negative<0||config.negative>100)throw new Error("Invalid marking configuration");const pool=config.mode==="topic"?questions.filter(q=>q.topic===config.topic):questions;return pool.slice(0,Math.min(config.count,pool.length))}
export function createAttempt(config:TestConfig,answers:Record<string,number>,questionIds:string[],elapsedSeconds:number):Attempt{const selected=questionIds.map(id=>questions.find(q=>q.id===id)).filter((q):q is (typeof questions)[number]=>Boolean(q));const result=evaluate(answers,selected,config.positive,config.negative);return {id:crypto.randomUUID(),createdAt:new Date().toISOString(),config,answers,questionIds,elapsedSeconds,...result}}
const storageKey="anvaya-practice-v1";
function validateAttempt(value:unknown):Attempt{
if(!value||typeof value!=="object")throw new Error("Invalid attempt");
const a=value as Attempt;
if(typeof a.id!=="string"||a.id.length>100||typeof a.createdAt!=="string"||!Number.isFinite(Date.parse(a.createdAt))||!a.config||!a.answers||typeof a.answers!=="object"||Array.isArray(a.answers)||!Array.isArray(a.questionIds)||!a.questionIds.length||a.questionIds.length>100||new Set(a.questionIds).size!==a.questionIds.length||!Number.isFinite(a.elapsedSeconds)||a.elapsedSeconds<0||a.elapsedSeconds>86400)throw new Error("Invalid attempt fields");
buildTest(a.config);
const items=a.questionIds.map(id=>questions.find(q=>q.id===id));
if(items.some(q=>!q))throw new Error("Backup uses an unsupported question bank");
const selected=items as typeof questions;
const answers:Record<string,number>={};
for(const [id,answer] of Object.entries(a.answers)){const q=selected.find(q=>q.id===id);if(!q||!Number.isInteger(answer)||answer<0||answer>=q.choices.length)throw new Error("Invalid saved response");answers[id]=answer}
return {id:a.id,createdAt:a.createdAt,config:{mode:a.config.mode,topic:a.config.topic,count:a.config.count,durationMinutes:a.config.durationMinutes,positive:a.config.positive,negative:a.config.negative},answers,questionIds:selected.map(q=>q.id),elapsedSeconds:a.elapsedSeconds,...evaluate(answers,selected,a.config.positive,a.config.negative)};
}
export function readAttempts():Attempt[]{if(typeof window==="undefined")return [];try{const data=JSON.parse(window.localStorage.getItem(storageKey)||"[]");if(!Array.isArray(data))return [];return data.slice(0,50).flatMap(a=>{try{return [validateAttempt(a)]}catch{return []}})}catch{return []}}
export function saveAttempt(attempt:Attempt){if(typeof window==="undefined")return false;try{const safe=validateAttempt(attempt);window.localStorage.setItem(storageKey,JSON.stringify([safe,...readAttempts()].slice(0,50)));return true}catch{return false}}
export function exportAttempts(){return JSON.stringify({format:"anvaya-practice-v1",exportedAt:new Date().toISOString(),attempts:readAttempts()},null,2)}
export function importAttempts(text:string):number{
if(text.length>2_000_000)throw new Error("Backup must be smaller than 2 MB");
const data=JSON.parse(text);
if(data?.format!=="anvaya-practice-v1"||!Array.isArray(data.attempts)||data.attempts.length>50)throw new Error("Choose an Anvaya practice backup with up to 50 attempts");
const incoming:Attempt[]=data.attempts.map(validateAttempt);
const merged=Array.from(new Map([...readAttempts(),...incoming].map(a=>[a.id,a])).values()).sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,50);
window.localStorage.setItem(storageKey,JSON.stringify(merged));return merged.length;
}
export function clearAttempts(){window.localStorage.removeItem(storageKey)}
