"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Link from "next/link";
import {Brand} from "@/components/brand";
import {exams} from "@/lib/catalog";
import {BANK_KIND, BANK_VERSION, bankQuestions} from "@/lib/question-bank";
import {
  BACKUP_FORMAT, STORAGE_KEY, DraftConflictError, buildTest, validateConfig,
  claimDraft, clearAttempts, createAttempt, discardDraft, elapsedSeconds,
  exportAttempts, exportRawPractice, importAttempts, readWorkspace, saveAttempt, saveDraft,
  type Attempt, type Draft, type TestConfig,
} from "@/lib/practice";
import {attemptQuestions} from "@/lib/analytics";

const initial:TestConfig = {mode:"mixed", topic:"Indian Polity", count:6, durationMinutes:10, positive:1, negative:.25, examId:"general"};
const errorText = (error:unknown) => error instanceof Error ? error.message : "Browser storage is unavailable.";
function downloadJson(content:string, filename:string) {
  const url = URL.createObjectURL(new Blob([content], {type:"application/json"}));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url),1000);
}

export default function Practice() {
  const [config,setConfig] = useState(initial);
  const [session,setSession] = useState<Draft|null>(null);
  const [recovery,setRecovery] = useState<Draft|null>(null);
  const [report,setReport] = useState<Attempt|null>(null);
  const [history,setHistory] = useState<Attempt[]>([]);
  const [message,setMessage] = useState("");
  const [storageIssue,setStorageIssue] = useState("");
  const [ready,setReady] = useState(false);
  const [persistent,setPersistent] = useState(true);
  const [now,setNow] = useState(0);
  const writerId = useRef("");
  const submitting = useRef(false);
  const items = useMemo(() => {
    if (session) return session.questionIds.map(id => bankQuestions(session.bankVersion).find(q => q.id === id)!);
    try {return buildTest(config)} catch {return []}
  },[config,session]);
  const current = session ? items[session.index] : null;
  const elapsed = session ? elapsedSeconds(session,now) : 0;

  const refresh = useCallback(() => {
    try {
      const state = readWorkspace();
      setHistory(state.attempts); setRecovery(state.draft); setStorageIssue("");
    } catch (error) {setStorageIssue(`Saved data could not be loaded: ${errorText(error)}`)}
  },[]);

  useEffect(() => {
    writerId.current = crypto.randomUUID();
    refresh(); setReady(true);
    const params = new URLSearchParams(window.location.search);
    const topic = params.get("topic"), examId = params.get("exam");
    const context = exams.some(e => e.id === examId) ? examId! : "general";
    setConfig(previous => ({...previous,examId:context,...(topic && bankQuestions().some(q => q.topic === topic) ? {mode:"topic" as const,topic} : {})}));
  },[refresh]);

  useEffect(() => {
    if (!session) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick,1000);
    window.addEventListener("focus",tick);
    document.addEventListener("visibilitychange",tick);
    return () => {window.clearInterval(timer); window.removeEventListener("focus",tick); document.removeEventListener("visibilitychange",tick)};
  },[session?.id]);

  useEffect(() => {
    function changed(event:StorageEvent) {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      refresh();
      if (!session || !persistent) return;
      try {
        const state = readWorkspace();
        if (!state.draft || state.draft.id !== session.id || state.draft.writerId !== writerId.current) {
          setSession(null);
          setMessage("This session was changed, submitted or deleted in another tab. Resume the saved session here if available.");
        }
      } catch (error) {setStorageIssue(errorText(error))}
    }
    window.addEventListener("storage",changed);
    return () => window.removeEventListener("storage",changed);
  },[session,persistent,refresh]);

  const finish = useCallback(() => {
    if (!session || submitting.current) return;
    submitting.current = true;
    const attempt = createAttempt(session.config,session.answers,session.questionIds,elapsedSeconds(session),session.id,session.bankVersion);
    if (persistent) {
      try {
        const state = readWorkspace();
        if (!state.draft || state.draft.id !== session.id || state.draft.writerId !== writerId.current) {
          setSession(null); refresh();
          setMessage("This session changed in another tab. Its saved state was kept.");
          return;
        }
      } catch (error) {setStorageIssue(errorText(error))}
    }
    const saved = persistent && saveAttempt(attempt,writerId.current);
    setReport(attempt); setSession(null);
    if (saved) {refresh(); setMessage("Attempt saved in this browser. Export your workspace for a portable backup.")}
    else setMessage("This result is in memory only. Download this attempt before leaving. The saved recovery session, if any, was kept.");
  },[session,persistent,refresh]);

  useEffect(() => {
    if (session && now >= session.startedAt + session.config.durationMinutes * 60_000) finish();
  },[now,session,finish]);

  function begin(memoryOnly = false) {
    try {
      const clean = validateConfig(config);
      const selected = buildTest(clean);
      if (!selected.length) throw new Error("No sample questions are available for this topic.");
      const startedAt = Date.now();
      const draft:Draft = {id:crypto.randomUUID(), writerId:writerId.current, bankVersion:BANK_VERSION, kind:BANK_KIND,
        config:clean,questionIds:selected.map(q => q.id),answers:{},marked:[],index:0,startedAt,updatedAt:startedAt};
      if (!memoryOnly) claimDraft(draft);
      setPersistent(!memoryOnly); setSession(draft); setReport(null); setNow(startedAt); submitting.current = false;
      setMessage(memoryOnly ? "Memory-only session: recovery and history are disabled. Download the result before leaving." : "Answers and review marks save on this device. The clock continues while this page is closed.");
    } catch (error) {setMessage(errorText(error)); refresh()}
  }

  function resume() {
    try {
      // Re-read on the click so an old recovery banner cannot revive a submitted test.
      const fresh = readWorkspace().draft;
      if (!fresh) throw new Error("There is no unfinished session to resume.");
      const claimed = claimDraft({...fresh,writerId:writerId.current,updatedAt:Math.max(Date.now(),fresh.startedAt)});
      setConfig(claimed.config); setPersistent(true); setSession(claimed); setReport(null); setNow(Date.now()); submitting.current = false;
      setMessage("Session resumed here. Time spent away counts toward the time limit; expired sessions submit automatically.");
    } catch (error) {setMessage(errorText(error)); refresh()}
  }

  function change(patch:Partial<Pick<Draft,"answers"|"marked"|"index">>) {
    if (!session) return;
    if (elapsedSeconds(session) >= session.config.durationMinutes * 60) {finish(); return}
    const updated = {...session,...patch,updatedAt:Math.max(Date.now(),session.startedAt)};
    if (persistent) {
      try {saveDraft(updated)} catch (error) {
        if (error instanceof DraftConflictError) {setSession(null);refresh();setMessage(error.message);return}
        setPersistent(false); setStorageIssue(`Autosave failed: ${errorText(error)}. Continue in memory and download your result before leaving.`);
      }
    }
    setSession(updated);
  }

  async function restore(file:File|undefined) {
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error("Backup must be smaller than 2 MB.");
      const count = importAttempts(await file.text()); refresh();
      setMessage(`Backup restored. ${count} completed attempts are available; reviews and unfinished sessions are included when present.`);
    } catch (error) {setMessage(errorText(error))}
  }

  function exportWorkspace(raw = false) {
    try {downloadJson(raw ? exportRawPractice() : exportAttempts(),raw ? "anvaya-raw-recovery.json" : "anvaya-workspace-backup.json")}
    catch (error) {setMessage(errorText(error))}
  }

  return <><a className="skip-link" href="#workspace">Skip to practice</a><main id="workspace" className="shell">
    <header className="head"><Brand/><nav className="row" aria-label="Practice navigation"><Link href="/">Workspace</Link><Link href="/review">Review & progress →</Link></nav></header>
    <section className="hero"><div className="tag">PRACTICE LAB · ILLUSTRATIVE BANK</div><h1>A little practice. A clearer next step.</h1>
      <p className="sub">Custom timed practice, saved responses and a path back to your mistakes. These six original examples are not PYQs or official-pattern mocks.</p></section>
    <p role="status" aria-live="polite" className={message ? "status" : ""}>{message}</p>
    {storageIssue && <aside className="notice section" role="alert"><p>{storageIssue}</p><button className="btn secondary" onClick={() => exportWorkspace(true)}>Download raw recovery data</button></aside>}

    {!session && !report && <>
      {recovery && <section className="panel recovery-banner section"><div><div className="tag">UNFINISHED SESSION</div><h2>Pick up where you left off.</h2><p>{recovery.questionIds.length} questions · {Object.keys(recovery.answers).length} answered. The original timer continues while you are away.</p></div>
        <div className="row"><button className="btn" onClick={resume}>Resume here</button><button className="btn secondary danger" onClick={() => {
          if (!window.confirm("Discard this unfinished session and its saved answers?")) return;
          try {discardDraft(recovery.id);refresh();setMessage("Unfinished session discarded.")} catch (error) {setMessage(errorText(error))}
        }}>Discard session</button></div></section>}
      <div className="grid"><section className="panel stack"><h2>Configure practice</h2>
        <label>Tracking context<select className="search" value={config.examId} onChange={e => setConfig(c => ({...c,examId:e.target.value}))}><option value="general">General practice</option>{exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
        <p className="tag">This label keeps your progress separate by exam. It does not change the sample bank into an exam-specific test.</p>
        <label>Question selection<select className="search" value={config.mode} onChange={e => setConfig(c => ({...c,mode:e.target.value as TestConfig["mode"]}))}><option value="mixed">Mixed subjects</option><option value="topic">One topic</option></select></label>
        {config.mode === "topic" && <label>Topic<select className="search" value={config.topic} onChange={e => setConfig(c => ({...c,topic:e.target.value}))}>{bankQuestions().map(q => <option key={q.id}>{q.topic}</option>)}</select></label>}
        <label>Question limit (this selection has {items.length} available)<input className="search" type="number" min="1" max="100" value={config.count} onChange={e => setConfig(c => ({...c,count:Number(e.target.value)}))}/></label>
        <label>Time limit in minutes<input className="search" type="number" min="1" max="240" value={config.durationMinutes} onChange={e => setConfig(c => ({...c,durationMinutes:Number(e.target.value)}))}/></label>
        <label>Marks for a correct response<input className="search" type="number" min=".01" max="100" step=".25" value={config.positive} onChange={e => setConfig(c => ({...c,positive:Number(e.target.value)}))}/></label>
        <label>Deduction for an incorrect response<input className="search" type="number" min="0" max="100" step=".25" value={config.negative} onChange={e => setConfig(c => ({...c,negative:Number(e.target.value)}))}/></label>
        <button className="btn" disabled={!ready || !!recovery || !!storageIssue} onClick={() => begin()}>Start test with recovery</button>
        <details><summary>Practise without browser storage</summary><p className="tag">Use a memory-only session if storage is blocked or you prefer not to save answers. Leaving the page loses the session.</p><button className="btn secondary" disabled={!ready} onClick={() => begin(true)}>Start without saving</button></details>
      </section>
      <section className="panel"><h2>Previous attempts</h2><p className="muted">Temporary browser storage. It is not encrypted, authenticated or synced across devices. Use a trusted device and keep a private backup.</p>
        {!ready ? <p>Loading saved history…</p> : !history.length ? <p>No completed attempts yet.</p> : <ol className="attempt-list">{history.map(attempt => <li key={attempt.id}><button className="history-button" onClick={() => {setReport(attempt);setMessage("Viewing a saved illustrative attempt.")}}><strong>{new Date(attempt.createdAt).toLocaleString()}</strong><span>{attempt.score} / {attempt.maxScore} points · {attempt.accuracy}% accuracy</span><span className="tag">{exams.find(e => e.id === attempt.config.examId)?.name ?? "General practice"} · Illustrative</span></button></li>)}</ol>}
        <div className="backup-controls"><button className="btn secondary" disabled={!ready || !!storageIssue} onClick={() => exportWorkspace()}>Export practice workspace</button>
          <label className="stack">Restore a backup<input type="file" accept=".json,application/json" disabled={!ready || !!storageIssue} onChange={e => {void restore(e.target.files?.[0]);e.target.value=""}}/></label>
          <p className="tag">Backups include answers, scores, unfinished sessions and review status. Files are processed locally; keep exported files private. Up to 50 completed attempts are retained.</p>
          <button className="btn secondary danger" disabled={!ready} onClick={() => {
            if (!window.confirm("Delete all Anvaya practice data from this browser, including unfinished sessions and review status? Export a backup first if needed.")) return;
            try {clearAttempts();setHistory([]);setRecovery(null);setStorageIssue("");setMessage("All practice data deleted from this browser.")} catch (error) {setMessage(errorText(error))}
          }}>Delete all practice data</button>
        </div></section></div>
    </>}

    {session && current && <>
      <div className="notice row"><strong>Question {session.index+1} / {items.length}</strong><strong role="timer" aria-label="Time remaining">{Math.floor((session.config.durationMinutes*60-elapsed)/60)}:{String((session.config.durationMinutes*60-elapsed)%60).padStart(2,"0")}</strong><span className="tag">{persistent ? "Saves on this device" : "Memory only"}</span></div>
      <div className="grid practice-grid section"><section className="panel"><div className="tag">{current.topic} · Original sample</div><h2>{current.stem}</h2>
        <div className="options">{current.choices.map((choice,i) => <button className={`option ${session.answers[current.id] === i ? "selected" : ""}`} aria-pressed={session.answers[current.id] === i} key={i} onClick={() => change({answers:{...session.answers,[current.id]:i}})}>{String.fromCharCode(65+i)}. {choice}</button>)}</div>
        <div className="row section"><button className="btn secondary" onClick={() => {const answers = {...session.answers};delete answers[current.id];change({answers})}}>Clear answer</button>
          <button className="btn secondary" aria-pressed={session.marked.includes(current.id)} onClick={() => change({marked:session.marked.includes(current.id) ? session.marked.filter(id => id !== current.id) : [...session.marked,current.id]})}>{session.marked.includes(current.id) ? "Unmark review" : "Mark for review"}</button></div>
        <div className="row"><button className="btn secondary" disabled={session.index === 0} onClick={() => change({index:session.index-1})}>Previous</button><button className="btn secondary" disabled={session.index === items.length-1} onClick={() => change({index:session.index+1})}>Next</button></div>
      </section><aside className="panel"><h3>Question palette</h3><div className="question-palette">{items.map((q,i) => <button key={q.id} className={`btn ${i === session.index ? "" : "secondary"}`} aria-current={i === session.index ? "step" : undefined} aria-label={`Question ${i+1}, ${session.answers[q.id] === undefined ? "unanswered" : "answered"}${session.marked.includes(q.id) ? ", marked for review" : ""}`} onClick={() => change({index:i})}>{i+1}{session.marked.includes(q.id) ? " ★" : session.answers[q.id] !== undefined ? " ✓" : ""}</button>)}</div>
        <p>Answered: {Object.keys(session.answers).length} · For review: {session.marked.length}</p>
        <button className="btn" onClick={() => {if (window.confirm("Submit this practice session? You cannot change submitted answers.")) finish()}}>Submit test</button>
        {persistent && <p><button className="btn secondary" onClick={() => {setSession(null);refresh();setMessage("Saved session left open. Its clock keeps running.")}}>Return to setup</button></p>}
      </aside></div>
    </>}

    {report && !session && <section><div className="row"><h2>Attempt report</h2><span className="pill">Illustrative · {report.bankVersion}</span></div>
      <div className="grid">{[["Score",`${report.score} / ${report.maxScore}`],["Correct",report.correct],["Incorrect",report.incorrect],["Unanswered",report.unanswered],["Accuracy",`${report.accuracy}%`],["Time",`${report.elapsedSeconds} seconds`]].map(([label,value]) => <div className="panel" key={label}><div className="tag">{label}</div><h2>{value}</h2></div>)}</div>
      {attemptQuestions(report).map((q,i) => <article className="panel section" key={q.id}><div className="tag">{q.topic} · {report.answers[q.id] === undefined ? "Unanswered" : report.answers[q.id] === q.correct ? "Correct" : "Incorrect"}</div><h3>{i+1}. {q.stem}</h3><p>Your response: {report.answers[q.id] === undefined ? "Not attempted" : q.choices[report.answers[q.id]]}</p><p>Correct answer: {q.choices[q.correct]}</p><p>{q.explanation}</p></article>)}
      <div className="row section"><button className="btn" onClick={() => {setReport(null);refresh()}}>Back to practice setup</button><Link className="btn secondary" href={`/review?exam=${encodeURIComponent(report.config.examId ?? "general")}`}>Review & progress</Link><button className="btn secondary" onClick={() => downloadJson(JSON.stringify({format:BACKUP_FORMAT,attempts:[report],draft:null,reviews:[],exportedAt:new Date().toISOString()},null,2),"anvaya-attempt.json")}>Download this attempt</button></div>
    </section>}
    <footer>Support: <a href="mailto:akbsupportinfo@gmail.com">akbsupportinfo@gmail.com</a> · Saved data stays in this browser. Export before clearing site data.</footer>
  </main></>;
}
