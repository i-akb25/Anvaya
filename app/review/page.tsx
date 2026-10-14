"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {Brand} from "@/components/brand";
import {exams} from "@/lib/catalog";
import {attemptQuestions, revisionQueue, topicPerformance} from "@/lib/analytics";
import {markReviewed, readWorkspace, STORAGE_KEY, type Attempt, type ReviewRecord} from "@/lib/practice";

export default function Review() {
  const [attempts,setAttempts] = useState<Attempt[]>([]);
  const [reviews,setReviews] = useState<ReviewRecord[]>([]);
  const [examId,setExamId] = useState("general");
  const [ready,setReady] = useState(false);
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");
  const refresh = useCallback(() => {
    try {const state = readWorkspace();setAttempts(state.attempts);setReviews(state.reviews);setError("")}
    catch {setError("Saved practice data could not be read. Return to practice to download raw recovery data before clearing it.")}
    setReady(true);
  },[]);
  useEffect(() => {
    refresh();
    const context = new URLSearchParams(window.location.search).get("exam");
    if (context && exams.some(exam => exam.id === context)) setExamId(context);
    function changed(event:StorageEvent) {if (event.key === STORAGE_KEY || event.key === null) refresh()}
    window.addEventListener("storage",changed);
    return () => window.removeEventListener("storage",changed);
  },[refresh]);
  const selected = useMemo(() => attempts.filter(a => (a.config.examId ?? "general") === examId),[attempts,examId]);
  const topics = useMemo(() => topicPerformance(attempts,examId),[attempts,examId]);
  const queue = useMemo(() => revisionQueue(attempts,reviews,examId),[attempts,reviews,examId]);
  const questionCount = selected.reduce((total,a) => total+a.questionIds.length,0);
  const seconds = selected.reduce((total,a) => total+a.elapsedSeconds,0);
  const answered = selected.reduce((total,a) => total+a.correct+a.incorrect,0);
  const correct = selected.reduce((total,a) => total+a.correct,0);

  return <><a className="skip-link" href="#review">Skip to review</a><main className="shell" id="review">
    <header className="head"><Brand/><nav className="row" aria-label="Review navigation"><Link href="/">Workspace</Link><Link href="/practice/custom">Practice →</Link></nav></header>
    <section className="hero"><div className="tag">EVALUATE · REVISE · IMPROVE</div><h1>Let your practice show you what comes next.</h1><p className="sub">Topic observations, recent attempts and a queue for missed questions. Results come from the illustrative bank and your latest 50 saved attempts. They are not predictions of exam performance.</p></section>
    <label className="stack context-filter">Exam tracking context<select className="search" value={examId} onChange={e => {setExamId(e.target.value);setMessage("")}}><option value="general">General practice</option>{exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}</select></label>
    <p className="tag">Each context has its own progress and revision queue. Selecting an exam does not turn sample questions into an official-pattern test.</p>
    {error && <p role="alert" className="notice">{error}</p>}
    <p role="status" className={message ? "status" : ""}>{message}</p>
    {!ready ? <p>Loading practice history…</p> : error ? <Link href="/practice/custom">Open practice and recovery controls →</Link> : <>
      {!selected.length ? <section className="panel section empty-state"><h2>Start with a small practice session.</h2><p>There are no saved attempts in this context yet. Choose it in the practice setup, answer a few questions and return here.</p><Link className="btn" href={`/practice/custom?exam=${encodeURIComponent(examId)}`}>Open practice</Link></section> : <>
        <section className="grid section" aria-label="Practice summary">{[["Saved attempts",selected.length],["Accuracy on answered questions",answered ? `${Math.round(correct/answered*100)}%` : "No answers yet"],["Average seconds per presented question",questionCount ? (seconds/questionCount).toFixed(1) : "—"],["Questions to revisit",queue.length]].map(([label,value]) => <article className="panel" key={label}><div className="tag">{label}</div><h2>{value}</h2></article>)}</section>
        <section className="section"><h2>Topic performance</h2><p className="muted">Repeated practice counts as repeated observations. Accuracy excludes unanswered questions; penalties are only deducted marks, not all potential marks missed. Topics are sorted by lowest accuracy, with unanswered-only topics first.</p>
          <div className="table-scroll" role="region" aria-label="Topic performance table" tabIndex={0}><table><caption>Saved illustrative practice in this tracking context</caption><thead><tr><th scope="col">Topic</th><th scope="col">Correct</th><th scope="col">Incorrect</th><th scope="col">Skipped</th><th scope="col">Accuracy</th><th scope="col">Penalties</th><th scope="col">Observations</th></tr></thead><tbody>{topics.map(row => <tr key={row.topic}><th scope="row">{row.topic}</th><td>{row.correct}</td><td>{row.incorrect}</td><td>{row.skipped}</td><td>{row.accuracy === null ? "No answers" : `${row.accuracy}%`}</td><td>{row.penalties}</td><td>{row.observations}{row.observations < 5 && <span className="tag"> · Small sample</span>}</td></tr>)}</tbody></table></div>
        </section>
      </>}
      <section className="section"><div className="row"><h2>Revision queue</h2><span className="pill">{queue.length} pending</span></div><p className="muted">Includes a question when your latest saved response in this context is wrong or unanswered. A later correct response removes it. Marking it reviewed is your own acknowledgement, not proof of mastery; a newer mistake brings it back.</p>
        {!queue.length ? <div className="panel"><p>{selected.length ? "No pending questions in this context. Reviewed questions remain in your attempt history." : "Your missed questions will appear here after practice."}</p></div> : <div className="stack">{queue.map(row => <article className="panel" key={row.key}><div className="row"><span className="tag">{row.question.topic} · {row.reason === "incorrect" ? "Incorrect response" : "Unanswered"}</span><span className="tag">{new Date(row.attempt.createdAt).toLocaleString()}</span></div><h3>{row.question.stem}</h3>
          <details className="answer-details"><summary>Review answer and explanation</summary><p>Your response: {row.attempt.answers[row.question.id] === undefined ? "Not attempted" : row.question.choices[row.attempt.answers[row.question.id]]}</p><p><strong>Correct answer:</strong> {row.question.choices[row.question.correct]}</p><p>{row.question.explanation}</p><p className="tag">Original illustrative question · {row.attempt.bankVersion}</p></details>
          <div className="row section"><Link className="btn secondary" href={`/practice/custom?topic=${encodeURIComponent(row.question.topic)}&exam=${encodeURIComponent(examId)}`}>Practise this topic</Link><button className="btn secondary" onClick={() => {
            try {markReviewed(row.key);refresh();setMessage("Marked reviewed on this device. A newer missed response will add it back.")}
            catch {setMessage("Review status could not be saved. Your queue was kept.")}
          }}>Mark reviewed</button></div>
        </article>)}</div>}
      </section>
      {!!selected.length && <section className="section"><h2>Mistake notebook</h2><p className="muted">All incorrect responses in the retained attempts, including questions you have since answered correctly. Open an entry to revisit its explanation.</p><div className="stack">{selected.flatMap(attempt => attemptQuestions(attempt).filter(q => attempt.answers[q.id] !== undefined && attempt.answers[q.id] !== q.correct).map(q => <details className="panel" key={`${attempt.id}-${q.id}`}><summary>{q.topic} · {q.stem}</summary><p className="tag">{new Date(attempt.createdAt).toLocaleString()} · Original sample</p><p>Your response: {q.choices[attempt.answers[q.id]]}</p><p><strong>Correct answer:</strong> {q.choices[q.correct]}</p><p>{q.explanation}</p></details>))}</div>{selected.every(a => !a.incorrect) && <p>No incorrect responses in the retained attempts for this context.</p>}</section>}
      {!!selected.length && <section className="section"><h2>Recent attempts</h2><ol className="attempt-list panel">{selected.slice(0,10).map(attempt => <li key={attempt.id}><strong>{new Date(attempt.createdAt).toLocaleString()}</strong><p>{attempt.score} / {attempt.maxScore} points · {attempt.accuracy}% accuracy · {attempt.elapsedSeconds} seconds</p><p className="tag">+{attempt.config.positive} correct / −{attempt.config.negative} incorrect · Illustrative</p></li>)}</ol><Link href="/practice/custom">Open saved reports and backup controls →</Link></section>}
    </>}
    <footer>Practice data stays in this browser. Clearing site data removes it. Export backups from <Link href="/practice/custom">practice</Link>. Support: <a href="mailto:akbsupportinfo@gmail.com">akbsupportinfo@gmail.com</a></footer>
  </main></>;
}
