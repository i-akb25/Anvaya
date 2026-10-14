import test from 'node:test';
import assert from 'node:assert/strict';
import {activeSection,answerSession,canAccess,examQuestion,foundationQuestions,makeSession,scoreSession,sectionRemaining,validateSession} from '../lib/assessment.ts';
import {lessons} from '../lib/learning.ts';
import {exportStudy,finishStudySession,importStudy,readStudy,saveStudySession,startStudySession,STUDY_KEY,updateStudy,validateStudy} from '../lib/study-storage.ts';
const start=Date.parse('2026-10-14T16:00:00Z');
const session=(paper='cat-68',options={})=>makeSession(paper,[],'tab-1',{now:start,random:()=>.5,...options});
const store=new Map();
globalThis.window={localStorage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)}};

test('the released bank has 146 distinct questions, valid keys and explanations',()=>{
  assert.equal(foundationQuestions.length,146);
  assert.equal(new Set(foundationQuestions.map(q=>q.id)).size,146);
  // Context distinguishes questions such as main-idea items within separate passages.
  assert.equal(new Set(foundationQuestions.map(q=>q.context+'|'+q.stem)).size,146);
  for(const q of foundationQuestions){assert.equal(q.origin,"ai-generated");assert.equal(q.verification,"unreviewed");assert.equal(q.sourceUrl,null);assert.equal(q.answerKeyStatus,"draft");assert.ok(q.explanation.length>15);if(q.type==='mcq'){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.ok(Number(q.answer)>=0&&Number(q.answer)<4)}else{assert.ok(Number.isFinite(Number(q.answer)));assert.equal(q.mcqChoices[Number(q.mcqAnswer)],q.answer)}}
});
test('CAT full rehearsal contains exactly 24 VARC, 22 DILR and 22 QA without duplication',()=>{
  const s=session();assert.equal(s.questionIds.length,68);assert.equal(new Set(s.questionIds).size,68);
  assert.deepEqual(s.sections.map(p=>[p.id,p.count,p.seconds]),[['VARC',24,2400],['DILR',22,2400],['QA',22,2400]]);
  assert.equal(scoreSession(s,start).maxScore,204);
});
test('CAT section boundaries lock earlier sections and do not allow jumping ahead',()=>{
  const s=session(),varc=s.questionIds.find(id=>examQuestion(id).section==='VARC'),dilr=s.questionIds.find(id=>examQuestion(id).section==='DILR'),qa=s.questionIds.find(id=>examQuestion(id).section==='QA');
  assert.equal(activeSection(s,start),0);assert.equal(sectionRemaining(s,start),2400);
  assert.equal(canAccess(s,dilr,start),false);assert.throws(()=>answerSession(s,qa,'0',start),/locked/);
  assert.equal(activeSection(s,start+2400_000),1);assert.equal(canAccess(s,varc,start+2400_000),false);
  assert.throws(()=>answerSession(s,varc,'0',start+2400_000),/locked/);
  assert.equal(activeSection(s,start+4800_000),2);assert.equal(activeSection(s,start+7200_000),3);assert.equal(sectionRemaining(s,start+7200_000),0);
});
test('reload after time away uses the original deadline, including multiple expired sections',()=>{
  const s=validateSession(JSON.parse(JSON.stringify(session())));
  assert.equal(activeSection(s,start+5000_000),2);assert.equal(sectionRemaining(s,start+5000_000),2200);
  assert.equal(activeSection(s,start+9000_000),3);
});
test('SSC Tier-I has 100 MCQs, 15 minutes per subject and independent marking',()=>{
  const s=session('ssc-tier-1');assert.equal(s.questionIds.length,100);assert.equal(scoreSession(s,start).maxScore,200);
  for(const id of s.questionIds)assert.equal(examQuestion(id,s.paperId).type,'mcq');
  assert.deepEqual(s.sections.map(p=>p.seconds),[900,900,900,900]);assert.equal(activeSection(s,start+900_000),1);
  const id=s.questionIds[0],q=examQuestion(id,s.paperId);const wrong=String((Number(q.answer)+1)%4);
  assert.equal(scoreSession({...s,answers:{[id]:wrong}},start).score,-.5);
});
test('CAT scores numeric entry without a penalty and MCQs with a negative mark',()=>{
  const s=session(),numeric=s.questionIds.find(id=>examQuestion(id).type==='numeric'),mcq=s.questionIds.find(id=>examQuestion(id).type==='mcq');
  const q=examQuestion(mcq),wrong=String((Number(q.answer)+1)%4);
  assert.equal(scoreSession({...s,answers:{[numeric]:'99999',[mcq]:wrong}},start).score,-1);
  assert.equal(scoreSession({...s,answers:{[numeric]:String(Number(examQuestion(numeric).answer))+'.0'}},start).score,3);
});
test('unseen selection stops at exhaustion instead of silently reusing questions',()=>{
  const first=session('cat-68',{mode:'drill',section:'QA'});
  const second=makeSession('cat-68',first.questionIds,'tab-1',{mode:'drill',section:'QA',now:start});
  assert.equal(second.questionIds.some(id=>first.questionIds.includes(id)),false);
  assert.throws(()=>makeSession('cat-68',first.questionIds,'tab-1',{now:start}),/unseen/);
  assert.equal(makeSession('cat-68',foundationQuestions.map(q=>q.id),'tab-1',{allowRepeat:true,now:start}).questionIds.length,68);
});
test('tampered question sets, blueprint duration and malformed answers are rejected',()=>{
  const s=session();
  for(const changes of [{id:undefined},{writerId:undefined},{questionIds:[...s.questionIds.slice(1),s.questionIds[1]]},{bankVersion:'future'},{sections:s.sections.map((p,i)=>i? p:{...p,seconds:1})},{answers:{missing:'0'}},{answers:{[s.questionIds[0]]:'10'}}])assert.throws(()=>validateSession({...s,...changes}));
});
test('all-correct answer keys produce full marks for both paper blueprints',()=>{
  for(const paper of ['cat-68','ssc-tier-1']){const s=session(paper);const answers=Object.fromEntries(s.questionIds.map(id=>[id,examQuestion(id,paper).answer]));assert.equal(scoreSession({...s,answers},start).score,paper==='cat-68'?204:200)}
});
test('quantitative keys agree with independently computed worked values',()=>{
  const expected=[4,600,35,'9:10',140,10,28,36/5,30,54,48,23,'3 and 4',5,180,1,15,150,154,'1/9',20,1200,210,216,28];
  const pool=foundationQuestions.filter(q=>q.section==='QA');
  pool.forEach((q,i)=>{const answer=q.type==='numeric'?q.answer:q.choices[Number(q.answer)];if(typeof expected[i]==='number')assert.ok(Math.abs(Number(answer)-expected[i])<1e-8,q.id);else assert.equal(answer,expected[i],q.id)});
});
test('lesson checkpoint keys and worked examples exist across all original exam tracks',()=>{
  assert.equal(lessons.length,13);
  for(const lesson of lessons){assert.equal(lesson.origin,"ai-generated");assert.equal(lesson.verification,"unreviewed");assert.ok(lesson.concepts.length>=2);assert.ok(lesson.example.steps.length>=3);assert.equal(lesson.checkpoint.choices.length,4);assert.ok(lesson.checkpoint.choices[lesson.checkpoint.correct]);assert.ok(lesson.trap.length>20)}
  for(const exam of ['cat','ssc','sbi','ibps','upsc','bpsc','gate-ee','gate-ec','gate-in','ese'])assert.ok(lessons.some(l=>l.exams.includes(exam)),exam);
});
test('new study backup round trip preserves notes, reading progress and frozen session',()=>{
  store.clear();updateStudy(data=>({...data,completed:[lessons[0].slug],notes:{[lessons[0].slug]:'Check the original base.'}}));startStudySession(session());
  const before=readStudy(),backup=exportStudy();store.clear();importStudy(backup);assert.deepEqual(readStudy(),before);
});
test('resuming in a different tab rejects stale writes and submit saves seen IDs',()=>{
  store.clear();const s=session();startStudySession(s);startStudySession({...s,writerId:'tab-2'});assert.throws(()=>saveStudySession(s),/ownership/);
  assert.throws(()=>finishStudySession(s,start),/ownership/);
  finishStudySession({...s,writerId:'tab-2'},start+7200_000);assert.equal(readStudy().seen.length,68);assert.equal(readStudy().session,null);assert.equal(readStudy().results.length,1);
  assert.throws(()=>startStudySession(s),/submitted/);
});
test('malformed imports and quota errors leave saved study data intact',()=>{
  store.clear();updateStudy(data=>({...data,notes:{[lessons[0].slug]:'Retain this note'}}));const before=store.get(STUDY_KEY);
  assert.throws(()=>importStudy(JSON.stringify({format:STUDY_KEY,data:{completed:[],notes:{unknown:'x'},seen:[],session:null,results:[]}})));assert.equal(store.get(STUDY_KEY),before);
  const original=window.localStorage.setItem;window.localStorage.setItem=()=>{throw Error('quota')};
  try{assert.throws(()=>startStudySession(session()),/quota/);assert.equal(store.get(STUDY_KEY),before)}finally{window.localStorage.setItem=original}
});


test('shared foundation lessons keep reading progress separate by exam context',()=>{
  store.clear();const slug=lessons[0].slug;updateStudy(data=>({...data,completed:[`cat:${slug}`]}));
  assert.ok(readStudy().completed.includes(`cat:${slug}`));assert.equal(readStudy().completed.includes(`ssc:${slug}`),false);
  assert.throws(()=>updateStudy(data=>({...data,completed:[`gate-ee:${slug}`]})));
});


test('submission retries are idempotent and report time without inventing per-question timing',()=>{
  store.clear();const s=session();startStudySession(s);const first=finishStudySession(s,start+7200_000);
  const retry=finishStudySession(s,start+9000_000);assert.equal(retry.results.length,1);assert.deepEqual(retry.results,first.results);
  assert.equal(first.results[0].elapsedSeconds,7200);assert.deepEqual(first.results[0].sections.map(section=>section.elapsedSeconds),[2400,2400,2400]);
});

test('all ten exams have independent coverage records and no unreviewed official test can start',async()=>{
  const {examCoverage,officialAssessmentReadiness}=await import('../lib/exam-coverage.ts');
  const {exams}=await import('../lib/catalog.ts');
  assert.deepEqual(examCoverage.map(r=>r.examId).sort(),exams.map(e=>e.id).sort());
  assert.equal(new Set(examCoverage.map(r=>r.examId)).size,10);
  for(const record of examCoverage){assert.ok(record.sourceUrl.startsWith('https://'));assert.ok(record.stages.length);assert.equal(officialAssessmentReadiness(record.examId,false,false).ready,false);assert.equal(officialAssessmentReadiness(record.examId,true,false).ready,false);assert.equal(officialAssessmentReadiness(record.examId,true,true).ready,false)}
  assert.equal(officialAssessmentReadiness('unregistered',true,true).ready,false);
});
test('generated learning previews cannot be enabled in production',async()=>{
  const {allowDraftPreview,canPublishContent}=await import('../lib/content-policy.ts');
  assert.equal(allowDraftPreview('production','true'),false);
  assert.equal(allowDraftPreview('development',undefined),false);
  assert.equal(allowDraftPreview('development','true'),true);
  assert.equal(canPublishContent('unreviewed'),false);assert.equal(canPublishContent('editorially-reviewed'),true);
});
