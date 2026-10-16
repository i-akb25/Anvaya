"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StudyShell } from "../study-shell";
import {
  listPrivateFiles,
  savePrivatePdf,
  deletePrivateFile,
  type PrivateFile,
} from "@/lib/platform/private-files";
export function FileLibrary() {
  const [files, setFiles] = useState<PrivateFile[]>([]),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [url, setUrl] = useState(""),
    [selected, setSelected] = useState("");
  async function reload() {
    try {
      setFiles(await listPrivateFiles());
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  useEffect(() => {
    reload();
  }, []);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      await savePrivatePdf(file);
      await reload();
      setStatus(
        "PDF saved on this browser. It will be available after reload.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(file: PrivateFile) {
    if (
      !confirm(
        `Permanently remove ${file.name} from this browser? Download an independent copy first.`,
      )
    )
      return;
    try {
      await deletePrivateFile(file.id);
      if (selected === file.id) {
        setSelected("");
        setUrl("");
      }
      await reload();
      setStatus("Local file removed.");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  function download(file: PrivateFile) {
    const u = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">YOUR PRIVATE READING SHELF</span>
        <h1>Keep your material close.</h1>
        <p>
          Save permitted PDFs in this browser, reopen them after refresh and
          keep an independent downloaded copy. No file is uploaded to a server.
        </p>
      </div>
      <div className="content-provenance">
        <strong>Device storage, not cloud backup</strong>
        <p>
          20 files maximum, 20 MB each, 60 MB total. Browser cleanup can erase
          them. The account JSON backup contains study data and does not contain
          these PDF bytes. Download each original before clearing browser data.
        </p>
      </div>
      <div className="question-actions">
        <label className="button">
          Save private PDF
          <input
            aria-label="Save private PDF"
            type="file"
            accept="application/pdf,.pdf"
            disabled={busy}
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        <button className="button" onClick={reload}>
          Reload files
        </button>
        <Link href="/account">Back up notes →</Link>
      </div>
      <p role="status">{status}</p>
      <p>
        {files.length}/20 files ·{" "}
        {(files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(1)} MB
        saved
      </p>
      {!files.length && (
        <p className="empty-state">No saved PDFs yet. Choose a file above.</p>
      )}
      <div className="search-results">
        {files.map((file) => (
          <article className="search-result" key={file.id}>
            <h2>{file.name}</h2>
            <p>
              {(file.size / 1024 / 1024).toFixed(2)} MB · Saved{" "}
              {file.savedAt.slice(0, 10)}
            </p>
            <details>
              <summary>File fingerprint</summary>
              <p className="file-fingerprint">SHA-256: {file.sha256}</p>
            </details>
            <div className="question-actions">
              <button
                className="button"
                onClick={() => {
                  setSelected(file.id);
                  setUrl(URL.createObjectURL(file.blob));
                }}
              >
                Read PDF
              </button>
              <button className="button" onClick={() => download(file)}>
                Download original
              </button>
              <button className="button" onClick={() => remove(file)}>
                Remove local file
              </button>
            </div>
          </article>
        ))}
      </div>
      {url && (
        <section className="pdf-area">
          <h2>{files.find((f) => f.id === selected)?.name}</h2>
          <a href={url} target="_blank" rel="noreferrer">
            Open PDF in browser ↗
          </a>
          <iframe src={url} title="Saved private PDF" />
        </section>
      )}
    </StudyShell>
  );
}
