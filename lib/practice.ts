import {questions} from "./catalog";
import {evaluate} from "./scoring";
export type Mode="mixed"|"topic";
export type TestConfig={mode:Mode;topic:string;count:number;durationMinutes:number;positive:number;negative:number};
export type Attempt={id:string;createdAt:string;config:TestConfig;answers:Record<string,number>;questionIds:string[];elapsedSeconds:number;score:number;correct:number;incorrect:number;unanswered:number;accuracy:number};
export function buildTest(config:TestConfig){if(!Number.isInteger(config.count)||config.count<1||config.count>100||!Number.isInteger(config.durationMinutes)||config.durationMinutes<1||config.durationMinutes>240)throw new Error("Invalid test configuration");if(!Number.isFinite(config.positive)||!Number.isFinite(config.negative)||config.positive<=0||config.negative<0)throw new Error("Invalid marking configuration");const pool=config.mode==="topic"?questions.filter(q=>q.topic===config.topic):questions;return pool.slice(0,Math.min(config.count,pool.length))}
export function createAttempt(config:TestConfig,answers:Record<string,number>,questionIds:string[],elapsedSeconds:number):Attempt{const selected=questionIds.map(id=>questions.find(q=>q.id===id)).filter((q):q is (typeof questions)[number]=>Boolean(q));const result=evaluate(answers,selected,config.positive,config.negative);return {id:crypto.randomUUID(),createdAt:new Date().toISOString(),config,answers,questionIds,elapsedSeconds,...result}}
const storageKey="anvaya-practice-v1";
export function readAttempts():Attempt[]{if(typeof window==="undefined")return [];try{const data=JSON.parse(window.localStorage.getItem(storageKey)||"[]");return Array.isArray(data)?data.filter(a=>a&&typeof a.id==="string"&&typeof a.createdAt==="string"&&Array.isArray(a.questionIds)).slice(0,50):[]}catch{return []}}
export function saveAttempt(attempt:Attempt){if(typeof window==="undefined")return false;try{window.localStorage.setItem(storageKey,JSON.stringify([attempt,...readAttempts()].slice(0,50)));return true}catch{return false}}
export function exportAttempts(){return JSON.stringify({format:"anvaya-practice-v1",exportedAt:new Date().toISOString(),attempts:readAttempts()},null,2)}
