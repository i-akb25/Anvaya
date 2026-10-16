"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { studyUnits, sourceFor } from "@/lib/platform/content";
import { StudyShell } from "../study-shell";
export function TutorDesk() {
  const [unit, setUnit] = useState(studyUnits[0].slug),
    [question, setQuestion] = useState(""),
    [context, setContext] = useState(""),
    [consent, setConsent] = useState(false),
    [configured, setConfigured] = useState(false),
    [status, setStatus] = useState("Checking tutor availability…"),
    [answer, setAnswer] = useState(""),
    [busy, setBusy] = useState(false),
    [answerUnit, setAnswerUnit] = useState("");
  useEffect(() => {
    fetch("/api/tutor", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => {
        setConfigured(d.configured === true);
        setStatus(
          d.configured
            ? "Owner sign-in required. No transfer until you submit."
            : "AI tutor is OFF. You can read every source-linked lesson without an AI provider.",
        );
      })
      .catch(() =>
        setStatus(
          "Tutor availability could not be checked. Learning pages remain available.",
        ),
      );
  }, []);
  async function ask(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setAnswer("");
    try {
      const r = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: unit,
          question,
          privateContext: context,
          consent,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Tutor unavailable.");
      if (typeof d.answer !== "string") throw Error("Invalid tutor response.");
      setAnswer(d.answer);
      setAnswerUnit(unit);
      setStatus(
        `AI-generated and unreviewed. ${d.remaining} reserved calls remain today (UTC).`,
      );
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const u = studyUnits.find((u) => u.slug === unit)!;
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">EXPLAIN · QUESTION · VERIFY</span>
        <h1>A tutor with a bounded source.</h1>
        <p>
          Optional AI explanations of one selected foundation lesson. It cannot
          verify a full syllabus, invent a PYQ key or replace an official
          evaluator.
        </p>
      </div>
      <p role="status">{status}</p>
      <form className="panel" onSubmit={ask}>
        <label>
          Lesson
          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            {studyUnits.map((u) => (
              <option key={u.slug} value={u.slug}>
                {u.title}
              </option>
            ))}
          </select>
        </label>
        <div className="question-actions">
          <Link href={`/courses/${unit}`}>Read worked lesson →</Link>
          <a href={sourceFor(u.sourceId).url} target="_blank" rel="noreferrer">
            Open publisher source ↗
          </a>
          <Link href="/account">Owner account →</Link>
        </div>
        <label>
          My question
          <textarea
            value={question}
            maxLength={2000}
            required
            minLength={3}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </label>
        <label>
          Optional text I choose to send
          <textarea
            value={context}
            maxLength={4000}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Leave empty to send no private notes. Do not include secrets or personal identifiers."
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          For this question, send my question, the selected Anvaya lesson and
          the optional text above to Google Gemini. Anvaya does not save this
          conversation; the provider's data terms apply.
        </label>
        <p>
          20 reserved calls per owner per UTC day, at least 6 seconds apart.
          Failed provider requests can consume a reserved call. Input and output
          are bounded; these limits do not promise free usage.
        </p>
        <button
          className="button primary"
          disabled={!configured || !consent || busy}
        >
          {busy ? "Requesting explanation…" : "Ask about this lesson"}
        </button>
      </form>
      {answer && (
        <section className="panel">
          <h2>AI-generated explanation</h2>
          <p className="tutor-answer">{answer}</p>
          <p>
            [S1]{" "}
            <Link href={`/courses/${answerUnit}`}>
              {studyUnits.find((u) => u.slug === answerUnit)?.title}
            </Link>
            . The citation identifies supplied context; it does not certify the
            generated claims.
          </p>
        </section>
      )}
    </StudyShell>
  );
}
