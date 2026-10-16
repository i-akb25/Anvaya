"use client";
import { useState } from "react";
import Link from "next/link";
import { subtopicHighlights } from "@/lib/platform/coverage";
import { exams } from "@/lib/catalog";
import { patterns, officialLaunchReadiness } from "@/lib/platform/registry";
import { syllabusUnits } from "@/lib/platform/syllabus";
import { studyUnits } from "@/lib/platform/content";
import { StudyShell } from "../study-shell";
export function SyllabusRegistry() {
  const [exam, setExam] = useState("upsc"),
    [stage, setStage] = useState("all"),
    [q, setQ] = useState("");
  const papers = patterns.filter((p) => p.examId === exam),
    units = syllabusUnits.filter(
      (u) =>
        u.examId === exam &&
        (stage === "all" || u.stage === stage) &&
        (u.title + u.aliases.join(" ")).toLowerCase().includes(q.toLowerCase()),
    );
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">EXAM → CYCLE → STAGE → PAPER → TOPIC</span>
        <h1>Know what you’re studying for.</h1>
        <p>
          Versioned source references, separate paper definitions and topic
          mappings. An outline is not a complete verified syllabus. Unresolved
          instructions remain visible.
        </p>
      </div>
      <p>
        <Link href="/coverage">
          Inspect all ten paths and remaining content gates →
        </Link>
      </p>
      <div className="registry-filters">
        <label>
          Exam
          <select
            value={exam}
            onChange={(e) => {
              setExam(e.target.value);
              setStage("all");
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
          Stage / paper
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="all">All stages</option>
            {papers.map((p) => (
              <option key={p.id} value={p.stage}>
                {p.title} · {p.cycle}
              </option>
            ))}
          </select>
        </label>
        <label>
          Find a topic
          <input
            placeholder="Circuits, polity, reasoning…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>
      <div className="path-layout">
        <section>
          <h2>Mapped syllabus outline</h2>
          {units.map((u) => (
            <details className="syllabus-unit" key={u.id}>
              <summary>
                <strong>{u.title}</strong>
                <span className="muted">
                  {u.cycle} · {u.stage}
                </span>
              </summary>
              <div>
                <span className="content-status">
                  {u.status === "source-checked-outline"
                    ? "Official section outline checked"
                    : "Research outline · verification pending"}
                </span>
                <p>{u.depth}</p>
                {subtopicHighlights(u) && (
                  <section>
                    <h3>Selected subtopic highlights</h3>
                    <ul>
                      {subtopicHighlights(u)!.items.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                    <p>
                      {subtopicHighlights(u)!.scope} Checked{" "}
                      {subtopicHighlights(u)!.checkedOn}.
                    </p>
                  </section>
                )}
                <a href={u.sourceUrl} target="_blank" rel="noreferrer">
                  Governing source ↗
                </a>
                <p className="small-copy">
                  {u.locator} · {u.version}
                </p>
                <div className="unit-links">
                  <Link href={`/lectures?exam=${exam}&syllabus=${u.id}`}>
                    Lecture selections for this section →
                  </Link>
                  {u.topicIds.map((id) => {
                    const lesson = studyUnits.find(
                      (l) => l.slug === id && l.exams.includes(exam),
                    );
                    return lesson ? (
                      <Link key={id} href={`/courses/${id}?exam=${exam}`}>
                        {lesson.title} →
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
            </details>
          ))}
          {!units.length && (
            <p className="empty-state">
              Detailed topic mapping for this selection is pending. Paper
              references are shown separately.
            </p>
          )}
        </section>
        <aside>
          <h2>Paper rules & readiness</h2>
          {papers
            .filter((p) => stage === "all" || p.stage === stage)
            .map((p) => (
              <details className="pattern-card" key={p.id}>
                <summary>
                  <strong>{p.title}</strong>
                  <span>
                    {p.cycle} · {p.status}
                  </span>
                </summary>
                <div>
                  <p className="small-copy">
                    Reference classification: {p.classification}. No official
                    mock is enabled.
                  </p>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Section</th>
                          <th>Q</th>
                          <th>Marks</th>
                          <th>Min</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.sections.map((s) => (
                          <tr key={s.id}>
                            <td>
                              {s.title}
                              {s.qualifying ? " (qualifying)" : ""}
                            </td>
                            <td>{s.questions ?? "Unresolved"}</td>
                            <td>{s.marks ?? "—"}</td>
                            <td>{s.minutes ?? "Unresolved"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="small-copy">
                    Formats: {p.formats.join(", ").toUpperCase()} · Navigation:{" "}
                    {p.navigation} · Calculator: {p.calculator}
                  </p>
                  <p className="small-copy">
                    {p.penalty
                      ? `MCQ penalty: ${p.penalty.mcqFixed !== undefined ? p.penalty.mcqFixed + " mark" : p.penalty.mcqFraction + " × assigned marks"}. MSQ/numeric penalty: ${p.penalty.msq}/${p.penalty.numeric}.`
                      : "Marking policy unresolved."}
                  </p>
                  <a href={p.sourceUrl} target="_blank" rel="noreferrer">
                    Official authority source ↗
                  </a>
                  <p className="small-copy">
                    {p.sourceLocator} · Checked {p.checkedOn}
                  </p>
                  <ul className="unresolved-list">
                    {officialLaunchReadiness(p, null).missing.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                  <button className="button" disabled>
                    Official simulation locked
                  </button>
                  <p className="small-copy">{p.version}</p>
                </div>
              </details>
            ))}
        </aside>
      </div>
    </StudyShell>
  );
}
