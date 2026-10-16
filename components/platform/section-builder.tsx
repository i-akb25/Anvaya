"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { exams } from "@/lib/catalog";
import { studyUnits } from "@/lib/platform/content";
import { practiceQuestions } from "@/lib/platform/questions";
import { createSectionPractice, type SectionPlan } from "@/lib/platform/engine";
import { readVault, saveVault, seenQuestions } from "@/lib/platform/vault";
import { patterns, officialLaunchReadiness } from "@/lib/platform/registry";
import { StudyShell } from "../study-shell";
const section = (): SectionPlan => ({
  title: "My section",
  topicIds: ["percentages"],
  count: 4,
  seconds: 600,
  correct: 1,
  penalty: 0,
});
export function SectionBuilder() {
  const [exam, setExam] = useState("upsc"),
    [sections, setSections] = useState<SectionPlan[]>([section()]),
    [fixed, setFixed] = useState(true),
    [repeat, setRepeat] = useState(false),
    [status, setStatus] = useState(""),
    [reference, setReference] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("exam");
    if (exams.some((e) => e.id === q)) setExam(q!);
  }, []);
  const units = studyUnits.filter((u) => u.exams.includes(exam)),
    paper = patterns.find((p) => p.id === reference);
  function edit(i: number, update: Partial<SectionPlan>) {
    setSections(sections.map((s, n) => (n === i ? { ...s, ...update } : s)));
  }
  function start() {
    try {
      const v = readVault();
      if (v.active || v.personal?.active)
        throw Error(
          "Finish your unfinished practice before starting another test.",
        );
      const a = createSectionPractice({
        examId: exam,
        sections,
        fixed,
        seen: seenQuestions(v, exam),
        allowRepeats: repeat,
        writerId: crypto.randomUUID(),
        now: Date.now(),
      });
      saveVault({ ...v, active: a }, v.revision);
      location.assign("/assessments");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">SECTION BY SECTION</span>
        <h1>Build a sectional practice.</h1>
        <p>
          Use source-linked original questions with separate section timers and
          marking. This custom practice is not a full exam mock or an authentic
          PYQ paper. Short banks are never padded with repeats.
        </p>
      </div>
      <div className="question-actions">
        <Link href="/assessments">Resume or review concept practice →</Link>
        <Link href="/syllabus">Official rule references →</Link>
      </div>
      <div className="panel">
        <label>
          Exam context
          <select
            value={exam}
            onChange={(e) => {
              setExam(e.target.value);
              setReference("");
              const first = studyUnits.find((u) =>
                u.exams.includes(e.target.value),
              )!;
              setSections([{ ...section(), topicIds: [first.slug] }]);
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
          Compare a paper reference
          <select
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          >
            <option value="">No paper reference</option>
            {patterns
              .filter((p) => p.examId === exam)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} · {p.cycle}
                </option>
              ))}
          </select>
        </label>
        {paper && (
          <div className="content-provenance">
            <h2>{paper.title}</h2>
            <p>
              {paper.classification} · {paper.version}. This reference does not
              change your custom settings.
            </p>
            <a href={paper.sourceUrl} target="_blank" rel="noreferrer">
              Read governing instructions ↗
            </a>
            <ul>
              {officialLaunchReadiness(paper, null).missing.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
            <p>
              Official launch remains locked until rules, accommodations,
              question rights and final answer keys are reviewed.
            </p>
          </div>
        )}
        <label>
          <input
            type="checkbox"
            checked={fixed}
            onChange={(e) => setFixed(e.target.checked)}
          />
          Fixed timed sections: other sections stay locked; no going back after
          closure.
        </label>
        <label>
          <input
            type="checkbox"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
          />
          Allow questions I have already practised. No question repeats within
          this attempt.
        </label>
      </div>
      {sections.map((s, i) => (
        <section className="panel" key={i}>
          <h2>Section{i + 1}</h2>
          <div className="practice-builder">
            <label>
              Section title
              <input
                maxLength={100}
                value={s.title}
                onChange={(e) => edit(i, { title: e.target.value })}
              />
            </label>
            <label>
              Topic
              <select
                value={s.topicIds[0]}
                onChange={(e) => edit(i, { topicIds: [e.target.value] })}
              >
                {units.map((u) => (
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
                value={s.count}
                onChange={(e) => edit(i, { count: Number(e.target.value) })}
              />
            </label>
            <label>
              Minutes
              <input
                type="number"
                min={1}
                max={180}
                value={s.seconds / 60}
                onChange={(e) =>
                  edit(i, { seconds: Number(e.target.value) * 60 })
                }
              />
            </label>
            <label>
              Marks for correct
              <input
                type="number"
                min={0.1}
                max={10}
                step="any"
                value={s.correct}
                onChange={(e) => edit(i, { correct: Number(e.target.value) })}
              />
            </label>
            <label>
              Wrong MCQ deduction
              <input
                type="number"
                min={0}
                max={10}
                step="any"
                value={s.penalty}
                onChange={(e) => edit(i, { penalty: Number(e.target.value) })}
              />
            </label>
          </div>
          <p>
            {
              practiceQuestions.filter((q) => s.topicIds.includes(q.topicId))
                .length
            }{" "}
            bundled questions for this topic before unseen and cross-section
            filtering. Wrong MSQ/numeric and blank responses score zero.
          </p>
          <button
            className="button"
            disabled={sections.length === 1}
            onClick={() => setSections(sections.filter((_, n) => n !== i))}
          >
            Remove section
          </button>
        </section>
      ))}
      <p role="status">{status}</p>
      <div className="question-actions">
        <button
          className="button"
          disabled={sections.length >= 6}
          onClick={() =>
            setSections([
              ...sections,
              { ...section(), topicIds: [units[0].slug] },
            ])
          }
        >
          Add section
        </button>
        <button className="button primary" onClick={start}>
          Start custom sectional practice
        </button>
      </div>
      <p>
        Section clocks use the original absolute start time. Refresh never
        extends time. You will take over the saved attempt on the practice page.
        Results retain frozen questions, keys and section marking.
      </p>
    </StudyShell>
  );
}
