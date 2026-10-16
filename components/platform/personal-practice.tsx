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
import { numericValue } from "@/lib/platform/engine";
import {
  emptyPersonal,
  validPersonalPack,
  validPersonalQuestion,
  importPersonalPack,
  createPersonalAttempt,
  answerPersonal,
  submitPersonal,
  personalScore,
  personalDeadline,
  type PersonalPack,
  type PersonalQuestion,
  type PersonalAttempt,
} from "@/lib/platform/personal-practice";
import { StudyShell } from "../study-shell";
function download(pack: PersonalPack) {
  const url = URL.createObjectURL(
      new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = `${pack.id}-${pack.version}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Key({ question: q }: { question: PersonalQuestion }) {
  return (
    <>
      {Array.isArray(q.answer)
        ? q.answer.map((i) => q.options?.[i]).join("; ")
        : q.answer.min === q.answer.max
          ? q.answer.min
          : `${q.answer.min} to ${q.answer.max}, inclusive`}
    </>
  );
}
export function PersonalPracticeDesk() {
  const [v, setV] = useState<LearningVault>(emptyVault()),
    [ready, setReady] = useState(false),
    [status, setStatus] = useState(""),
    [packId, setPackId] = useState(""),
    [pending, setPending] = useState<PersonalPack | null>(null),
    [ack, setAck] = useState(false);
  const [title, setTitle] = useState(""),
    [exam, setExam] = useState("upsc"),
    [draft, setDraft] = useState<PersonalQuestion[]>([]),
    [type, setType] = useState<PersonalQuestion["type"]>("mcq"),
    [stem, setStem] = useState(""),
    [options, setOptions] = useState(""),
    [keys, setKeys] = useState<number[]>([0]),
    [min, setMin] = useState(""),
    [max, setMax] = useState(""),
    [explanation, setExplanation] = useState(""),
    [source, setSource] = useState("");
  const [count, setCount] = useState(5),
    [minutes, setMinutes] = useState(10),
    [marks, setMarks] = useState(1),
    [penalty, setPenalty] = useState(0),
    [index, setIndex] = useState(0),
    [now, setNow] = useState(0),
    [numeric, setNumeric] = useState(""),
    [report, setReport] = useState<PersonalAttempt | null>(null);
  const p = v.personal ?? emptyPersonal(),
    active = p.active,
    q = active?.questions[index] ?? active?.questions[0],
    selectedPack =
      p.packs.find((pack) => `${pack.id}:${pack.version}` === packId) ??
      p.packs[0];
  useEffect(() => {
    try {
      setV(readVault());
      setReady(true);
    } catch (e) {
      setStatus((e as Error).message);
    }
    setNow(Date.now());
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);
  useEffect(() => {
    if (q)
      setNumeric(
        typeof active?.answers[q.id] === "string"
          ? (active.answers[q.id] as string)
          : "",
      );
  }, [index, active?.id]);
  useEffect(() => {
    if (active && now >= personalDeadline(active)) finish();
  }, [now, active?.id]);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (draft.length || stem.trim()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [draft.length, stem]);
  function persist(next: LearningVault) {
    try {
      const saved = saveVault(next, v.revision);
      setV(saved);
      setStatus("Saved on this device.");
      return true;
    } catch (e) {
      setStatus((e as Error).message);
      return false;
    }
  }
  function finish() {
    if (!active) return;
    const result = submitPersonal(active, Date.now());
    if (
      persist({
        ...v,
        personal: {
          ...p,
          active: null,
          results: p.results.some((r) => r.id === result.id)
            ? p.results
            : [result, ...p.results].slice(0, 20),
        },
      })
    ) {
      setReport(result);
      setIndex(0);
    }
  }
  function respond(value: string | number[]) {
    if (!active || !q) return;
    try {
      const next = answerPersonal(active, q.id, value, Date.now());
      persist({ ...v, personal: { ...p, active: next } });
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  function addQuestion() {
    const lower = numericValue(min),
      upper = numericValue(max);
    const question: PersonalQuestion = {
      id: `q-${crypto.randomUUID()}`,
      type,
      stem: stem.trim(),
      answer:
        type === "numeric" ? { min: lower ?? NaN, max: upper ?? NaN } : keys,
      explanation: explanation.trim(),
      ...(type !== "numeric"
        ? {
            options: options
              .split("\n")
              .map((o) => o.trim())
              .filter(Boolean),
          }
        : {}),
      ...(source.trim() ? { sourceUrl: source.trim() } : {}),
    };
    if (!validPersonalQuestion(question)) {
      setStatus(
        "Check the question, explanation and answer. Choice questions need 2–8 options and valid selected keys; numerical ranges need both bounds. Sources must use HTTPS.",
      );
      return;
    }
    if (draft.length >= 100) {
      setStatus("A pack supports up to 100 questions.");
      return;
    }
    setDraft([...draft, question]);
    setStem("");
    setExplanation("");
    setOptions("");
    setKeys([0]);
    setMin("");
    setMax("");
    setSource("");
    setStatus("Question added to the unsaved pack draft.");
  }
  async function importFile(file?: File) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStatus("Question pack must be smaller than 2 MB.");
      return;
    }
    try {
      const pack: unknown = JSON.parse(await file.text());
      if (!validPersonalPack(pack))
        throw Error(
          "Invalid question pack. Export one created here to inspect the supported format.",
        );
      setPending(pack);
      setAck(false);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">PRACTISE WITH YOUR OWN MATERIAL</span>
        <h1>My question desk.</h1>
        <p>
          Create questions from material you may use, or import your own pack.
          Answers and explanations are supplied by you and are not verified by
          Anvaya. This is personal timed practice, never an official mock or
          authenticated PYQ bank.
        </p>
      </div>
      <p role="status" aria-live="polite">
        {status}
      </p>
      <p>
        <button
          className="button"
          onClick={() => {
            try {
              const latest = readVault();
              setV(latest);
              setReady(true);
              setIndex(0);
              const first = latest.personal?.active?.questions[0];
              setNumeric(
                first &&
                  typeof latest.personal?.active?.answers[first.id] === "string"
                  ? (latest.personal.active.answers[first.id] as string)
                  : "",
              );
              setStatus("Latest saved practice loaded.");
            } catch (e) {
              setStatus((e as Error).message);
            }
          }}
        >
          Reload saved practice
        </button>{" "}
        <Link href="/account">Back up all questions, notes & results →</Link>
      </p>
      {active && q ? (
        <section className="panel">
          <div className="attempt-toolbar">
            <strong>
              {Math.max(0, Math.ceil((personalDeadline(active) - now) / 1000))}s
              remaining
            </strong>
            <span>
              {active.pack.title} · {active.pack.examId} · personal/unverified
            </span>
          </div>
          <p>
            Question {index + 1}/{active.questions.length} · {q.type} · +
            {active.marks}; wrong MCQ −{active.penalty}; MSQ/numeric wrong 0;
            blanks 0
          </p>
          <h2>{q.stem}</h2>
          {q.type === "numeric" ? (
            <label>
              Numerical response
              <input
                value={numeric}
                inputMode="decimal"
                maxLength={100}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!/^[-+]?(?:\d*(?:\.\d*)?)(?:[eE][-+]?\d*)?$/.test(raw))
                    return;
                  setNumeric(raw);
                  respond(raw === "" || numericValue(raw) !== null ? raw : "");
                }}
              />
            </label>
          ) : (
            <div className="answer-options">
              {q.options!.map((o, i) => (
                <label key={i}>
                  <input
                    type={q.type === "mcq" ? "radio" : "checkbox"}
                    name={q.id}
                    checked={
                      Array.isArray(active.answers[q.id]) &&
                      (active.answers[q.id] as number[]).includes(i)
                    }
                    onChange={() => {
                      const prior = Array.isArray(active.answers[q.id])
                        ? (active.answers[q.id] as number[])
                        : [];
                      respond(
                        q.type === "mcq"
                          ? [i]
                          : prior.includes(i)
                            ? prior.filter((n) => n !== i)
                            : [...prior, i],
                      );
                    }}
                  />
                  {o}
                </label>
              ))}
            </div>
          )}
          <div className="question-actions">
            <button
              className="button"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              Previous
            </button>
            <button
              className="button"
              onClick={() => {
                setNumeric("");
                respond(q.type === "numeric" ? "" : []);
              }}
            >
              Clear answer
            </button>
            <button
              className="button"
              disabled={index >= active.questions.length - 1}
              onClick={() => setIndex(index + 1)}
            >
              Next
            </button>
            <button className="button primary" onClick={finish}>
              Submit personal practice
            </button>
          </div>
          <p>
            Responses save after each valid change. The original deadline
            survives refresh, backup and restore.
          </p>
        </section>
      ) : (
        <>
          {report && (
            <section className="panel">
              <h2>{report.pack.title} · result</h2>
              <p>
                {personalScore(report).score.toFixed(2)} /{" "}
                {personalScore(report).maximum} ·{" "}
                {personalScore(report).correct} correct against your supplied
                key. Not an exam-readiness measure.
              </p>
              {report.questions.map((question) => (
                <details key={question.id}>
                  <summary>
                    {
                      personalScore(report).rows.find(
                        (r) => r.id === question.id,
                      )?.status
                    }{" "}
                    · {question.stem}
                  </summary>
                  <p>
                    Your response:{" "}
                    {Array.isArray(report.answers[question.id])
                      ? (report.answers[question.id] as number[])
                          .map((i) => question.options?.[i])
                          .join("; ") || "Unanswered"
                      : report.answers[question.id] || "Unanswered"}
                  </p>
                  <p>
                    Supplied key: <Key question={question} />
                  </p>
                  <p>{question.explanation}</p>
                  {question.sourceUrl && (
                    <a
                      href={question.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Supplied source ↗
                    </a>
                  )}
                </details>
              ))}
              <button className="button" onClick={() => setReport(null)}>
                Close result
              </button>
            </section>
          )}
          <div className="path-layout">
            <section>
              <h2>My packs</h2>
              <p>
                {p.packs.length}/10 packs ·{" "}
                {p.packs.reduce((s, pack) => s + pack.questions.length, 0)}/500
                questions. Results retain the latest 20 frozen attempts.
              </p>
              {selectedPack ? (
                <>
                  <label>
                    Question pack
                    <select
                      value={`${selectedPack.id}:${selectedPack.version}`}
                      onChange={(e) => {
                        setPackId(e.target.value);
                        setCount(1);
                      }}
                    >
                      {p.packs.map((pack) => (
                        <option
                          key={`${pack.id}:${pack.version}`}
                          value={`${pack.id}:${pack.version}`}
                        >
                          {pack.title} · {pack.examId} · {pack.questions.length}{" "}
                          Q
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="practice-builder">
                    <label>
                      Questions
                      <input
                        type="number"
                        min={1}
                        max={Math.min(50, selectedPack.questions.length)}
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
                      Correct marks
                      <input
                        type="number"
                        min={0.1}
                        max={10}
                        step="any"
                        value={marks}
                        onChange={(e) => setMarks(Number(e.target.value))}
                      />
                    </label>
                    <label>
                      Wrong MCQ penalty
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step="any"
                        value={penalty}
                        onChange={(e) => setPenalty(Number(e.target.value))}
                      />
                    </label>
                  </div>
                  <p>
                    Fresh random selection, without repetition within a test.
                    Reusing this pack across tests is deliberate revision.
                  </p>
                  <div className="question-actions">
                    <button
                      className="button primary"
                      disabled={!ready}
                      onClick={() => {
                        try {
                          if (v.active)
                            throw Error(
                              "Finish the active concept practice first.",
                            );
                          const a = createPersonalAttempt(
                            selectedPack,
                            count,
                            minutes * 60,
                            marks,
                            penalty,
                            Date.now(),
                          );
                          if (
                            persist({ ...v, personal: { ...p, active: a } })
                          ) {
                            setReport(null);
                            setIndex(0);
                          }
                        } catch (e) {
                          setStatus((e as Error).message);
                        }
                      }}
                    >
                      Start personal practice
                    </button>
                    <button
                      className="button"
                      onClick={() => download(selectedPack)}
                    >
                      Export this pack
                    </button>
                    <button
                      className="button"
                      disabled={!ready}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Remove this pack? Saved results retain their frozen questions. Export a copy first if needed.",
                          )
                        )
                          persist({
                            ...v,
                            personal: {
                              ...p,
                              packs: p.packs.filter(
                                (pack) => pack !== selectedPack,
                              ),
                            },
                          });
                      }}
                    >
                      Remove pack
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  Create or import your first question pack below.
                </div>
              )}
              <h2>Build a pack</h2>
              <p>Draft questions stay on this page until you save the pack.</p>
              <label>
                Pack title
                <input
                  maxLength={200}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label>
                Exam
                <select value={exam} onChange={(e) => setExam(e.target.value)}>
                  {exams.map((e) => (
                    <option value={e.id} key={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="panel">
                <label>
                  Question type
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value as PersonalQuestion["type"]);
                      setKeys([0]);
                    }}
                  >
                    <option value="mcq">Single correct</option>
                    <option value="msq">Multiple correct</option>
                    <option value="numeric">Numerical range</option>
                  </select>
                </label>
                <label>
                  Question
                  <textarea
                    value={stem}
                    maxLength={5000}
                    onChange={(e) => setStem(e.target.value)}
                  />
                </label>
                {type === "numeric" ? (
                  <div className="form-row">
                    <label>
                      Minimum accepted value
                      <input
                        value={min}
                        onChange={(e) => setMin(e.target.value)}
                      />
                    </label>
                    <label>
                      Maximum accepted value
                      <input
                        value={max}
                        onChange={(e) => setMax(e.target.value)}
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <label>
                      Options, one per line
                      <textarea
                        value={options}
                        onChange={(e) => {
                          setOptions(e.target.value);
                          setKeys([0]);
                        }}
                      />
                    </label>
                    <fieldset>
                      <legend>Correct option{type === "msq" ? "s" : ""}</legend>
                      {options
                        .split("\n")
                        .map((o) => o.trim())
                        .filter(Boolean)
                        .slice(0, 8)
                        .map((o, i) => (
                          <label className="check-label" key={i}>
                            <input
                              type={type === "mcq" ? "radio" : "checkbox"}
                              name="builder-key"
                              checked={keys.includes(i)}
                              onChange={() =>
                                setKeys(
                                  type === "mcq"
                                    ? [i]
                                    : keys.includes(i)
                                      ? keys.filter((n) => n !== i)
                                      : [...keys, i],
                                )
                              }
                            />
                            {i + 1}. {o}
                          </label>
                        ))}
                    </fieldset>
                  </>
                )}
                <label>
                  Explanation
                  <textarea
                    maxLength={10000}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                  />
                </label>
                <label>
                  Source URL, optional
                  <input
                    type="url"
                    maxLength={2000}
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="https://…"
                  />
                </label>
                <button
                  className="button"
                  disabled={!ready}
                  onClick={addQuestion}
                >
                  Add question to draft
                </button>
              </div>
              <p>{draft.length} questions in unsaved draft</p>
              {draft.map((q) => (
                <details key={q.id}>
                  <summary>{q.stem}</summary>
                  <p>{q.explanation}</p>
                  <button
                    className="button"
                    onClick={() =>
                      setDraft(draft.filter((item) => item.id !== q.id))
                    }
                  >
                    Remove from draft
                  </button>
                </details>
              ))}
              <button
                className="button primary"
                disabled={!ready || !draft.length || !title.trim()}
                onClick={() => {
                  setPending({
                    schema: 1,
                    id: `pack-${crypto.randomUUID()}`,
                    version: "v1",
                    title: title.trim(),
                    examId: exam,
                    questions: draft,
                  });
                  setAck(false);
                }}
              >
                Review & save pack
              </button>
            </section>
            <aside>
              <div className="panel">
                <h2>Import a pack</h2>
                <p>
                  Import a JSON pack exported from this desk. Files are read
                  locally and never published. Do not import material you lack
                  permission to use.
                </p>
                <label className="button">
                  Choose question pack
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="visually-hidden"
                    disabled={!ready}
                    onChange={(e) => {
                      importFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="panel">
                <h2>Saved personal results</h2>
                {p.results.map((a) => (
                  <p key={a.id}>
                    <button className="button" onClick={() => setReport(a)}>
                      {a.pack.title} ·{" "}
                      {new Date(a.startedAt).toLocaleDateString()} ·{" "}
                      {personalScore(a).score.toFixed(2)}
                    </button>
                  </p>
                ))}
                {!p.results.length && <p>No personal results yet.</p>}
                <Link href="/results">Bundled concept-practice results →</Link>
              </div>
            </aside>
          </div>
        </>
      )}
      {pending && (
        <section
          className="panel restore-confirm"
          role="region"
          aria-label="Review personal pack"
        >
          <h2>Save {pending.title}?</h2>
          <p>
            {pending.examId} · {pending.questions.length} questions ·{" "}
            {pending.version}. Nothing is published or independently verified.
          </p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />{" "}
            I may use this material and understand scoring uses its supplied
            answer keys.
          </label>
          <button
            className="button primary"
            disabled={!ack || !ready}
            onClick={() => {
              try {
                if (
                  persist({ ...v, personal: importPersonalPack(p, pending) })
                ) {
                  setPackId(`${pending.id}:${pending.version}`);
                  setCount(Math.min(5, pending.questions.length));
                  setPending(null);
                  setDraft([]);
                  setTitle("");
                }
              } catch (e) {
                setStatus((e as Error).message);
              }
            }}
          >
            Save personal pack
          </button>
          <button className="button" onClick={() => setPending(null)}>
            Cancel
          </button>
        </section>
      )}
    </StudyShell>
  );
}
