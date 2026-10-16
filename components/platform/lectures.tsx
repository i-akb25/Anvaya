"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Play, ArrowRight, ExternalLink, BookOpen } from "lucide-react";
import { exams } from "@/lib/catalog";
import { studyUnits } from "@/lib/platform/content";
import { syllabusUnits } from "@/lib/platform/syllabus";
import {
  lectureTopics,
  lectureResources,
  filterLectureTopics,
  resourcesForTopic,
  lectureKey,
  youtubeEmbed,
  verificationLabel,
  type LectureTopic,
} from "@/lib/platform/lectures";
import {
  formatPosition,
  parsePosition,
  saveLectureProgress,
  type LectureState,
} from "@/lib/platform/lecture-progress";
import {
  emptyVault,
  readVault,
  saveVault,
  type LearningVault,
} from "@/lib/platform/vault";
import { StudyShell } from "../study-shell";
const subjects = [...new Set(lectureTopics.map((t) => t.subject))].sort();
const publishers = [
  ...new Set(lectureResources.map((r) => r.publisher)),
].sort();
export function LectureLibrary() {
  const [exam, setExam] = useState("all"),
    [subject, setSubject] = useState("all"),
    [query, setQuery] = useState(""),
    [language, setLanguage] = useState("all"),
    [publisher, setPublisher] = useState("all"),
    [availability, setAvailability] = useState("all"),
    [syllabusId, setSyllabus] = useState("all"),
    [limit, setLimit] = useState(12);
  const [vault, setVault] = useState<LearningVault>(emptyVault()),
    [status, setStatus] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(location.search),
      ex = q.get("exam");
    if (exams.some((e) => e.id === ex)) setExam(ex!);
    if (subjects.includes(q.get("subject") ?? ""))
      setSubject(q.get("subject")!);
    const row = syllabusUnits.find((r) => r.id === q.get("syllabus"));
    if (row) {
      setExam(row.examId);
      setSyllabus(row.id);
    }
    try {
      setVault(readVault());
    } catch (e) {
      setStatus((e as Error).message);
    }
  }, []);
  useEffect(() => {
    setLimit(12);
  }, [exam, subject, query, language, publisher, availability, syllabusId]);
  const rows = filterLectureTopics({
    exam,
    subject,
    query,
    language,
    publisher,
    availability,
    syllabusId,
  });
  const resume = Object.entries(vault.lectures ?? {})
    .filter(
      ([key, v]) =>
        v.status === "watching" &&
        (exam === "all" || key.startsWith(`${exam}:`)),
    )
    .sort((a, b) => b[1].updatedAt.localeCompare(a[1].updatedAt))
    .flatMap(([key, v]) => {
      const [examId, topicId, resourceId] = key.split(":"),
        topic = lectureTopics.find(
          (t) =>
            t.id === topicId &&
            t.exams.includes(examId) &&
            t.resourceIds.includes(resourceId),
        ),
        resource = lectureResources.find((r) => r.id === resourceId);
      return topic && resource ? [{ topic, resource, examId, v }] : [];
    })
    .slice(0, 3);
  function clear() {
    setExam("all");
    setSubject("all");
    setQuery("");
    setLanguage("all");
    setPublisher("all");
    setAvailability("all");
    setSyllabus("all");
  }
  return (
    <StudyShell>
      <div className="page-heading lecture-heading">
        <span className="eyebrow">A TEACHER FOR THE NEXT CONCEPT</span>
        <h1>
          Watch. Work it out.
          <br />
          Make it yours.
        </h1>
        <p>
          Topic-wise lecture selections from publishers, connected to your notes
          and practice. {lectureResources.length} distinct links across{" "}
          {lectureTopics.filter((t) => t.resourceIds.length).length} topic
          selections. A course link counts once. This directory does not certify
          complete exam coverage.
        </p>
        <div className="lecture-counts">
          <span>
            <strong>10</strong> exam paths
          </span>
          <span>
            <strong>
              {lectureResources.filter((r) => r.kind === "lecture").length}
            </strong>{" "}
            individual lecture links
          </span>
          <span>
            <strong>
              {lectureTopics.filter((t) => !t.resourceIds.length).length}
            </strong>{" "}
            visible topic gaps
          </span>
        </div>
      </div>
      {resume.length > 0 && (
        <section className="lecture-resume">
          <h2>Continue a lecture</h2>
          {resume.map(({ topic, resource, examId, v }) => (
            <Link
              key={`${examId}:${topic.id}:${resource.id}`}
              href={`/lectures/${topic.id}?exam=${examId}&resource=${resource.id}`}
            >
              <Play size={16} />
              <span>
                <strong>{resource.title}</strong>
                <small>
                  {examId} · saved position {formatPosition(v.seconds)}
                </small>
              </span>
              <ArrowRight size={18} />
            </Link>
          ))}
        </section>
      )}
      <section className="lecture-filters" aria-label="Find lectures">
        <label className="lecture-search">
          <span>
            <Search size={16} /> Search a topic or publisher
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try capacitors, rights, data…"
          />
        </label>
        <label>
          Exam
          <select
            value={exam}
            onChange={(e) => {
              setExam(e.target.value);
              setSyllabus("all");
            }}
          >
            <option value="all">All ten exams</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Subject
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Language
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="all">Any language</option>
            {["English", "Hindi", "Not confirmed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Publisher
          <select
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
          >
            <option value="all">All publishers</option>
            {publishers.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Coverage
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="all">Available selections & gaps</option>
            <option value="available">Has lecture links</option>
            <option value="gaps">Needs curation</option>
          </select>
        </label>
        {exam !== "all" && (
          <label className="lecture-syllabus-filter">
            Syllabus outline section
            <select
              value={syllabusId}
              onChange={(e) => setSyllabus(e.target.value)}
            >
              <option value="all">All sections for this exam</option>
              {syllabusUnits
                .filter((s) => s.examId === exam)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.cycle} · {s.stage} · {s.title}
                  </option>
                ))}
            </select>
          </label>
        )}
        <button className="button" onClick={clear}>
          Reset filters
        </button>
      </section>
      <p className="small-copy">
        {rows.length} matching topics. Language “Not confirmed” means the
        publisher listing did not establish the spoken language. Source checks
        cover listings and metadata; full video playback and teaching quality
        have not been reviewed.
      </p>
      <div className="lecture-topic-list">
        {rows.slice(0, limit).map((t) => {
          const resources = resourcesForTopic(t),
            contexts = exam === "all" ? t.exams : [exam],
            completed = contexts.reduce(
              (sum, ex) =>
                sum +
                t.resourceIds.filter(
                  (id) =>
                    vault.lectures?.[lectureKey(ex, t.id, id)]?.status ===
                    "completed",
                ).length,
              0,
            );
          return (
            <article className="lecture-topic-row" key={t.id}>
              <div className="lecture-topic-symbol">
                {resources.length ? <Play size={22} /> : <BookOpen size={22} />}
              </div>
              <div>
                <span className="eyebrow">{t.subject}</span>
                <h2>
                  <Link
                    href={`/lectures/${t.id}${exam !== "all" ? `?exam=${exam}` : ""}`}
                  >
                    {t.title}
                  </Link>
                </h2>
                <p>{t.scope}</p>
                <div className="lecture-tags">
                  <span>
                    {resources.length
                      ? `${resources.length} source links`
                      : "Curation pending"}
                  </span>
                  {[...new Set(resources.map((r) => r.publisher))].map((p) => (
                    <span key={p}>{p}</span>
                  ))}
                  {completed > 0 && (
                    <span>
                      {completed} marked complete{" "}
                      {exam === "all" ? "across exam contexts" : "in this exam"}
                    </span>
                  )}
                </div>
                <small>
                  {t.exams
                    .map((id) => exams.find((e) => e.id === id)?.name)
                    .join(" · ")}
                </small>
              </div>
              <Link
                className="button"
                href={`/lectures/${t.id}${exam !== "all" ? `?exam=${exam}` : ""}`}
              >
                {resources.length ? "Open topic" : "View gap"}{" "}
                <ArrowRight size={15} />
              </Link>
            </article>
          );
        })}
      </div>
      {!rows.length && (
        <div className="empty-state">
          <h2>No lecture selection matches.</h2>
          <p>
            Try fewer filters. An empty syllabus section means its lectures are
            not curated yet.
          </p>
          <button className="button" onClick={clear}>
            Show all topics
          </button>
        </div>
      )}
      {rows.length > limit && (
        <button className="button primary" onClick={() => setLimit(limit + 12)}>
          Show more topics ({rows.length - limit} remaining)
        </button>
      )}
      <p role="status">{status}</p>
      <section className="editorial-band">
        <h2>Keep the learning connected.</h2>
        <p>
          Publisher videos stay with their publishers. No paid-course copies,
          automatic downloads or implied partnerships. Your lecture notes and
          manually saved positions are stored in this browser and included in
          backups.
        </p>
        <div className="question-actions">
          <Link href="/syllabus">Compare syllabus coverage →</Link>
          <Link href="/courses">Open worked lessons →</Link>
          <Link href="/account">Back up progress →</Link>
        </div>
      </section>
    </StudyShell>
  );
}
const blankState: LectureState = {
  status: "planned",
  seconds: 0,
  note: "",
  updatedAt: "",
};
export function LectureReader({ topic }: { topic: LectureTopic }) {
  const resources = resourcesForTopic(topic);
  const [exam, setExam] = useState(topic.exams[0]),
    [resourceId, setResource] = useState(resources[0]?.id ?? ""),
    [vault, setVault] = useState<LearningVault>(emptyVault()),
    [ready, setReady] = useState(false),
    [status, setStatus] = useState("");
  const [note, setNote] = useState(""),
    [minutes, setMinutes] = useState("0"),
    [seconds, setSeconds] = useState("0"),
    [state, setState] = useState<LectureState["status"]>("planned"),
    [embed, setEmbed] = useState<string | null>(null);
  const resource = resources.find((r) => r.id === resourceId),
    key = resource ? lectureKey(exam, topic.id, resource.id) : "",
    saved = vault.lectures?.[key] ?? blankState;
  const position = parsePosition(minutes, seconds),
    dirty =
      !!resource &&
      (note !== saved.note ||
        state !== saved.status ||
        position !== saved.seconds);
  function fill(v: LearningVault, ex: string, id: string) {
    const value = id
      ? (v.lectures?.[lectureKey(ex, topic.id, id)] ?? blankState)
      : blankState;
    setNote(value.note);
    setState(value.status);
    setMinutes(String(Math.floor(value.seconds / 60)));
    setSeconds(String(value.seconds % 60));
    setEmbed(null);
  }
  useEffect(() => {
    const q = new URLSearchParams(location.search),
      ex = topic.exams.includes(q.get("exam") ?? "")
        ? q.get("exam")!
        : topic.exams[0],
      id = resources.some((r) => r.id === q.get("resource"))
        ? q.get("resource")!
        : (resources[0]?.id ?? "");
    setExam(ex);
    setResource(id);
    try {
      const v = readVault();
      setVault(v);
      fill(v, ex, id);
      setReady(true);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }, [topic]);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  function canLeave() {
    return (
      !dirty ||
      window.confirm("Leave this lecture without saving your changes?")
    );
  }
  function choose(ex: string, id: string) {
    if (!canLeave()) return;
    setExam(ex);
    setResource(id);
    fill(vault, ex, id);
    setStatus("");
  }
  function persist(advance = false) {
    if (!resource || !ready) return;
    if (position === null) {
      setStatus(
        "Enter a valid position: whole minutes and 0–59 seconds, up to 24 hours.",
      );
      return;
    }
    try {
      const next = saveVault(
        saveLectureProgress(vault, exam, topic.id, resource.id, {
          status: state,
          note,
          seconds: position,
          updatedAt: new Date().toISOString(),
        }),
        vault.revision,
      );
      setVault(next);
      setStatus(
        "Saved in this browser. Export a backup to keep a separate copy.",
      );
      const nextResource =
        resources[resources.findIndex((r) => r.id === resource.id) + 1];
      if (advance && nextResource) {
        setResource(nextResource.id);
        fill(next, exam, nextResource.id);
      }
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  function reload() {
    if (!canLeave()) return;
    try {
      const v = readVault();
      setVault(v);
      fill(v, exam, resourceId);
      setReady(true);
      setStatus("Loaded the latest saved data.");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  const lesson = studyUnits.find(
      (u) => u.slug === topic.lessonSlug && u.exams.includes(exam),
    ),
    index = resources.findIndex((r) => r.id === resourceId),
    completed = resources.filter(
      (r) =>
        vault.lectures?.[lectureKey(exam, topic.id, r.id)]?.status ===
        "completed",
    ).length;
  return (
    <StudyShell>
      <div className="breadcrumbs">
        <Link
          href={`/lectures?exam=${exam}`}
          onClick={(e) => {
            if (!canLeave()) e.preventDefault();
          }}
        >
          Lecture library
        </Link>{" "}
        / {topic.subject}
      </div>
      <div className="page-heading">
        <span className="eyebrow">TOPIC-WISE LECTURES</span>
        <h1>{topic.title}</h1>
        <p>{topic.scope}</p>
      </div>
      <div className="lecture-reader-layout">
        <aside className="lecture-outline">
          <label>
            Exam context
            <select
              value={exam}
              onChange={(e) => choose(e.target.value, resourceId)}
            >
              {topic.exams.map((id) => (
                <option key={id} value={id}>
                  {exams.find((e) => e.id === id)?.name}
                </option>
              ))}
            </select>
          </label>
          <p>
            {completed}/{resources.length} resources marked complete in this
            exam. Self-reported, not a mastery score.
          </p>
          <ol>
            {resources.map((r, i) => (
              <li key={r.id}>
                <button
                  aria-current={r.id === resourceId ? "step" : undefined}
                  onClick={() => choose(exam, r.id)}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    {r.title}
                    <small>
                      {r.publisher} · {r.kind}
                      {vault.lectures?.[lectureKey(exam, topic.id, r.id)]
                        ?.status === "completed"
                        ? " · Complete"
                        : ""}
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <Link
            href={`/syllabus?exam=${exam}`}
            onClick={(e) => {
              if (!canLeave()) e.preventDefault();
            }}
          >
            Compare with exam syllabus →
          </Link>
        </aside>
        <article className="lecture-workspace">
          {!resource ? (
            <div className="empty-state">
              <h2>Lecture curation is pending.</h2>
              <p>
                This topic remains in scope. There is no verified lecture
                selection here yet.
              </p>
              <Link href={`/lectures?exam=${exam}`}>
                Browse available selections →
              </Link>
            </div>
          ) : (
            <>
              <div className="lecture-resource-heading">
                <span className="eyebrow">
                  RESOURCE {index + 1} OF {resources.length} · {resource.kind}
                </span>
                <h2>{resource.title}</h2>
                <p>
                  {resource.publisher} ·{" "}
                  {resource.language === "Not confirmed"
                    ? "Spoken language not confirmed"
                    : resource.language}
                </p>
                <p className="small-copy">
                  {verificationLabel(resource)} · Checked {resource.checkedOn}.
                  Playback, captions and complete teaching content have not been
                  reviewed.
                </p>
              </div>
              <div className="lecture-player">
                {embed ? (
                  <>
                    <iframe
                      key={embed}
                      src={embed}
                      title={resource.title}
                      allow="encrypted-media; picture-in-picture; fullscreen"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                    <button className="button" onClick={() => setEmbed(null)}>
                      Close external player
                    </button>
                  </>
                ) : (
                  <div className="lecture-player-prompt">
                    <Play size={36} />
                    <h3>
                      {resource.youtubeId
                        ? "Ready when you are."
                        : "Watch with the publisher."}
                    </h3>
                    <p>
                      {resource.youtubeId
                        ? "Load the YouTube privacy-enhanced player only when you choose. Loading it connects your browser to YouTube. Playback remains subject to the publisher’s availability."
                        : "This resource opens on its publisher’s website. Course and collection pages contain their own lecture order."}
                    </p>
                    <div className="question-actions">
                      {resource.youtubeId && (
                        <button
                          className="button primary"
                          onClick={() => {
                            if (position === null) {
                              setStatus(
                                "Correct the saved-position fields before loading the player.",
                              );
                              return;
                            }
                            setEmbed(youtubeEmbed(resource, position));
                          }}
                        >
                          Load video
                          {position ? ` at ${formatPosition(position)}` : ""}
                        </button>
                      )}
                      <a
                        className="button"
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open {resource.publisher} <ExternalLink size={15} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open this resource on {resource.publisher} ↗
                </a>
              </p>
              <p className="small-copy">
                If playback is blocked, open the publisher link or choose
                another resource. Loading a video does not mark it watched. Mark
                unavailable below to keep a private reminder.
              </p>
              <details className="lecture-source-details">
                <summary>Source and access details</summary>
                <p>
                  Link provenance:{" "}
                  <a
                    href={resource.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    publisher source ↗
                  </a>
                  .{" "}
                  {resource.verification === "publisher-indexed"
                    ? "Metadata was available in the publisher’s search listing; full page rendering was limited."
                    : resource.kind === "course"
                      ? "The course title and faculty listing were checked. Lecture-player access was not confirmed."
                      : "The publisher page lists this resource. End-to-end playback was not confirmed."}
                </p>
                <p>
                  Publisher terms apply. No affiliation is implied. Videos,
                  transcripts and paid material are not copied into Anvaya.
                  External providers may show ads, require cookies or change
                  access.
                </p>
              </details>
              <section className="lecture-notebook">
                <span className="eyebrow">PAUSE. EXPLAIN. APPLY.</span>
                <h2>Make a useful note.</h2>
                <p>
                  After watching, write the idea in your own words and work
                  through an example. Saved positions are entered manually;
                  Anvaya does not track the external player.
                </p>
                <label htmlFor="lecture-note">
                  My explanation
                  <textarea
                    id="lecture-note"
                    disabled={!ready}
                    maxLength={20000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Key idea, worked steps, doubt to revisit…"
                  />
                </label>
                <div className="lecture-save-fields">
                  <fieldset>
                    <legend>Resume position</legend>
                    <label>
                      Minutes
                      <input
                        inputMode="numeric"
                        value={minutes}
                        disabled={!ready}
                        onChange={(e) => setMinutes(e.target.value)}
                        maxLength={4}
                      />
                    </label>
                    <label>
                      Seconds
                      <input
                        inputMode="numeric"
                        value={seconds}
                        disabled={!ready}
                        onChange={(e) => setSeconds(e.target.value)}
                        maxLength={2}
                      />
                    </label>
                  </fieldset>
                  <label>
                    My status
                    <select
                      disabled={!ready}
                      value={state}
                      onChange={(e) =>
                        setState(e.target.value as LectureState["status"])
                      }
                    >
                      <option value="planned">Plan to watch</option>
                      <option value="watching">Watching</option>
                      <option value="completed">
                        I finished this resource
                      </option>
                      <option value="unavailable">Unavailable for me</option>
                    </select>
                  </label>
                </div>
                <div className="question-actions">
                  <button
                    className="button primary"
                    disabled={!ready}
                    onClick={() => persist()}
                  >
                    Save notes & progress
                  </button>
                  {index < resources.length - 1 && (
                    <button
                      className="button"
                      disabled={!ready}
                      onClick={() => persist(true)}
                    >
                      Save & next resource →
                    </button>
                  )}
                  <button className="button" onClick={reload}>
                    Reload saved data
                  </button>
                </div>
                <p role="status" aria-live="polite">
                  {status}
                </p>
              </section>
              {lesson && (
                <section className="editorial-band">
                  <h2>Now apply the concept.</h2>
                  <p>
                    Use the original worked lesson and concept practice, then
                    recall it tomorrow.
                  </p>
                  <div className="question-actions">
                    <Link
                      href={`/courses/${lesson.slug}?exam=${exam}`}
                      onClick={(e) => {
                        if (!canLeave()) e.preventDefault();
                      }}
                    >
                      Worked lesson →
                    </Link>
                    <Link
                      href={`/assessments?topic=${lesson.slug}&exam=${exam}`}
                      onClick={(e) => {
                        if (!canLeave()) e.preventDefault();
                      }}
                    >
                      Practise this topic →
                    </Link>
                    <Link
                      href={`/recall?exam=${exam}`}
                      onClick={(e) => {
                        if (!canLeave()) e.preventDefault();
                      }}
                    >
                      Recall queue →
                    </Link>
                  </div>
                </section>
              )}
            </>
          )}
        </article>
      </div>
    </StudyShell>
  );
}
