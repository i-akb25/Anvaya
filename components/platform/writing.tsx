"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  emptyVault,
  readVault,
  saveVault,
  type LearningVault,
} from "@/lib/platform/vault";
import { StudyShell } from "../study-shell";
const prompts = [
  {
    id: "upsc-ethics",
    exam: "UPSC CSE",
    kind: "Case study",
    title: "Accuracy under pressure",
    prompt:
      "Original practice scenario: You discover a material error in a report shortly before a decision meeting. Your supervisor asks you to leave it unchanged to avoid delay. Explain your options, stakeholders, risks and a defensible course of action.",
    target: 250,
    minutes: 20,
  },
  {
    id: "bpsc-essay",
    exam: "BPSC CCE",
    kind: "Essay",
    title: "Local evidence, better public decisions",
    prompt:
      "Original practice prompt: Discuss how local evidence can improve public decisions. Develop an argument, include a Bihar-relevant example that you can substantiate, consider limitations, and propose practical safeguards.",
    target: 700,
    minutes: 45,
  },
  {
    id: "ese-solution",
    exam: "ESE Electrical",
    kind: "Conventional solution",
    title: "Derive before substituting",
    prompt:
      "Original exercise: An ideal DC source Vs drives a series resistor R and capacitor C. The capacitor is initially uncharged. Derive the capacitor voltage for t≥0, state assumptions and units, and verify initial and final values. Use a labelled circuit sketch if useful.",
    target: 300,
    minutes: 25,
  },
  {
    id: "banking-email",
    exam: "SBI / IBPS PO",
    kind: "Written communication",
    title: "Explain a service disruption",
    prompt:
      "Original practice prompt: Draft an email to a branch manager explaining a temporary service disruption, its effect on customers and the steps proposed to reduce inconvenience. Use a clear subject, factual body and actionable closing. Do not invent real customer data.",
    target: 200,
    minutes: 15,
  },
  {
    id: "interview",
    exam: "All selection interviews",
    kind: "Interview reflection",
    title: "Explain a difficult decision",
    prompt:
      "Original practice prompt: Describe a decision you made with incomplete information. Explain what you knew, what you checked, how you evaluated the risk, and what you would change. Use a real example you are comfortable storing privately.",
    target: 250,
    minutes: 10,
  },
];
const typingText =
  "Good preparation depends on careful reading, clear reasoning and regular revision. A useful study session has a small objective, a reliable source and a way to check understanding. After solving a problem, explain the method in your own words and note the assumption that made the solution possible.";
export function WritingDesk() {
  const [vault, setVault] = useState<LearningVault>(emptyVault()),
    [ready, setReady] = useState(false),
    [id, setId] = useState(prompts[0].id),
    [text, setText] = useState(""),
    [status, setStatus] = useState(""),
    [running, setRunning] = useState(false),
    [elapsed, setElapsed] = useState(0),
    [image, setImage] = useState(""),
    [typing, setTyping] = useState(false),
    [typed, setTyped] = useState(""),
    [started, setStarted] = useState<number | null>(null);
  const imageRef = useRef("");
  const p = prompts.find((p) => p.id === id)!;
  useEffect(() => {
    try {
      const v = readVault();
      setVault(v);
      setText(v.writing[id]?.text ?? "");
      setReady(true);
    } catch (e) {
      setStatus((e as Error).message);
    }
    return () => {
      if (imageRef.current) URL.revokeObjectURL(imageRef.current);
    };
  }, []);
  useEffect(() => {
    if (!running) return;
    const start = Date.now() - elapsed * 1000;
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [running]);
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  function save() {
    try {
      const value = saveVault(
        {
          ...vault,
          writing: {
            ...vault.writing,
            [id]: { text, kind: p.kind, updatedAt: new Date().toISOString() },
          },
        },
        vault.revision,
      );
      setVault(value);
      setStatus(
        "Writing saved on this device. No automated examiner score is assigned.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  const errors = Array.from(typed).reduce(
      (n, c, i) => n + (c !== typingText[i] ? 1 : 0),
      0,
    ),
    correctChars = Math.max(0, typed.length - errors),
    duration = started ? Math.max(1, (Date.now() - started) / 1000) : 0;
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">EXPLAIN YOUR THINKING</span>
        <h1>Write. Review. Refine.</h1>
        <p>
          Original descriptive, essay, interview and typing exercises. Prompts
          and rubrics are practice aids, not official questions or examiner
          grading.
        </p>
      </div>
      <div className="question-actions">
        <button
          className="button"
          aria-pressed={!typing}
          onClick={() => setTyping(false)}
        >
          Answer writing
        </button>
        <button
          className="button"
          aria-pressed={typing}
          onClick={() => setTyping(true)}
        >
          Typing exercise
        </button>
      </div>
      {!typing ? (
        <div className="writing-layout">
          <section>
            <label>
              Practice prompt
              <select
                value={id}
                onChange={(e) => {
                  if (
                    text !== (vault.writing[id]?.text ?? "") &&
                    !window.confirm("Leave without saving this draft?")
                  )
                    return;
                  setId(e.target.value);
                  setText(vault.writing[e.target.value]?.text ?? "");
                  setElapsed(0);
                  setRunning(false);
                }}
              >
                {prompts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.exam} · {p.kind}
                  </option>
                ))}
              </select>
            </label>
            <div className="writing-prompt">
              <span className="eyebrow">{p.exam} · ORIGINAL PRACTICE</span>
              <h2>{p.title}</h2>
              <p>{p.prompt}</p>
              <p className="small-copy">
                Suggested target {p.target} words / {p.minutes} minutes. These
                are custom practice targets.
              </p>
            </div>
            <label htmlFor="written-answer">Your answer</label>
            <textarea
              id="written-answer"
              className="answer-editor"
              disabled={!ready}
              value={text}
              maxLength={100000}
              onChange={(e) => setText(e.target.value)}
              placeholder="State the problem, organise your reasoning, and support your conclusion. Plain text supports Unicode mathematical notation."
            />
            <div className="attempt-toolbar">
              <span>
                {words} words / {p.target} suggested
              </span>
              <span>
                {Math.floor(elapsed / 60)}:
                {String(elapsed % 60).padStart(2, "0")}
              </span>
              <button className="button" onClick={() => setRunning(!running)}>
                {running ? "Pause" : "Start timer"}
              </button>
            </div>
            <div className="question-actions">
              <button
                className="button primary"
                disabled={!ready}
                onClick={save}
              >
                Save answer
              </button>
              <button
                className="button"
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([`${p.title}\n\n${p.prompt}\n\n${text}`], {
                      type: "text/plain",
                    }),
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `anvaya-${id}.txt`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
              >
                Export answer
              </button>
              <label className="button">
                Preview a handwritten solution
                <input
                  className="visually-hidden"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (
                      !["image/png", "image/jpeg", "image/webp"].includes(
                        f.type,
                      ) ||
                      f.size > 10 * 1024 * 1024
                    ) {
                      setStatus(
                        "Choose a PNG, JPEG or WebP image under 10 MB.",
                      );
                      return;
                    }
                    if (imageRef.current) URL.revokeObjectURL(imageRef.current);
                    imageRef.current = URL.createObjectURL(f);
                    setImage(imageRef.current);
                  }}
                />
              </label>
            </div>
            {image && (
              <div className="handwritten-preview">
                <img src={image} alt="Your selected handwritten solution" />
                <p className="small-copy">
                  Local preview only. This image is not uploaded, saved in notes
                  or included in backups.
                </p>
              </div>
            )}
          </section>
          <aside className="panel">
            <h2>Review with a rubric</h2>
            <ul className="rubric-list">
              <li>Did I answer the actual question?</li>
              <li>Are assumptions explicit?</li>
              <li>Can I substantiate factual claims?</li>
              <li>Does each paragraph or step advance the argument?</li>
              <li>Have I considered a relevant counterpoint or limit?</li>
              <li>Are units, diagrams and final checks consistent?</li>
            </ul>
            <p>
              No score is inferred from word count or answer length. Use a
              qualified reviewer for substantive evaluation.
            </p>
            <Link href="/account">Back up or sync writing →</Link>
          </aside>
        </div>
      ) : (
        <section className="panel">
          <h2>Typing accuracy drill</h2>
          <p>
            This custom drill is not an SSC DEST simulation. Official keystroke,
            error and passage rules require a separate verified configuration.
          </p>
          <div className="typing-reference">{typingText}</div>
          <label htmlFor="typing-answer">Type the passage</label>
          <textarea
            id="typing-answer"
            className="answer-editor"
            value={typed}
            maxLength={typingText.length + 100}
            onPaste={(e) => e.preventDefault()}
            onChange={(e) => {
              if (!started) setStarted(Date.now());
              setTyped(e.target.value);
            }}
          />
          <p>
            {errors} position-based character mismatches ·{" "}
            {typed.length ? Math.round((correctChars / typed.length) * 100) : 0}
            % character accuracy ·{" "}
            {duration ? (correctChars / 5 / (duration / 60)).toFixed(1) : "0"}{" "}
            correct-character WPM estimate
          </p>
          <p className="small-copy">
            WPM uses five characters per word and elapsed time. This is not the
            official DEST error calculation. Refresh or restart resets this
            drill.
          </p>
          <button
            className="button"
            onClick={() => {
              setTyped("");
              setStarted(null);
            }}
          >
            Restart drill
          </button>
        </section>
      )}
      <p className="study-status" role="status">
        {status}
      </p>
    </StudyShell>
  );
}
