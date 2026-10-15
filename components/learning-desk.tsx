"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {exams} from "@/lib/catalog";
import {lessonsFor} from "@/lib/learning";
import {readStudy} from "@/lib/study-storage";
import {StudyShell} from "./study-shell";
export function LearningDesk({all=false}:{all?:boolean}) {
  const [exam,setExam]=useState("cat"),[completed,setCompleted]=useState<string[]>([]),[issue,setIssue]=useState("");
  useEffect(()=>{try{const requested=new URLSearchParams(window.location.search).get("exam");const saved=requested??window.localStorage.getItem("anvaya-active-track");if(exams.some(e=>e.id===saved))setExam(saved!);setCompleted(readStudy().completed)}catch{setIssue("Saved progress could not be read. Export raw data from Review before clearing it.")}},[]);
  const path=lessonsFor(exam),next=path.find(l=>!completed.includes(`${exam}:${l.slug}`))??path[0],current=exams.find(e=>e.id===exam)!;
  return <StudyShell><header className="desk-top"><span className="eyebrow">{all?"LEARNING PATHS":"YOUR STUDY DESK"}</span><label className="track-select">Preparing for<select value={exam} onChange={e=>{setExam(e.target.value);try{window.localStorage.setItem("anvaya-active-track",e.target.value)}catch{setIssue("Exam preference could not be saved.")}}}>{exams.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label></header>
    <section className="desk-intro"><span className="desk-kicker">{current.group} / {current.name}</span><h1>{all?"Understand it. Then use it.":"What will you learn today?"}</h1><p>Work through a concept, see the reasoning, and test it yourself. Start with the foundations below.</p></section>
    {issue&&<p className="notice" role="alert">{issue}</p>}
    {!all&&next&&<section className="continue-strip"><div><span className="eyebrow">{completed.includes(`${exam}:${next.slug}`)?"REVISIT A FOUNDATION":"NEXT IN YOUR PATH"}</span><h2>{next.title}</h2><p>{next.objective}</p><Link href={`/learn/${next.slug}?exam=${encodeURIComponent(exam)}`} className="study-button">Open lesson <span>↗</span></Link></div><div className="continue-meta"><span>{String(path.indexOf(next)+1).padStart(2,"0")}</span><p>{next.minutes} min<br/>{next.subject}</p></div></section>}
    <section className="curriculum"><div className="section-heading"><div><span className="eyebrow">LEARN · WORK · CHECK</span><h2>{current.name} foundations</h2></div><span>{path.filter(l=>completed.includes(`${exam}:${l.slug}`)).length} / {path.length} lessons read</span></div>
      <p className="coverage-note">AI-generated learning drafts, not yet editorially reviewed. This is a starting path, not the complete syllabus. Each lesson contains teaching, a worked example and a checkpoint. Completing a lesson records reading progress, not mastery.</p>
      <ol className="lesson-list">{path.map((lesson,i)=><li key={lesson.slug}><span className="lesson-number">{String(i+1).padStart(2,"0")}</span><Link href={`/learn/${lesson.slug}?exam=${encodeURIComponent(exam)}`}><span className="eyebrow">{lesson.subject}</span><h3>{lesson.title}</h3><p>{lesson.objective}</p></Link><div className="lesson-meta"><span>{completed.includes(`${exam}:${lesson.slug}`)?"✓ Read":`${lesson.minutes} min`}</span><Link href={`/learn/${lesson.slug}?exam=${encodeURIComponent(exam)}`} aria-label={`Open ${lesson.title}`}>↗</Link></div></li>)}</ol>
    </section>
    <section className="practice-invite"><div><span className="eyebrow">WHEN YOU’RE READY</span><h2>Practice that follows the paper.</h2><p>{exam==="cat"?"VARC → DILR → QA, separate timers and locked completed sections.":exam==="ssc"?"A separate Tier-I rehearsal with subject timers and its own marking scheme.":"CAT and SSC rehearsals are currently available. Full mocks for this exam are not available yet; keep learning the relevant foundations."}</p></div><Link href="/practice" className="study-button secondary-study">Open practice →</Link></section>
  </StudyShell>;
}
