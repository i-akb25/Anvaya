"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StudyShell } from "../study-shell";
import {
  emptyVault,
  readVault,
  saveVault,
  type LearningVault,
} from "@/lib/platform/vault";
import { mistakeReasons, type SSCJournalEntry } from "@/lib/platform/ssc-study";
import { exams } from "@/lib/catalog";
import {
  examStudy,
  examDailyPlan,
  examMistakes,
  examSubjectProgress,
  examSubjects,
  withExamStudy,
  createExamRetry,
  type ExamStudy,
} from "@/lib/platform/exam-study";
import { practiceHandoffKey } from "@/lib/platform/practice-handoff";
import { QuestionFigure } from "./question-figure";
export function SSCStudyDesk() {
  return <ExamStudyDesk examId="ssc" />;
}
export function ExamStudyDesk({ examId }: { examId: string }) {
  const exam = exams.find((e) => e.id === examId)!,
    classroom = examId === "ssc" ? "/ssc-cgl" : `/classrooms/${examId}`;
  const subjects = examSubjects(examId);
  const [tab, setTab] = useState("plan");
  const [v, setV] = useState<LearningVault>(emptyVault()),
    [ready, setReady] = useState(false),
    [status, setStatus] = useState("");
  const [filter, setFilter] = useState("open"),
    [subject, setSubject] = useState("all"),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(0),
    [selected, setSelected] = useState<string[]>([]),
    [focus, setFocus] = useState("");
  useEffect(() => {
    try {
      setV(readVault());
      setReady(true);
      const query = new URLSearchParams(window.location.search);
      if (
        query.get("view") === "mistakes" ||
        window.location.hash === "#mistake-notebook"
      )
        setTab("mistakes");
      const id = query.get("question");
      if (id) {
        setFocus(id);
        setFilter("all");
        setTab("mistakes");
      }
    } catch (e) {
      setStatus((e as Error).message);
    }
  }, []);
  const settings = examStudy(v, examId),
    plan = examDailyPlan(v, examId),
    progress = examSubjectProgress(v, examId);
  const mistakes = examMistakes(v, examId).filter(
    (r) =>
      (filter === "all" ||
        (filter === "doubt"
          ? r.entry?.doubt
          : filter === "resolved"
            ? r.entry?.resolved
            : r.open)) &&
      (subject === "all" || r.question.topicId === subject) &&
      (!focus || r.question.id === focus) &&
      (r.question.stem + " " + (r.entry?.note ?? ""))
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(mistakes.length)),
    currentPage = Math.min(page, pages - 1),
    rows = mistakes.slice(currentPage, currentPage + 1);
  function persist(study: ExamStudy) {
    const next = saveVault(withExamStudy(v, examId, study), v.revision);
    setV(next);
    setStatus("Saved on this device. Included in your JSON workspace backup.");
  }
  function changeSettings(patch: Partial<ExamStudy>) {
    try {
      persist({ ...settings, ...patch });
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  function launch() {
    try {
      const current = readVault();
      if (current.revision !== v.revision)
        throw Error(
          "Workspace changed in another tab. Reload before retrying.",
        );
      const attempt = createExamRetry(
        current,
        examId,
        selected,
        crypto.randomUUID(),
        Date.now(),
      );
      setV(saveVault({ ...current, active: attempt }, current.revision));
      try {
        sessionStorage.setItem(
          practiceHandoffKey,
          JSON.stringify({
            id: attempt.id,
            writerId: attempt.writerId,
            examId,
          }),
        );
      } catch {}
      window.location.assign(`/assessments?exam=${examId}`);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  function resetFilters() {
    setPage(0);
    setSelected([]);
  }
  return (
    <StudyShell>
      <div className="breadcrumbs">
        <Link href={classroom}>{exam.name}</Link> / Study & mistakes
      </div>
      <div className="page-heading">
        <span className="eyebrow">A PLAN BUILT FROM YOUR WORK</span>
        <h1>Learn. Diagnose. Try again.</h1>
        <p>
          Your completed lessons, due recall and latest saved responses guide
          the next session. These signals describe practice, not exam readiness.
        </p>
      </div>
      <p role="status" aria-live="polite">
        {status}
      </p>
      <nav className="study-tabs" aria-label="Study desk sections">
        {[
          ["plan", "Next session"],
          ["progress", "Subject progress"],
          ["mistakes", "Mistake notebook"],
        ].map(([id, label]) => (
          <button
            className="button"
            key={id}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "plan" && (
        <section className="ssc-section" aria-labelledby="daily-plan-title">
          <h2 id="daily-plan-title">Your next study session</h2>
          <div className="library-toolbar">
            <label>
              Session budget
              <select
                disabled={!ready}
                value={settings.minutes}
                onChange={(e) =>
                  changeSettings({ minutes: Number(e.target.value) })
                }
              >
                {[20, 30, 45, 60, 90, 120, 180].map((n) => (
                  <option key={n} value={n}>
                    {n} minutes
                  </option>
                ))}
              </select>
            </label>
            <label>
              Study scope
              <select
                disabled={!ready}
                value={settings.section}
                onChange={(e) =>
                  changeSettings({
                    section: e.target.value,
                  })
                }
              >
                <option value={examId === "ssc" ? "common" : "all"}>
                  {examId === "ssc"
                    ? "Common papers"
                    : "All available subjects"}
                </option>
                {Object.entries(subjects).map(([id, title]) => (
                  <option key={id} value={id}>
                    {title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p>
            {plan.due} due recall lessons · {plan.missed} unresolved questions
            in this scope. Reading and drill times are planning estimates.
            Nothing is marked complete automatically.
          </p>
          <ol className="ssc-agenda">
            {plan.tasks.map((t, i) => (
              <li key={i}>
                <span>
                  {t.minutes} min · {t.kind}
                </span>
                <Link
                  href={t.href}
                  onClick={() => {
                    if (t.kind === "mistakes") setTab("mistakes");
                  }}
                >
                  {t.title} →
                </Link>
              </li>
            ))}
          </ol>
          {!plan.tasks.length && (
            <p>
              No remaining introductory lessons or eligible revisions in this
              scope. Revisit completed topics or choose another subject.
            </p>
          )}
          {!!plan.remaining && (
            <p className="small-copy">
              {plan.remaining} minutes left for notes, breaks or extra revision.
            </p>
          )}
          <div className="question-actions">
            <Link href={`/recall?exam=${examId}`}>Recall queue →</Link>
            <Link href="/account">Export or restore backup →</Link>
          </div>
        </section>
      )}
      {tab === "progress" && (
        <section className="ssc-section">
          <h2>Subject coverage and practice evidence</h2>
          <p>
            Latest response per question across the 30 retained attempts.
            Unanswered items are shown separately. Lesson completion does not
            certify full syllabus depth.
          </p>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Subject progress"
          >
            <table>
              <caption>Local study evidence</caption>
              <thead>
                <tr>
                  <th scope="col">Subject</th>
                  <th scope="col">Lessons completed</th>
                  <th scope="col">Bank size</th>
                  <th scope="col">Observed</th>
                  <th scope="col">Correct</th>
                  <th scope="col">Incorrect</th>
                  <th scope="col">Unanswered</th>
                </tr>
              </thead>
              <tbody>
                {progress.map((p) => (
                  <tr key={p.section}>
                    <th scope="row">{p.title}</th>
                    <td>
                      {p.completed}/{p.lessons}
                    </td>
                    <td>{p.questions}</td>
                    <td>{p.observed}</td>
                    <td>{p.correct}</td>
                    <td>{p.incorrect}</td>
                    <td>{p.unanswered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {tab === "mistakes" && (
        <section id="mistake-notebook" className="ssc-section">
          <h2>Question mistake notebook</h2>
          <p>
            Record why an answer failed and your correction. A key doubt is a
            private flag, not an expert correction or a message to anyone.
            Flagged questions are excluded from retries until you clear the
            doubt. Resolving a note never changes a saved score.
          </p>
          <div className="library-toolbar">
            <label>
              Show
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  resetFilters();
                }}
              >
                <option value="open">Needs revision</option>
                <option value="doubt">Key or explanation doubts</option>
                <option value="resolved">Manually resolved</option>
                <option value="all">All recorded questions</option>
              </select>
            </label>
            <label>
              Topic
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  resetFilters();
                }}
              >
                <option value="all">All topics</option>
                {[
                  ...new Set(
                    examMistakes(v, examId).map((r) => r.question.topicId),
                  ),
                ].map((id) => (
                  <option key={id} value={id}>
                    {id.replaceAll("-", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Search question or note
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetFilters();
                }}
              />
            </label>
          </div>
          {focus && (
            <button
              className="button"
              onClick={() => {
                setFocus("");
                resetFilters();
              }}
            >
              Show all notebook questions
            </button>
          )}
          <div className="question-actions">
            <button
              className="button primary"
              disabled={
                !ready ||
                !selected.length ||
                !!v.active ||
                !!v.personal?.active ||
                !!v.sscDest?.active
              }
              onClick={launch}
            >
              Retry selected ({selected.length}/20)
            </button>
            <button
              className="button"
              disabled={!selected.length}
              onClick={() => setSelected([])}
            >
              Clear selection
            </button>
            <button
              className="button"
              onClick={() =>
                setSelected(
                  mistakes
                    .filter((r) => r.open && !r.entry?.doubt)
                    .slice(0, 20)
                    .map((r) => r.question.id),
                )
              }
            >
              Select up to 20 matching unresolved questions
            </button>
          </div>
          <p className="small-copy">
            Custom retry: one minute per question,{" "}
            {examId === "ssc"
              ? "+2/−0.50"
              : "+1 correct; −0.25 wrong MCQ; 0 wrong MSQ/numeric"}
            , free navigation, deliberate reuse of selected questions. Not a
            full exam mock. A later correct response clears the automatic
            mistake signal; private notes remain.
          </p>
          {mistakes.length === 0 && (
            <div className="empty-state">
              <p>
                No matching questions. Finish a topic drill or full rehearsal,
                then return here to diagnose incorrect and unanswered items.
              </p>
              <Link href={classroom}>Open classroom →</Link>
            </div>
          )}
          {rows.map((r) => (
            <article className="panel ssc-journal" key={r.question.id}>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={selected.includes(r.question.id)}
                  disabled={
                    !r.open ||
                    !!r.entry?.doubt ||
                    (selected.length >= 20 && !selected.includes(r.question.id))
                  }
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, r.question.id]
                        : selected.filter((id) => id !== r.question.id),
                    )
                  }
                />
                Select for focused retry
              </label>
              <small>
                {r.question.id} · Latest: {r.response?.status ?? "note only"}
                {r.entry?.resolved ? " · Manually resolved" : ""}
              </small>
              <h3>{r.question.stem}</h3>
              {r.question.context && <p>{r.question.context}</p>}
              <QuestionFigure figure={r.question.figure} />
              <details>
                <summary>Reveal options, original key and explanation</summary>
                <ol>
                  {r.question.options?.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ol>
                <p>
                  Original key:{" "}
                  {r.question.type === "mcq"
                    ? `option ${Number(r.question.answer) + 1}`
                    : r.question.type === "msq"
                      ? (r.question.answer as number[])
                          .map((i) => `option ${i + 1}`)
                          .join(", ")
                      : `${(r.question.answer as { min: number; max: number }).min} to ${(r.question.answer as { min: number; max: number }).max}`}
                </p>
                <p>{r.question.explanation}</p>
                <p className="small-copy">
                  Original author-checked question. Independent expert review
                  pending.
                </p>
              </details>
              <JournalEditor
                key={r.question.id + ":" + (r.entry?.updatedAt ?? "new")}
                entry={r.entry}
                onSave={(entry) => {
                  const next = {
                    ...settings,
                    journal: { ...settings.journal, [r.question.id]: entry },
                  };
                  persist(next);
                  setSelected((ids) =>
                    ids.filter((id) => id !== r.question.id),
                  );
                }}
              />
              <Link href={`/courses/${r.question.topicId}?exam=${examId}`}>
                Relearn the concept →
              </Link>
            </article>
          ))}
          {pages > 1 && (
            <div className="question-actions">
              <button
                className="button"
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous question
              </button>
              <span>
                Page {currentPage + 1}/{pages} · {mistakes.length} questions
              </span>
              <button
                className="button"
                disabled={currentPage + 1 >= pages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next question
              </button>
            </div>
          )}
        </section>
      )}
    </StudyShell>
  );
}
function JournalEditor({
  entry,
  onSave,
}: {
  entry: SSCJournalEntry | undefined;
  onSave: (entry: SSCJournalEntry) => void;
}) {
  const [note, setNote] = useState(entry?.note ?? ""),
    [reason, setReason] = useState(entry?.reason ?? "unreviewed"),
    [doubt, setDoubt] = useState(entry?.doubt ?? false),
    [resolved, setResolved] = useState(entry?.resolved ?? false),
    [status, setStatus] = useState("");
  return (
    <form
      className="ssc-journal-form"
      onSubmit={(e) => {
        e.preventDefault();
        try {
          onSave({
            note,
            reason,
            doubt,
            resolved,
            updatedAt: new Date().toISOString(),
          });
          setStatus("Saved.");
        } catch (error) {
          setStatus((error as Error).message);
        }
      }}
    >
      <label>
        What went wrong?
        <select
          value={reason}
          onChange={(e) =>
            setReason(e.target.value as SSCJournalEntry["reason"])
          }
        >
          {mistakeReasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label>
        My correction or doubt
        <textarea
          maxLength={4000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write the rule you missed, your corrected working, or the exact point to verify."
        />
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          checked={doubt}
          onChange={(e) => setDoubt(e.target.checked)}
        />
        I doubt the key or explanation
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          checked={resolved}
          onChange={(e) => setResolved(e.target.checked)}
        />
        I have manually resolved this mistake
      </label>
      <button className="button" type="submit">
        Save question note
      </button>
      <p role="status">{status}</p>
    </form>
  );
}
