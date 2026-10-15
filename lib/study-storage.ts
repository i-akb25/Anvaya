import {examQuestion, papers, scoreSession, validateSession, type ExamResult, type ExamSession} from "./assessment.ts";
import {exams} from "./catalog.ts";
import {lessons} from "./learning.ts";
export const STUDY_KEY="anvaya-study-v1";
export type StudyData={completed:string[];notes:Record<string,string>;seen:string[];session:ExamSession|null;results:ExamResult[]};
const blank=():StudyData=>({completed:[],notes:{},seen:[],session:null,results:[]});
function validCompletion(key:string){const [exam,slug]=key.includes(":")?key.split(":"):["general",key];return (exam==="general"||exams.some(e=>e.id===exam))&&lessons.some(l=>l.slug===slug&&(exam==="general"||l.exams.includes(exam)))&&key.split(":").length<=2}
export function validateStudy(value:unknown):StudyData {
  if(!value||typeof value!=="object")throw Error("Invalid study backup");const d=value as StudyData;
  if(!Array.isArray(d.completed)||d.completed.length>100||d.completed.some(key=>typeof key!=="string"||!validCompletion(key))||!d.notes||typeof d.notes!=="object"||Array.isArray(d.notes)||!Array.isArray(d.seen)||d.seen.length>1000||!Array.isArray(d.results)||d.results.length>30)throw Error("Invalid study data");
  const notes:Record<string,string>={};for(const[slug,note]of Object.entries(d.notes)){if(!lessons.some(l=>l.slug===slug)||typeof note!=="string"||note.length>5000)throw Error("Invalid lesson note");notes[slug]=note}
  const seen=[...new Set(d.seen)];seen.forEach(id=>examQuestion(id));
  const results=d.results.map(result=>{if(!result||typeof result.submittedAt!=="string"||!Number.isFinite(Date.parse(result.submittedAt)))throw Error("Invalid result");return scoreSession(validateSession(result.session),Date.parse(result.submittedAt))});
  const session=d.session===null?null:validateSession(d.session);
  if(session&&results.some(r=>r.id===session.id))throw Error("Completed session cannot be recovered");
  return {completed:[...new Set(d.completed.map(key=>key.includes(":")?key:`general:${key}`))],notes,seen:[...new Set([...seen,...results.flatMap(r=>r.session.questionIds)])],session,results};
}
export function readStudy():StudyData {
  if(typeof window==="undefined")return blank();const raw=window.localStorage.getItem(STUDY_KEY);return raw===null?blank():validateStudy(JSON.parse(raw));
}
export function updateStudy(change:(previous:StudyData)=>StudyData) {const next=validateStudy(change(readStudy()));window.localStorage.setItem(STUDY_KEY,JSON.stringify(next));return next}
export function startStudySession(session:ExamSession) {return updateStudy(data=>{if(data.session&&data.session.id!==session.id)throw Error("Resume or discard the unfinished test first.");if(data.results.some(r=>r.id===session.id))throw Error("This test has already been submitted.");return {...data,session}})}
export function saveStudySession(session:ExamSession) {return updateStudy(data=>{if(data.session?.id!==session.id||data.session.writerId!==session.writerId)throw Error("Test ownership changed in another tab.");return {...data,session}})}
export function finishStudySession(session:ExamSession,now=Date.now()) {const existing=readStudy();if(existing.results.some(result=>result.id===session.id))return existing;return updateStudy(data=>{if(data.session?.id!==session.id||data.session.writerId!==session.writerId)throw Error("Test ownership changed in another tab.");const result=scoreSession(session,now);return {...data,session:null,seen:[...new Set([...data.seen,...session.questionIds])],results:[result,...data.results.filter(r=>r.id!==result.id)].slice(0,30)}})}
export function exportStudy() {return JSON.stringify({format:STUDY_KEY,exportedAt:new Date().toISOString(),data:readStudy()},null,2)}
export function importStudy(text:string) {if(new TextEncoder().encode(text).length>2_000_000)throw Error("Backup exceeds 2 MB.");const file=JSON.parse(text);if(file?.format!==STUDY_KEY)throw Error("Choose an Anvaya study backup.");const incoming=validateStudy(file.data);if(readStudy().session)throw Error("Finish or discard your active test before restoring.");window.localStorage.setItem(STUDY_KEY,JSON.stringify(incoming));return incoming}
export function trackName(id:string) {return papers.find(p=>p.examId===id)?.title??id}
