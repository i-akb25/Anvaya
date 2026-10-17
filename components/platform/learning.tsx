"use client";
import { afterDays } from "@/lib/platform/recall";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Search, Check } from "lucide-react";
import { studyUnits, sourceFor, type StudyUnit } from "@/lib/platform/content";
import {
  emptyVault,
  readVault,
  saveVault,
  type LearningVault,
} from "@/lib/platform/vault";
import { exams } from "@/lib/catalog";
import { StudyShell } from "../study-shell";
export function CourseLibrary() {
  const [q, setQ] = useState(""),
    [exam, setExam] = useState("all");
  const rows = studyUnits.filter(
    (u) =>
      (exam === "all" || u.exams.includes(exam)) &&
      (u.title + u.subject).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">UNDERSTAND · APPLY · RECALL</span>
        <h1>
          Learn the idea.
          <br />
          Then put it to work.
        </h1>
        <p>
          Source-linked foundation units with original worked examples, recall
          prompts and practice. Check levels appear in each AI-authored lesson:
          source-checked foundations or syllabus-linked essentials. Independent
          human editorial review is pending.
        </p>
      </div>
      <div className="question-actions">
        <Link href="/ssc-cgl">SSC CGL study path →</Link>
        <Link href="/lectures">Browse topic-wise lectures →</Link>
        <Link href="/coverage">Inspect content coverage →</Link>
      </div>
      <div className="library-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a concept…"
            aria-label="Search study units"
          />
        </label>
        <select
          aria-label="Filter by exam"
          value={exam}
          onChange={(e) => setExam(e.target.value)}
        >
          <option value="all">All exam contexts</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
      <div className="paper-grid">
        {rows.map((u) => (
          <article className="paper-card" key={u.slug}>
            <BookOpen />
            <span className="eyebrow">
              {u.subject} · {u.minutes} MIN
            </span>
            <h2>{u.title}</h2>
            <p>{u.objective}</p>
            <small className="muted">
              {sourceFor(u.sourceId).publisher} source · Original examples
            </small>
            <div className="paper-actions">
              <Link
                className="button primary"
                href={`/courses/${u.slug}${exam !== "all" ? `?exam=${exam}` : ""}`}
              >
                Start learning <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!rows.length && (
        <p className="empty-state">
          No matching unit. More subject coverage is still being reviewed.
        </p>
      )}
      <div className="editorial-band">
        <h2>Coverage, without inflated counts.</h2>
        <p>
          {studyUnits.length} foundation units are available. Complete exam
          curricula, GS/Bihar-specific lessons and advanced engineering units
          remain incomplete. Check the syllabus map before planning coverage.
        </p>
        <Link href="/syllabus">Open exam and syllabus registry →</Link>
      </div>
    </StudyShell>
  );
}
export function UnitReader({ unit }: { unit: StudyUnit }) {
  const [exam, setExam] = useState(unit.exams[0]),
    [vault, setVault] = useState<LearningVault>(emptyVault()),
    [note, setNote] = useState(""),
    [status, setStatus] = useState(""),
    [ready, setReady] = useState(false);
  const source = sourceFor(unit.sourceId),
    key = `${exam}:${unit.slug}`;
  useEffect(() => {
    const query = new URLSearchParams(location.search).get("exam"),
      selected = query && unit.exams.includes(query) ? query : unit.exams[0];
    setExam(selected);
    try {
      const v = readVault();
      setVault(v);
      setNote(v.notes[`${selected}:${unit.slug}`] ?? "");
      setReady(true);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }, [unit]);
  function choose(value: string) {
    if (
      note !== (vault.notes[key] ?? "") &&
      !window.confirm("Leave this exam context without saving your note?")
    )
      return;
    setExam(value);
    setNote(vault.notes[`${value}:${unit.slug}`] ?? "");
  }
  function persist(complete = false) {
    try {
      const next = {
        ...vault,
        notes: { ...vault.notes, [key]: note },
        completed: complete
          ? [...new Set([...vault.completed, key])]
          : vault.completed,
        revisionDue: complete
          ? {
              ...vault.revisionDue,
              [key]: afterDays(1),
            }
          : vault.revisionDue,
      };
      setVault(saveVault(next, vault.revision));
      setStatus(
        complete
          ? "Completed. Recall revision scheduled for tomorrow."
          : "Notes saved on this device.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  return (
    <StudyShell>
      <div className="breadcrumbs">
        <Link href={unit.slug.startsWith("ssc-") ? "/ssc-cgl" : "/courses"}>
          {unit.slug.startsWith("ssc-")
            ? "SSC CGL classroom"
            : "Learning library"}
        </Link>{" "}
        / {unit.subject}
      </div>
      <div className="lesson-layout">
        <article className="learning-article">
          <span className="eyebrow">{unit.minutes} MIN · FOUNDATION STUDY</span>
          <h1>{unit.title}</h1>
          <p className="unit-objective">{unit.objective}</p>
          <div className="content-provenance">
            <strong>
              {unit.status === "source-checked"
                ? "Source-checked"
                : "Syllabus-linked"}{" "}
              · AI-authored · Original examples
            </strong>
            <p>{unit.review}</p>
            <a href={source.url} target="_blank" rel="noreferrer">
              Read {source.title} ↗
            </a>
            <small>
              Checked {source.checkedOn} · Version {unit.version}
            </small>
          </div>
          <section className="lesson-section lecture-lesson-invite">
            <h2>Topic resources</h2>
            <p>
              Check publisher-linked lecture availability and keep topic notes.
              Some topics are awaiting video curation.
            </p>
            <Link
              className="button"
              href={`/lectures/${unit.slug}?exam=${exam}`}
              onClick={(e) => {
                if (
                  note !== (vault.notes[key] ?? "") &&
                  !window.confirm("Leave without saving your lesson note?")
                )
                  e.preventDefault();
              }}
            >
              Open topic resources →
            </Link>
          </section>
          {unit.concepts.map((c, i) => (
            <section className="lesson-section" key={c.title}>
              <span className="eyebrow">IDEA {i + 1}</span>
              <h2>{c.title}</h2>
              <p>{c.text}</p>
            </section>
          ))}
          <section className="worked-example">
            <span className="eyebrow">WORK THROUGH IT</span>
            <h2>Original worked example</h2>
            <p>{unit.example.problem}</p>
            <ol>
              {unit.example.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <strong>{unit.example.answer}</strong>
          </section>
          <section className="lesson-section">
            <h2>A mistake to catch</h2>
            <p>{unit.mistake}</p>
          </section>
          <section className="lesson-section">
            <h2>Close the page. Explain it.</h2>
            <ul>
              {unit.recall.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p>
              Try answering without the notes, then return to the source for any
              gap.
            </p>
          </section>
          <Link
            className="button primary"
            href={`/assessments?topic=${unit.slug}&exam=${exam}`}
          >
            Practise this concept →
          </Link>
        </article>
        <aside className="learning-sidebar">
          <div className="panel">
            <label>
              Exam context
              <select value={exam} onChange={(e) => choose(e.target.value)}>
                {unit.exams.map((id) => (
                  <option key={id} value={id}>
                    {exams.find((e) => e.id === id)?.name}
                  </option>
                ))}
              </select>
            </label>
            <p>Shared concept, separate notes and completion for each exam.</p>
            <label htmlFor="unit-note">My explanation</label>
            <textarea
              disabled={!ready}
              id="unit-note"
              value={note}
              maxLength={100000}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain this in your own words…"
            />
            <button
              disabled={!ready}
              className="button"
              onClick={() => persist()}
            >
              Save notes
            </button>
            <button
              disabled={!ready}
              className="button primary"
              onClick={() => persist(true)}
            >
              <Check size={16} />
              {vault.completed.includes(key)
                ? "Completed · revise tomorrow"
                : "Complete & schedule recall"}
            </button>
            <p role="status">{status}</p>
            <Link href={`/recall?exam=${exam}`}>Practise recall →</Link>
            <Link href="/account">Back up or sync this workspace →</Link>
          </div>
        </aside>
      </div>
    </StudyShell>
  );
}
