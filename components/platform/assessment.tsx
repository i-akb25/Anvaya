"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { exams } from "@/lib/catalog";
import { studyUnits } from "@/lib/platform/content";
import { practiceQuestions, questionSource } from "@/lib/platform/questions";
import {
  answer,
  blank,
  createPractice,
  deadline,
  editable,
  evaluate,
  submit,
  type PracticeAttempt,
  type Response,
} from "@/lib/platform/engine";
import {
  addResult,
  seenQuestions,
  emptyVault,
  readVault,
  saveVault,
  type LearningVault,
} from "@/lib/platform/vault";
import { StudyShell } from "../study-shell";
function keyLabel(q: PracticeAttempt["items"][number]["question"]) {
  if (q.type === "mcq") return q.options![Number(q.answer)];
  if (q.type === "msq")
    return (q.answer as number[]).map((i) => q.options![i]).join("; ");
  const a = q.answer as { min: number; max: number };
  return a.min === a.max ? String(a.min) : `${a.min} to ${a.max} (inclusive)`;
}
function NumericInput({
  value,
  disabled,
  onValid,
}: {
  value: string;
  disabled: boolean;
  onValid: (v: string) => void;
}) {
  const [buffer, setBuffer] = useState(value);
  return (
    <label className="numeric-response">
      Numerical answer
      <input
        type="text"
        inputMode="decimal"
        disabled={disabled}
        value={buffer}
        onChange={(e) => {
          const raw = e.target.value;
          if (
            raw.length > 100 ||
            !/^[-+]?(?:\d*(?:\.\d*)?)(?:[eE][-+]?\d*)?$/.test(raw)
          )
            return;
          setBuffer(raw);
          if (
            raw === "" ||
            (Number.isFinite(Number(raw)) && !["-", "+", "."].includes(raw))
          )
            onValid(raw);
          else onValid("");
        }}
      />
      <small>
        Use a decimal number. Incomplete input is not saved as an answer.
        Accepted ranges appear after submission.
      </small>
    </label>
  );
}
export function AssessmentDesk() {
  const [vault, setVault] = useState<LearningVault>(emptyVault()),
    [ready, setReady] = useState(false),
    [writer, setWriter] = useState(""),
    [exam, setExam] = useState("upsc"),
    [topic, setTopic] = useState("all"),
    [count, setCount] = useState(4),
    [minutes, setMinutes] = useState(10),
    [positive, setPositive] = useState(1),
    [penalty, setPenalty] = useState(0),
    [repeat, setRepeat] = useState(false),
    [now, setNow] = useState(0),
    [index, setIndex] = useState(0),
    [status, setStatus] = useState(""),
    [result, setResult] = useState<PracticeAttempt | null>(null);
  useEffect(() => {
    setWriter(crypto.randomUUID());
    const q = new URLSearchParams(location.search);
    if (studyUnits.some((u) => u.slug === q.get("topic"))) {
      const selected = q.get("topic")!;
      setTopic(selected);
      setCount(
        Math.min(
          4,
          practiceQuestions.filter((question) => question.topicId === selected)
            .length,
        ),
      );
    }
    if (exams.some((e) => e.id === q.get("exam"))) setExam(q.get("exam")!);
    try {
      setVault(readVault());
      setReady(true);
    } catch (e) {
      setStatus((e as Error).message);
    }
    setNow(Date.now());
    const clock = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(clock);
  }, []);
  const active = vault.active;
  function persist(next: LearningVault) {
    try {
      const saved = saveVault(next, vault.revision);
      setVault(saved);
      setStatus("");
      return true;
    } catch (e) {
      setStatus((e as Error).message);
      return false;
    }
  }
  function finish() {
    if (!active) return;
    const result = submit(active, Date.now());
    if (persist(addResult(vault, result))) {
      setResult(result);
      setIndex(0);
    }
  }
  useEffect(() => {
    if (active && now >= deadline(active)) finish();
  }, [now, active]);
  const availableTopics = studyUnits.filter((u) => u.exams.includes(exam)),
    topicIds = availableTopics
      .filter((u) => topic === "all" || u.slug === topic)
      .map((u) => u.slug),
    seen = seenQuestions(vault, exam),
    available = practiceQuestions.filter(
      (q) => topicIds.includes(q.topicId) && (repeat || !seen.includes(q.id)),
    ).length;
  function start() {
    try {
      const a = createPractice({
        examId: exam,
        topicIds,
        count,
        seconds: Math.round(minutes * 60),
        correct: positive,
        penalty,
        seen,
        allowRepeats: repeat,
        writerId: writer,
        now: Date.now(),
      });
      if (persist({ ...vault, active: a })) {
        setResult(null);
        setIndex(0);
      }
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  function respond(value: Response) {
    if (!active || active.writerId !== writer) return;
    try {
      const latest = readVault();
      if (latest.active?.writerId !== writer) {
        setStatus("Another tab took over. Reload before continuing.");
        return;
      }
      const item = active.items[index];
      persist({
        ...vault,
        active: answer(active, item.question.id, value, Date.now()),
      });
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  const item = active?.items[index],
    owned = active?.writerId === writer;
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">APPLY WHAT YOU LEARNED</span>
        <h1>
          {active ? "Stay with the problem." : "Practice with a clear purpose."}
        </h1>
        <p>
          Custom foundation practice using original, AI-authored questions with
          calculation/source checks. Not a PYQ bank, official mock or
          difficulty-calibrated exam paper. Independent human review is pending.
        </p>
        <Link href="/syllabus">View official-pattern readiness →</Link>
      </div>
      {!active && !result && (
        <div className="practice-builder">
          <label>
            Exam context
            <select
              value={exam}
              onChange={(e) => {
                setExam(e.target.value);
                setTopic("all");
              }}
            >
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Concept
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="all">All available concepts</option>
              {availableTopics.map((u) => (
                <option key={u.slug} value={u.slug}>
                  {u.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Question count
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>
          <label>
            Minutes
            <input
              type="number"
              min={1}
              max={180}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </label>
          <label>
            Marks per correct answer
            <input
              type="number"
              min={0.1}
              max={10}
              step={0.1}
              value={positive}
              onChange={(e) => setPositive(Number(e.target.value))}
            />
          </label>
          <label>
            Penalty per wrong MCQ
            <input
              type="number"
              min={0}
              max={10}
              step={0.01}
              value={penalty}
              onChange={(e) => setPenalty(Number(e.target.value))}
            />
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
            />{" "}
            Allow questions seen in earlier attempts
          </label>
          <p>
            {available} {repeat ? "available" : "unseen"} questions match. No
            question is repeated within an attempt. MSQ/NAT/TITA have zero
            wrong-answer penalty; MSQ uses exact-set matching.
          </p>
          <button disabled={!ready} className="button primary" onClick={start}>
            Start custom practice →
          </button>
        </div>
      )}
      {active && item && (
        <>
          <div className="attempt-toolbar">
            <span>
              {exams.find((e) => e.id === active.examId)?.name} · Custom
              practice
            </span>
            <strong role="timer" aria-label="Remaining time">
              {Math.floor(Math.max(0, deadline(active) - now) / 60000)}:
              {String(
                Math.floor(Math.max(0, deadline(active) - now) / 1000) % 60,
              ).padStart(2, "0")}
            </strong>
            <span>
              {
                active.items.filter(
                  (i) => !blank(active.answers[i.question.id]),
                ).length
              }
              /{active.items.length} answered
            </span>
          </div>
          {!owned && (
            <div className="panel">
              <p>
                This attempt belongs to another tab or a previous browser
                session. Taking over prevents its older copy from saving further
                responses.
              </p>
              <button
                className="button"
                onClick={() => {
                  try {
                    const latest = readVault();
                    if (latest.active?.id !== active.id)
                      throw Error("The attempt changed. Reload first.");
                    const saved = saveVault(
                      {
                        ...latest,
                        active: { ...latest.active, writerId: writer },
                      },
                      latest.revision,
                    );
                    setVault(saved);
                  } catch (e) {
                    setStatus((e as Error).message);
                  }
                }}
              >
                Take over this attempt
              </button>
            </div>
          )}
          <div className="attempt-layout">
            <article className="question-surface">
              <span className="eyebrow">
                QUESTION {index + 1} / {active.items.length} ·{" "}
                {item.question.type.toUpperCase()}
              </span>
              {item.question.context && (
                <div className="question-context">{item.question.context}</div>
              )}
              <h2>{item.question.stem}</h2>
              <p className="small-copy">
                +{item.marking.correct} correct ·{" "}
                {item.question.type === "mcq"
                  ? `−${item.marking.mcqPenalty} wrong`
                  : "No negative marking"}
              </p>
              {item.question.type === "mcq" ? (
                <div className="answer-options">
                  {item.question.options!.map((option, i) => (
                    <label key={i}>
                      <input
                        disabled={
                          !owned || !editable(active, item.question.id, now)
                        }
                        type="radio"
                        name={item.question.id}
                        checked={active.answers[item.question.id] === String(i)}
                        onChange={() => respond(String(i))}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : item.question.type === "msq" ? (
                <div className="answer-options">
                  {item.question.options!.map((option, i) => {
                    const selected = active.answers[item.question.id];
                    const values = Array.isArray(selected) ? selected : [];
                    return (
                      <label key={i}>
                        <input
                          type="checkbox"
                          disabled={
                            !owned || !editable(active, item.question.id, now)
                          }
                          checked={values.includes(i)}
                          onChange={() =>
                            respond(
                              values.includes(i)
                                ? values.filter((v) => v !== i)
                                : [...values, i],
                            )
                          }
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <NumericInput
                  key={item.question.id}
                  disabled={!owned || !editable(active, item.question.id, now)}
                  value={
                    typeof active.answers[item.question.id] === "string"
                      ? (active.answers[item.question.id] as string)
                      : ""
                  }
                  onValid={respond}
                />
              )}
              <div className="question-actions">
                <button
                  className="button"
                  disabled={!owned}
                  onClick={() =>
                    respond(item.question.type === "msq" ? [] : "")
                  }
                >
                  Clear
                </button>
                <button
                  className="button"
                  disabled={!owned || !editable(active, item.question.id, now)}
                  onClick={() =>
                    persist({
                      ...vault,
                      active: {
                        ...active,
                        marked: active.marked.includes(item.question.id)
                          ? active.marked.filter(
                              (id) => id !== item.question.id,
                            )
                          : [...active.marked, item.question.id],
                      },
                    })
                  }
                >
                  {active.marked.includes(item.question.id)
                    ? "Unmark review"
                    : "Mark for review"}
                </button>
              </div>
              <div className="question-actions">
                <button
                  className="button"
                  disabled={index === 0}
                  onClick={() => setIndex(index - 1)}
                >
                  Previous
                </button>
                <button
                  className="button primary"
                  disabled={index === active.items.length - 1}
                  onClick={() => setIndex(index + 1)}
                >
                  Next →
                </button>
              </div>
            </article>
            <aside className="panel">
              <h3>Question palette</h3>
              <div className="question-palette">
                {active.items.map((v, i) => (
                  <button
                    key={v.question.id}
                    className={`palette-button ${!blank(active.answers[v.question.id]) ? "answered" : ""} ${index === i ? "current" : ""}`}
                    onClick={() => setIndex(i)}
                    aria-label={`Question ${i + 1}${active.marked.includes(v.question.id) ? ", marked for review" : ""}`}
                  >
                    {i + 1}
                    {active.marked.includes(v.question.id) ? "★" : ""}
                  </button>
                ))}
              </div>
              <p className="small-copy">
                Original deadline is retained after reload. Answers save on this
                device, not automatically to the cloud.
              </p>
              <button
                className="button primary"
                disabled={!owned}
                onClick={() => {
                  if (
                    window.confirm(
                      "Submit this practice? Answers will be locked.",
                    )
                  )
                    finish();
                }}
              >
                Submit practice
              </button>
            </aside>
          </div>
        </>
      )}
      {result && (
        <>
          <ResultReport attempt={result} />
          <button
            className="button primary"
            onClick={() => {
              setResult(null);
              setRepeat(false);
              setIndex(0);
            }}
          >
            Build another practice →
          </button>
        </>
      )}
      <p className="study-status" role="status">
        {status}
      </p>
      <div className="question-actions">
        <Link href="/writing">Descriptive & typing practice →</Link>
        <Link href="/results">Results & revision →</Link>
        <Link href="/account">Back up or sync →</Link>
      </div>
    </StudyShell>
  );
}
export function ResultReport({ attempt }: { attempt: PracticeAttempt }) {
  const report = evaluate(attempt);
  return (
    <section className="result-report">
      <span className="eyebrow">
        CUSTOM PRACTICE · NOT AN OFFICIAL EXAM SCORE
      </span>
      <h2>
        {report.score.toFixed(2)} <small>/ {report.maximum}</small>
      </h2>
      <p>
        {report.right} correct · {report.wrong} incorrect · {report.skipped}{" "}
        unanswered · {report.penalties.toFixed(2)} marks lost to penalties
      </p>
      <p className="small-copy">
        Elapsed{" "}
        {Math.floor(
          (Math.min(
            attempt.submittedAt ?? deadline(attempt),
            deadline(attempt),
          ) -
            attempt.startedAt) /
            1000,
        )}{" "}
        seconds. Per-question timing was not measured. Bank{" "}
        {attempt.bankVersion}. No percentile or rank is calculated.
      </p>
      {attempt.items.map((item, i) => {
        const source = questionSource(item.question);
        return (
          <details key={item.question.id} className="answer-review">
            <summary>
              {i + 1}. {item.question.stem}
              <span>
                {report.rows[i].status} · {report.rows[i].marks.toFixed(2)}
              </span>
            </summary>
            <div>
              {item.question.context && <p>{item.question.context}</p>}
              <p>
                Your response:{" "}
                {blank(attempt.answers[item.question.id])
                  ? "Unanswered"
                  : Array.isArray(attempt.answers[item.question.id])
                    ? (attempt.answers[item.question.id] as number[])
                        .map((i) => item.question.options![i])
                        .join("; ")
                    : item.question.type === "mcq"
                      ? item.question.options![
                          Number(attempt.answers[item.question.id])
                        ]
                      : String(attempt.answers[item.question.id])}
              </p>
              <p>
                <strong>Answer:</strong> {keyLabel(item.question)}
              </p>
              <p>{item.question.explanation}</p>
              <a target="_blank" rel="noreferrer" href={source.url}>
                {source.title} ↗
              </a>
              <p className="small-copy">
                Original AI-authored practice · {item.question.keyStatus} · No
                human editorial review · Not a PYQ
              </p>
              <Link
                href={`/courses/${item.question.topicId}?exam=${attempt.examId}`}
              >
                Return to the concept →
              </Link>
            </div>
          </details>
        );
      })}
    </section>
  );
}
