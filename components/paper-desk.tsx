"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Play, Pause, FileUp, Download } from "lucide-react";
import { listPrivateFiles, savePrivatePdf } from "@/lib/platform/private-files";
import { materials } from "@/lib/materials";
import { readWorkspace, savePaperEdit, type PaperNote } from "@/lib/workspace";
import { StudyShell } from "./study-shell";
export function PaperDesk({ id }: { id: string }) {
  const material = materials.find((m) => m.id === id),
    [url, setUrl] = useState(""),
    [filename, setFilename] = useState(""),
    [text, setText] = useState(""),
    [seconds, setSeconds] = useState(0),
    [running, setRunning] = useState(false),
    [ready, setReady] = useState(false),
    [status, setStatus] = useState(""),
    blob = useRef("");
  const savedNote = useRef<PaperNote | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    listPrivateFiles()
      .then((files) => {
        const file = files.find((f) => f.id === `paper-${id}`);
        if (file && !cancelled) {
          blob.current = URL.createObjectURL(file.blob);
          setUrl(blob.current);
          setFilename(file.name);
        }
      })
      .catch(() =>
        setStatus(
          "Saved PDF could not be loaded. Notes remain available; reselect your original file.",
        ),
      );
    try {
      const note = readWorkspace().papers[id];
      savedNote.current = note;
      setText(note?.text ?? "");
      setSeconds(note?.seconds ?? 0);
      setReady(true);
    } catch {
      setStatus(
        "Saved workspace could not be read. Recover it from the planner before adding notes.",
      );
    }
    return () => {
      cancelled = true;
      if (blob.current) URL.revokeObjectURL(blob.current);
    };
  }, [id]);
  useEffect(() => {
    if (!running) return;
    const started = Date.now(),
      base = seconds;
    const timer = setInterval(
      () => setSeconds(base + Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (!ready) return;
    try {
      savedNote.current = savePaperEdit(id, savedNote.current, {
        text,
        seconds,
      });
      setStatus("Saved on this device");
    } catch (e) {
      setReady(false);
      setRunning(false);
      setStatus((e as Error).message + " Export your notes before leaving.");
    }
  }, [text, seconds, id, ready]);
  async function upload(file?: File) {
    if (!file) return;
    try {
      await savePrivatePdf(file, `paper-${id}`);
      if (blob.current) URL.revokeObjectURL(blob.current);
      blob.current = URL.createObjectURL(file);
      setUrl(blob.current);
      setFilename(file.name);
      setStatus("PDF saved privately on this browser; available after reload.");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  function exportNotes() {
    const file = new Blob(
      [
        `${material?.title ?? "Private paper study"}\nStudy time: ${seconds} seconds\n\n${text}`,
      ],
      { type: "text/plain" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = `anvaya-${id}-notes.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  return (
    <StudyShell>
      <div className="breadcrumbs">
        <Link href="/papers">Paper library</Link> / Study desk ·{" "}
        <Link href="/library">Saved private PDFs</Link>
      </div>
      <div className="desk-title">
        <div>
          <span className="eyebrow">READ · WORK · RECALL</span>
          <h1>{material?.title ?? "Your private paper desk"}</h1>
          <p>
            Open the official paper, then choose its downloaded PDF to study
            here. Your file stays on this device.
          </p>
        </div>
        <div className="study-timer">
          <span>
            {String(Math.floor(seconds / 3600)).padStart(2, "0")}:
            {String(Math.floor(seconds / 60) % 60).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </span>
          <button
            className="button"
            disabled={!ready}
            onClick={() => setRunning(!running)}
          >
            {running ? <Pause size={16} /> : <Play size={16} />}{" "}
            {running ? "Pause" : "Start session"}
          </button>
          <small>Study timer · not an exam simulation</small>
        </div>
      </div>
      <div className="paper-source-bar">
        {material && (
          <>
            <a href={material.url} target="_blank" rel="noreferrer">
              Official question paper ↗
            </a>
            {material.keyUrl && (
              <a href={material.keyUrl} target="_blank" rel="noreferrer">
                Official answer key ↗
              </a>
            )}
          </>
        )}
        <label className="button">
          <FileUp size={17} /> Choose local PDF
          <input
            className="visually-hidden"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </label>
      </div>
      <p>
        <button
          className="button"
          onClick={() => {
            if (
              text !== (savedNote.current?.text ?? "") &&
              !confirm(
                "Discard the unsaved paper-note draft and load the saved copy?",
              )
            )
              return;
            try {
              const note = readWorkspace().papers[id];
              savedNote.current = note;
              setText(note?.text ?? "");
              setSeconds(note?.seconds ?? 0);
              setRunning(false);
              setReady(true);
              setStatus("Latest saved paper notes loaded.");
            } catch (e) {
              setStatus((e as Error).message);
            }
          }}
        >
          Reload saved paper notes
        </button>
      </p>
      <div className="reader-layout">
        <section className="pdf-area">
          {url ? (
            <>
              <div className="pdf-filename">
                {filename} ·{" "}
                <a href={url} target="_blank" rel="noreferrer">
                  Open in browser ↗
                </a>
              </div>
              <iframe title="Your selected PDF" src={url} />
            </>
          ) : (
            <div className="pdf-empty">
              <FileUp size={42} strokeWidth={1} />
              <h2>Your paper, your pace.</h2>
              <p>
                Choose a PDF above to read it beside your notes. No upload, no
                account required.
              </p>
              <small>
                Saved PDFs reopen after reload. Up to20 MB each; browser cleanup
                can remove them. Download independent copies; account JSON
                backups exclude PDF bytes.
              </small>
            </div>
          )}
        </section>
        <aside className="recall-panel">
          <span className="eyebrow">YOUR RECALL NOTES</span>
          <h2>What did you learn?</h2>
          <p>
            Record question numbers, your approach, mistakes and ideas to
            revisit.
          </p>
          <label className="visually-hidden" htmlFor="paper-notes">
            Paper notes
          </label>
          <textarea
            disabled={!ready}
            id="paper-notes"
            value={text}
            maxLength={100000}
            onChange={(e) => setText(e.target.value)}
            placeholder="Q12 — I mixed up…&#10;Key idea — …&#10;Revisit — …"
          />
          <span role="status" className="muted">
            {status}
          </span>
          <button className="button" onClick={exportNotes}>
            <Download size={16} /> Export notes
          </button>
          <p className="small-copy">
            Use the official key for self-review. Anvaya does not assign a score
            or infer missing solutions.
          </p>
        </aside>
      </div>
    </StudyShell>
  );
}
