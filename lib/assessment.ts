import content from "./content/foundations-v1.json" with {type:"json"};

export type SectionId = "VARC"|"DILR"|"QA"|"REASON"|"GA"|"ENGLISH";
export type ExamQuestion = {id:string;section:SectionId;topic:string;stem:string;choices:string[];answer:string;explanation:string;context:string;group:string;type:"mcq"|"numeric";origin:"ai-generated";verification:"unreviewed";language:"en";answerKeyStatus:"draft";sourceUrl:null;examCycle:null;shift:null;level:"foundation";mcqChoices?:string[];mcqAnswer?:string};
export const FOUNDATION_BANK = content.version;
export const foundationQuestions = content.questions as ExamQuestion[];
export type Paper = {id:string;title:string;version:string;examId:string;sections:{id:SectionId;label:string;count:number;seconds:number}[];positive:number;negative:number;description:string;source:string;sourceNote:string};
export const papers:Paper[] = [
  {id:"cat-68",title:"CAT · 68-question rehearsal",version:"cat-68-rehearsal-2026-10-v1",examId:"cat",
    sections:[{id:"VARC",label:"VARC",count:24,seconds:2400},{id:"DILR",label:"DILR",count:22,seconds:2400},{id:"QA",label:"QA",count:22,seconds:2400}],positive:3,negative:1,
    description:"VARC → DILR → QA. Three locked 40-minute sections. 68 original foundation questions; 204 available marks. MCQ: +3/−1. Numeric entry: +3/0.",
    source:"https://cdn.digialm.com/per/g06/pub/32842/EForms/CAT24/CAT_2024_Mock_Test_Navigation_Guide_v1.4.pdf",
    sourceNote:"Official 2024 interface guide is the timing/navigation reference. 68 and 24/22/22 are this requested rehearsal blueprint; CAT 2026 details have not been independently verified here. This is not a PYQ paper or difficulty-calibrated CAT mock."},
  {id:"ssc-tier-1",title:"SSC CGL · Tier-I rehearsal",version:"ssc-cgl-2026-tier1-rehearsal-v1",examId:"ssc",
    sections:[{id:"REASON",label:"Reasoning",count:25,seconds:900},{id:"GA",label:"General awareness",count:25,seconds:900},{id:"QA",label:"Quantitative aptitude",count:25,seconds:900},{id:"ENGLISH",label:"English",count:25,seconds:900}],positive:2,negative:.5,
    description:"100 original foundation questions; 200 marks; 60 minutes with a 15-minute subject timer. +2/−0.5. This rehearsal uses the listed subject order.",
    source:"https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2025.pdf",
    sourceNote:"SSC CGL 2026 notice, §13.8, checked 14 October 2026 (the server filename contains 2025). The listed order is used for this rehearsal; no claim about the live exam’s subject order. Tier-II, DEST and accommodation timings are separate and are not implemented."},
];
export type ExamSession = {id:string;bankVersion:string;paperVersion:string;paperId:string;mode:"full"|"drill";sections:Paper["sections"];questionIds:string[];answers:Record<string,string>;marked:string[];index:number;startedAt:number;writerId:string};
export type ExamResult = {id:string;session:ExamSession;submittedAt:string;elapsedSeconds:number;penalties:number;score:number;maxScore:number;correct:number;incorrect:number;unanswered:number;sections:{id:SectionId;elapsedSeconds:number;penalties:number;score:number;maxScore:number;correct:number;incorrect:number;unanswered:number}[]};
export function getPaper(id:string) {const paper=papers.find(p=>p.id===id);if(!paper)throw Error("Unknown paper");return paper}
export function examQuestion(id:string,paperId?:string) {const q=foundationQuestions.find(q=>q.id===id);if(!q)throw Error("Unknown question");return paperId==="ssc-tier-1"&&q.type==="numeric"?{...q,type:"mcq" as const,choices:q.mcqChoices!,answer:q.mcqAnswer!}:q}
export function totalSeconds(session:ExamSession) {return session.sections.reduce((sum,s)=>sum+s.seconds,0)}
export function activeSection(session:ExamSession,now=Date.now()) {
  let elapsed=Math.max(0,Math.floor((now-session.startedAt)/1000));
  for(let index=0;index<session.sections.length;index++) {if(elapsed<session.sections[index].seconds)return index;elapsed-=session.sections[index].seconds}
  return session.sections.length;
}
export function sectionRemaining(session:ExamSession,now=Date.now()) {
  const index=activeSection(session,now);if(index===session.sections.length)return 0;
  const deadline=session.startedAt+session.sections.slice(0,index+1).reduce((sum,s)=>sum+s.seconds,0)*1000;
  return Math.max(0,Math.ceil((deadline-now)/1000));
}
export function canAccess(session:ExamSession,id:string,now=Date.now()) {
  const section=session.sections[activeSection(session,now)];
  return !!section&&session.questionIds.includes(id)&&examQuestion(id).section===section.id;
}
function shuffledGroups(pool:ExamQuestion[],random:()=>number) {
  const groups=new Map<string,ExamQuestion[]>();for(const q of pool)groups.set(q.group,[...(groups.get(q.group)??[]),q]);
  const values=[...groups.values()];for(let i=values.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}
  return values.flat();
}
export function makeSession(paperId:string,seen:string[],writerId:string,options:{mode?:"full"|"drill";section?:SectionId;allowRepeat?:boolean;now?:number;random?:()=>number}={}) {
  const paper=getPaper(paperId);const mode=options.mode??"full";
  const selectedSections=mode==="drill"?paper.sections.filter(s=>s.id===options.section):paper.sections;
  if(!selectedSections.length)throw Error("Choose a section for your drill.");
  const sections=selectedSections.map(s=>mode==="drill"?{...s,count:Math.min(5,s.count),seconds:600}:{...s});
  const ids:string[]=[];
  for(const section of sections) {
    const pool=foundationQuestions.filter(q=>q.section===section.id&&(options.allowRepeat||!seen.includes(q.id)));
    if(pool.length<section.count)throw Error(`Only ${pool.length} unseen ${section.label} questions remain. Choose a shorter drill or explicitly enable revision repeats. New papers cannot be invented from exhausted content.`);
    ids.push(...shuffledGroups(pool,options.random??Math.random).slice(0,section.count).map(q=>q.id));
  }
  return validateSession({id:crypto.randomUUID(),writerId,bankVersion:FOUNDATION_BANK,paperVersion:paper.version,paperId,mode,sections,questionIds:ids,answers:{},marked:[],index:0,startedAt:options.now??Date.now()});
}
export function validateSession(value:unknown):ExamSession {
  if(!value||typeof value!=="object")throw Error("Invalid saved test");const s=value as ExamSession;const paper=getPaper(s.paperId);
  if(s.bankVersion!==FOUNDATION_BANK||s.paperVersion!==paper.version||typeof s.id!=="string"||typeof s.writerId!=="string"||!/^[-\w]{1,100}$/.test(s.id)||!/^[-\w]{1,100}$/.test(s.writerId)||!Number.isSafeInteger(s.startedAt)||s.startedAt<0||!["full","drill"].includes(s.mode)||!Array.isArray(s.sections)||!Array.isArray(s.questionIds)||new Set(s.questionIds).size!==s.questionIds.length||!s.questionIds.length||s.questionIds.length>100||!s.answers||typeof s.answers!=="object"||Array.isArray(s.answers)||!Array.isArray(s.marked)||new Set(s.marked).size!==s.marked.length||!Number.isInteger(s.index)||s.index<0||s.index>=s.questionIds.length)throw Error("Unsupported or invalid test state");
  const expected=s.mode==="full"?paper.sections:s.sections.length===1?paper.sections.filter(part=>part.id===s.sections[0].id).map(part=>({...part,count:5,seconds:600})):[];
  if(!expected.length||(s.sections.length!==expected.length||s.sections.some((part,i)=>part.id!==expected[i].id||part.count!==expected[i].count||part.seconds!==expected[i].seconds||part.label!==expected[i].label)))throw Error("Test structure does not match its frozen blueprint");
  if(s.questionIds.length!==s.sections.reduce((sum,part)=>sum+part.count,0))throw Error("Incorrect question count");
  let offset=0;for(const part of s.sections){const selected=s.questionIds.slice(offset,offset+part.count);if(selected.some(id=>examQuestion(id).section!==part.id))throw Error("Question in wrong section");offset+=part.count}
  const answers:Record<string,string>={};
  for(const[id,answer]of Object.entries(s.answers)){if(!s.questionIds.includes(id)||typeof answer!=="string"||answer.length>30)throw Error("Invalid answer");const q=examQuestion(id,s.paperId);if(q.type==="mcq"&&!/^[0-3]$/.test(answer))throw Error("Invalid option");if(q.type==="numeric"&&answer!==""&&!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(answer))throw Error("Enter a number only");answers[id]=answer}
  if(s.marked.some(id=>!s.questionIds.includes(id)))throw Error("Invalid review flag");
  return {...s,sections:expected.map(part=>({...part})),questionIds:[...s.questionIds],answers,marked:[...s.marked]};
}
export function answerSession(session:ExamSession,id:string,answer:string,now=Date.now()) {
  if(!canAccess(session,id,now))throw Error("This question is outside the active section. Completed sections are locked.");
  const answers={...session.answers};if(answer==="")delete answers[id];else answers[id]=answer;
  return validateSession({...session,answers});
}
export function isCorrect(q:ExamQuestion,answer:string|undefined) {
  if(answer===undefined||answer==="")return false;
  return q.type==="numeric"?Number.isFinite(Number(answer))&&Math.abs(Number(answer)-Number(q.answer))<1e-7:answer===q.answer;
}
export function scoreSession(value:ExamSession,now=Date.now()):ExamResult {
  const session=validateSession(value),paper=getPaper(session.paperId);
  let sectionOffset=0;
  const elapsedSeconds=Math.min(totalSeconds(session),Math.max(0,Math.floor((now-session.startedAt)/1000)));
  const sections=session.sections.map(part=>{
    let score=0,correct=0,incorrect=0,unanswered=0,penalties=0;
    for(const id of session.questionIds.filter(id=>examQuestion(id).section===part.id)) {
      const q=examQuestion(id,session.paperId),answer=session.answers[id];
      if(answer===undefined||answer==="")unanswered++;else if(isCorrect(q,answer)){correct++;score+=paper.positive}else{incorrect++;if(q.type==="mcq"){score-=paper.negative;penalties+=paper.negative}}
    }
    const timeUsed=Math.min(part.seconds,Math.max(0,elapsedSeconds-sectionOffset));sectionOffset+=part.seconds;
    return {id:part.id,elapsedSeconds:timeUsed,penalties:Number(penalties.toFixed(2)),score:Number(score.toFixed(2)),maxScore:part.count*paper.positive,correct,incorrect,unanswered};
  });
  return {id:session.id,session,submittedAt:new Date(now).toISOString(),elapsedSeconds,penalties:Number(sections.reduce((sum,s)=>sum+s.penalties,0).toFixed(2)),score:Number(sections.reduce((sum,s)=>sum+s.score,0).toFixed(2)),maxScore:sections.reduce((sum,s)=>sum+s.maxScore,0),correct:sections.reduce((sum,s)=>sum+s.correct,0),incorrect:sections.reduce((sum,s)=>sum+s.incorrect,0),unanswered:sections.reduce((sum,s)=>sum+s.unanswered,0),sections};
}
