"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { exams } from "@/lib/catalog";
import {
  emptyVault,
  readVault,
  saveVault,
  type LearningVault,
} from "@/lib/platform/vault";
import {
  recallQueue,
  rateRecall,
  type RecallRating,
} from "@/lib/platform/recall";
import { sourceFor } from "@/lib/platform/content";
import { StudyShell } from "../study-shell";
export function RecallDesk() {
  const [vault, setVault] = useState<LearningVault>(emptyVault());
  const [ready, setReady] = useState(false),
    [exam, setExam] = useState("all"),
    [dueOnly, setDueOnly] = useState(true);
  const [selected, setSelected] = useState(""),
    [revealed, setRevealed] = useState(false),
    [response, setResponse] = useState(""),
    [status, setStatus] = useState("");
  useEffect(() => {
    const context = new URLSearchParams(location.search).get("exam");
    if (exams.some((e) => e.id === context)) setExam(context!);
    try {
      setVault(readVault());
      setReady(true);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }, []);
  const queue = recallQueue(vault, exam, dueOnly),
    card = queue.find((r) => r.key === selected) ?? queue[0];
  function reset() {
    setRevealed(false);
    setResponse("");
  }
  function rate(rating: RecallRating) {
    if (!ready || !revealed || !card) return;
    try {
      const next = saveVault(
        rateRecall(vault, card.key, rating),
        vault.revision,
      );
      setVault(next);
      setStatus(`Saved. Next review: ${next.revisionDue[card.key]}.`);
      const remaining = recallQueue(next, exam, dueOnly).filter(
        (r) => r.key !== card.key,
      );
      setSelected(remaining[0]?.key ?? "");
      reset();
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">RETRIEVE BEFORE YOU REREAD</span>
        <h1>Recall your learning.</h1>
        <p>
          Explain a completed unit from memory, reveal the reference, then rate
          your recall. Ratings schedule fixed reviews: Again tomorrow, Hard in 3
          days, Good in 7 days. This is a personal study schedule, not an
          exam-readiness score.
        </p>
      </div>
      <div className="filter-bar">
        <label>
          Exam context
          <select
            value={exam}
            disabled={!ready}
            onChange={(e) => {
              setExam(e.target.value);
              setSelected("");
              reset();
            }}
          >
            <option value="all">All exams</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={dueOnly}
            disabled={!ready}
            onChange={(e) => {
              setDueOnly(e.target.checked);
              setSelected("");
              reset();
            }}
          />{" "}
          Due only
        </label>
      </div>
      {!ready ? (
        <p role="status">{status || "Loading saved learning…"}</p>
      ) : !card ? (
        <div className="empty-state">
          <h2>No cards {dueOnly ? "due" : "completed"} in this selection.</h2>
          <p>
            Complete a lesson to create a recall card. Turn off “Due only” to
            revise early.
          </p>
          <Link className="button primary" href="/courses">
            Open learning library →
          </Link>
        </div>
      ) : (
        <div className="lesson-layout">
          <section className="learning-article panel">
            <label>
              Choose a completed unit
              <select
                value={card.key}
                onChange={(e) => {
                  setSelected(e.target.value);
                  reset();
                }}
              >
                {queue.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.examId} · {r.unit.title} · {r.due}
                  </option>
                ))}
              </select>
            </label>
            <p className="eyebrow">
              {card.examId} · {queue.length} {dueOnly ? "due" : "available"} ·
              scheduled {card.due}
            </p>
            <h2>{card.unit.title}</h2>
            <p>{card.unit.objective}</p>
            <ul>
              {card.unit.recall.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <label>
              Explain it in your own words
              <textarea
                value={response}
                maxLength={10000}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Try without opening your notes. This scratch answer is not saved or graded."
              />
            </label>
            <p className="small-copy">
              Your scratch answer clears when you change cards. Compare it
              yourself; no automatic grading.
            </p>
            {!revealed ? (
              <button
                className="button primary"
                onClick={() => setRevealed(true)}
              >
                Reveal & compare
              </button>
            ) : (
              <div className="worked-example">
                <h3>Reference explanation</h3>
                {card.unit.concepts.map((c) => (
                  <p key={c.title}>
                    <strong>{c.title}: </strong>
                    {c.text}
                  </p>
                ))}
                <h3>Worked check</h3>
                <p>{card.unit.example.problem}</p>
                <ol>
                  {card.unit.example.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <strong>{card.unit.example.answer}</strong>
                <p>A mistake to catch: {card.unit.mistake}</p>
                <p>
                  AI-authored, source-checked foundation content; no independent
                  human review claimed.
                </p>
                <a
                  href={sourceFor(card.unit.sourceId).url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read the primary source ↗
                </a>
                <h3>How well did you recall it?</h3>
                <div className="question-actions">
                  <button className="button" onClick={() => rate("again")}>
                    Again · 1 day
                  </button>
                  <button className="button" onClick={() => rate("hard")}>
                    Hard · 3 days
                  </button>
                  <button
                    className="button primary"
                    onClick={() => rate("good")}
                  >
                    Good · 7 days
                  </button>
                </div>
              </div>
            )}
          </section>
          <aside className="learning-sidebar">
            <div className="panel">
              <h2>Your saved explanation</h2>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {revealed
                  ? vault.notes[card.key] ||
                    "No personal note saved for this context."
                  : "Reveal the reference to compare your saved note."}
              </p>
              <Link href={`/courses/${card.unit.slug}?exam=${card.examId}`}>
                Revisit lesson →
              </Link>
              <p>
                Notes, ratings and revision dates stay in this browser and are
                included in study backups.
              </p>
              <Link href="/account">Back up study data →</Link>
            </div>
          </aside>
        </div>
      )}
      {ready && (
        <p role="status" aria-live="polite">
          {status}
        </p>
      )}
      <Link href="/results">Results & missed concepts →</Link>
    </StudyShell>
  );
}
