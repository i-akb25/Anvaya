"use client";
import { Pager } from "./pagination";
import { useEffect, useState } from "react";
import Link from "next/link";
import { exams } from "@/lib/catalog";
import { sourceFor } from "@/lib/platform/content";
import {
  examLessons,
  examQuestions,
  studyDeskUrl,
} from "@/lib/platform/exam-study";
import {
  emptyVault,
  readVault,
  type LearningVault,
} from "@/lib/platform/vault";
import { patterns } from "@/lib/platform/registry";
import { syllabusFor } from "@/lib/platform/syllabus";
import { lectureTopics } from "@/lib/platform/lectures";
import { evaluate } from "@/lib/platform/engine";
import { StudyShell } from "../study-shell";
export function ExamClassroom({ examId }: { examId: string }) {
  const exam = exams.find((e) => e.id === examId)!,
    units = examLessons(examId),
    questions = examQuestions(examId),
    papers = patterns.filter((p) => p.examId === examId);
  const [v, setV] = useState<LearningVault>(emptyVault()),
    [status, setStatus] = useState(""),
    [tab, setTab] = useState("overview"),
    [subject, setSubject] = useState("all"),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(0),
    [paper, setPaper] = useState(papers[0]?.id ?? ""),
    [source, setSource] = useState(units[0]?.sourceId ?? "");
  useEffect(() => {
    try {
      setV(readVault());
    } catch (e) {
      setStatus((e as Error).message);
    }
  }, []);
  const rows = units.filter(
      (u) =>
        (subject === "all" || u.subject === subject) &&
        (u.title + " " + u.objective)
          .toLowerCase()
          .includes(search.toLowerCase()),
    ),
    pages = Math.max(1, Math.ceil(rows.length / 6)),
    currentPage = Math.min(page, pages - 1),
    next = units.find((u) => !v.completed.includes(`${examId}:${u.slug}`)),
    completed = units.filter((u) =>
      v.completed.includes(`${examId}:${u.slug}`),
    ).length;
  const latest = v.attempts.find((a) => a.examId === examId),
    p = papers.find((p) => p.id === paper),
    sourceIds = [...new Set(units.map((u) => u.sourceId))],
    reading = sourceIds.includes(source) ? sourceFor(source) : null;
  return (
    <StudyShell>
      <div className="breadcrumbs">
        <Link href="/classrooms">Classrooms</Link> / {exam.name}
      </div>
      <div className="page-heading">
        <span className="eyebrow">{exam.group} · PERSONAL LEARNING PATH</span>
        <h1>{exam.name}</h1>
        <p>
          Read a worked lesson, apply it, then revisit your mistakes. This path
          currently contains {units.length} foundation lessons and{" "}
          {questions.length} original questions. Full curriculum depth and
          independent review are unfinished.
        </p>
      </div>
      <nav className="study-tabs" aria-label="Classroom sections">
        {[
          ["overview", "Overview"],
          ["lessons", "Lessons"],
          ["practice", "Practice"],
          ["sources", "Sources & rules"],
        ].map(([id, label]) => (
          <button
            key={id}
            className="button"
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <p role="status">{status}</p>
      {tab === "overview" && (
        <section className="ssc-section">
          <h2>Your next step</h2>
          <div className="ssc-topic-grid">
            <article className="panel">
              <h3>{next?.title ?? "Revisit your completed lessons"}</h3>
              <p>
                {completed}/{units.length} lessons marked complete in this exam
                context. Shared lessons keep separate notes and completion for
                each exam.
              </p>
              <Link
                className="button primary"
                href={
                  next
                    ? `/courses/${next.slug}?exam=${examId}`
                    : `/recall?exam=${examId}`
                }
              >
                {next ? "Continue learning" : "Open recall"} →
              </Link>
            </article>
            <article className="panel">
              <h3>Plan and diagnose</h3>
              <p>
                Choose your session budget, check subject progress and retry
                selected mistakes. Key doubts stay private and are excluded from
                focused retries.
              </p>
              <Link className="button" href={studyDeskUrl(examId)}>
                Study plan & mistake notebook →
              </Link>
            </article>
          </div>
          {(v.active || v.personal?.active || v.sscDest?.active) && (
            <div className="panel">
              <h3>A timed session is already active</h3>
              <p>
                Its deadline keeps running. Finish it before starting another.
              </p>
              <Link
                href={
                  v.sscDest?.active
                    ? "/ssc-cgl/dest"
                    : v.personal?.active
                      ? "/my-practice"
                      : "/assessments"
                }
              >
                Resume timed session →
              </Link>
            </div>
          )}
          {latest && (
            <div className="panel">
              <h3>Latest saved practice</h3>
              <p>
                {evaluate(latest).score.toFixed(2)} / {evaluate(latest).maximum}{" "}
                practice marks · {evaluate(latest).right} correct ·{" "}
                {evaluate(latest).wrong} incorrect · {evaluate(latest).skipped}{" "}
                unanswered.
              </p>
              <Link href="/results">Review saved results →</Link>
            </div>
          )}
        </section>
      )}
      {tab === "lessons" && (
        <section className="ssc-section">
          <h2 id="lesson-page-start" tabIndex={-1}>
            Learn by subject
          </h2>
          <div className="library-toolbar">
            <label>
              Subject
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setPage(0);
                }}
              >
                <option value="all">All available subjects</option>
                {[...new Set(units.map((u) => u.subject))].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Find a lesson
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search title or learning objective"
              />
            </label>
          </div>
          <div className="ssc-topic-grid">
            {rows.slice(currentPage * 6, currentPage * 6 + 6).map((u) => {
              const count = questions.filter(
                  (q) => q.topicId === u.slug,
                ).length,
                lecture = lectureTopics.find((t) => t.lessonSlug === u.slug);
              return (
                <article className="ssc-topic-card" key={u.slug}>
                  <span className="eyebrow">{u.subject}</span>
                  <h3>{u.title}</h3>
                  <p>{u.objective}</p>
                  <small>
                    {u.minutes} min estimate · {count} original questions ·{" "}
                    {v.completed.includes(`${examId}:${u.slug}`)
                      ? "Completed"
                      : "Ready to learn"}
                  </small>
                  <div className="question-actions">
                    <Link
                      className="button primary"
                      href={`/courses/${u.slug}?exam=${examId}`}
                    >
                      Read lesson →
                    </Link>
                    <Link href={`/assessments?exam=${examId}&topic=${u.slug}`}>
                      Topic drill →
                    </Link>
                    {lecture && (
                      <Link href={`/lectures/${lecture.id}?exam=${examId}`}>
                        {lecture.resourceIds.length
                          ? "Supporting lectures"
                          : "Reading & media status"}{" "}
                        →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          {!rows.length && <p>No matching lessons. Change your filters.</p>}
          <Pager
            page={currentPage}
            pages={pages}
            total={rows.length}
            onPage={setPage}
          />
        </section>
      )}
      {tab === "practice" && (
        <section className="ssc-section">
          <h2>Apply what you learned</h2>
          <div className="ssc-topic-grid">
            <article className="panel">
              <h3>Topic drills</h3>
              <p>
                Choose a taught topic and configure timing and scoring. Formats
                vary by lesson: MCQ, exact-set MSQ or numeric entry. These are
                original exercises, not authenticated PYQs.
              </p>
              <Link
                className="button primary"
                href={`/assessments?exam=${examId}`}
              >
                Build a topic practice →
              </Link>
            </article>
            <article className="panel">
              <h3>Your own sections</h3>
              <p>
                Use the custom section builder to choose counts, durations,
                scoring and navigation. A short bank is never padded with
                repeats within one paper.
              </p>
              <Link className="button" href={`/mocks?exam=${examId}`}>
                Build sectional practice →
              </Link>
            </article>
          </div>
          <div className="question-actions">
            <Link href={studyDeskUrl(examId) + "?view=mistakes"}>
              Retry your mistakes →
            </Link>
            <Link href={`/my-practice?exam=${examId}`}>
              Use your permitted question packs →
            </Link>
            <Link href="/writing">Descriptive practice →</Link>
          </div>
          <p className="small-copy">
            The custom builder does not reproduce a certified full examination.
            Current-cycle instructions, complete reviewed question pools,
            official paper/key provenance and applicable accommodations need
            separate verification.
          </p>
        </section>
      )}
      {tab === "sources" && (
        <section className="ssc-section">
          <h2>Sources, scope and paper references</h2>
          <div className="library-toolbar">
            <label>
              Paper reference
              <select value={paper} onChange={(e) => setPaper(e.target.value)}>
                {papers.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.title} · {p.cycle}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {p && (
            <div className="panel">
              <h3>{p.title}</h3>
              <p>
                Recorded check: {p.checkedOn} · {p.status}. This is a reference
                baseline, not confirmation that every current instruction has
                been verified.
              </p>
              <a href={p.sourceUrl} target="_blank" rel="noreferrer">
                Authority reference ↗
              </a>
              <ul>
                {p.unresolved.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          <p>
            {syllabusFor(examId).length} stage/subject outline rows are
            available. An outline row is not a fully taught chapter. No
            last-five-year frequency ranking or official percentile is inferred
            from the original bank.
          </p>
          <div className="question-actions">
            <Link href={`/syllabus?exam=${examId}`}>Syllabus & coverage →</Link>
            <a href={exam.official} target="_blank" rel="noreferrer">
              Official portal ↗
            </a>
          </div>
          <label className="source-select">
            Concept reading source
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              {sourceIds.map((id) => (
                <option value={id} key={id}>
                  {sourceFor(id).title}
                </option>
              ))}
            </select>
          </label>
          {reading && (
            <article className="panel">
              <h3>{reading.title}</h3>
              <p>
                {reading.publisher} · link record checked {reading.checkedOn}
              </p>
              <p>{reading.licenseNote}</p>
              <a href={reading.url} target="_blank" rel="noreferrer">
                Read at publisher ↗
              </a>
            </article>
          )}
        </section>
      )}
    </StudyShell>
  );
}
export function ClassroomDirectory() {
  const [group, setGroup] = useState("all");
  const rows = exams.filter((e) => group === "all" || e.group === group);
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">TEN EXAM PATHS</span>
        <h1>Choose your classroom.</h1>
        <p>
          Each path connects available lessons, drills, recall, private question
          notes and source references. Coverage varies by exam.
        </p>
      </div>
      <div className="library-toolbar">
        <label>
          Exam group
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="all">All groups</option>
            {[...new Set(exams.map((e) => e.group))].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="classroom-directory">
        {rows.map((e) => (
          <Link
            key={e.id}
            className="classroom-row"
            href={e.id === "ssc" ? "/ssc-cgl" : `/classrooms/${e.id}`}
          >
            <strong>{e.name}</strong>
            <span>
              {examLessons(e.id).length} lessons · {examQuestions(e.id).length}{" "}
              original exercises
            </span>
            <span>Open →</span>
          </Link>
        ))}
      </div>
    </StudyShell>
  );
}
