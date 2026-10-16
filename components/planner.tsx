"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Download, Upload, Check } from "lucide-react";
import { exams } from "@/lib/catalog";
import {
  emptyWorkspace,
  readWorkspace,
  saveWorkspace,
  saveTaskEdit,
  validWorkspace,
  type Workspace,
} from "@/lib/workspace";
import { StudyShell } from "./study-shell";
export function Planner() {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<Workspace>(emptyWorkspace),
    [title, setTitle] = useState(""),
    [exam, setExam] = useState("upsc"),
    [date, setDate] = useState(""),
    [status, setStatus] = useState(""),
    [pending, setPending] = useState<Workspace | null>(null),
    [filter, setFilter] = useState("all");
  useEffect(() => {
    try {
      setData(readWorkspace());
      setReady(true);
    } catch {
      setStatus(
        "Saved workspace could not be read. Export raw recovery data before replacing it.",
      );
    }
    const q = new URLSearchParams(location.search);
    setTitle((q.get("subject") ?? "").slice(0, 500));
    if (exams.some((e) => e.id === q.get("exam"))) setExam(q.get("exam")!);
    setDate(new Date().toLocaleDateString("en-CA"));
  }, []);
  function update(next: Workspace, replace = false) {
    try {
      const value = replace ? next : saveTaskEdit(data, next);
      if (replace) saveWorkspace(value);
      setData(value);
      setReady(true);
      setStatus("Saved on this device");
      return true;
    } catch (e) {
      setStatus((e as Error).message);
      return false;
    }
  }
  function rawBackup() {
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([localStorage.getItem("anvaya-workspace-v1") ?? ""], {
          type: "application/json",
        }),
      );
      a.download = "anvaya-raw-recovery.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      setStatus("Browser storage is unavailable.");
    }
  }
  function backup() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    a.download = "anvaya-workspace-backup.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  async function restore(file?: File) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setStatus("Backup must be smaller than 10 MB.");
      return;
    }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!validWorkspace(parsed)) throw Error();
      setPending(parsed);
      setStatus("");
    } catch {
      setStatus(
        "This is not a valid workspace backup. Your existing data is unchanged.",
      );
    }
  }
  const tasks = data.tasks.filter(
    (t) => filter === "all" || (filter === "done" ? t.done : !t.done),
  );
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">MAKE ROOM FOR PROGRESS</span>
        <h1>A plan you can return to.</h1>
        <p>
          Set a small objective, work through it, then come back tomorrow. Plans
          and paper notes are stored in this browser.
        </p>
      </div>
      <div className="planner-layout">
        <section>
          <form
            className="task-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!ready || !title.trim() || data.tasks.length >= 1000) return;
              const saved = update({
                ...data,
                tasks: [
                  ...data.tasks,
                  {
                    id: crypto.randomUUID(),
                    title: title.trim(),
                    exam,
                    date,
                    done: false,
                  },
                ],
              });
              if (saved) setTitle("");
            }}
          >
            <label>
              What will you work on?
              <input
                required
                maxLength={500}
                placeholder="Revise constitutional bodies, solve one paper…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <div className="form-row">
              <label>
                Exam
                <select value={exam} onChange={(e) => setExam(e.target.value)}>
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Study date
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <button disabled={!ready} className="button primary">
                <Plus size={17} /> Add session
              </button>
            </div>
          </form>
          <div className="section-heading">
            <h2>My sessions</h2>
            <button
              className="button"
              onClick={() => {
                try {
                  setData(readWorkspace());
                  setReady(true);
                  setStatus("Latest saved plan loaded.");
                } catch (e) {
                  setStatus((e as Error).message);
                }
              }}
            >
              Reload plan
            </button>
            <select
              aria-label="Filter study sessions"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All sessions</option>
              <option value="todo">To do</option>
              <option value="done">Completed</option>
            </select>
          </div>
          {tasks.length ? (
            <div className="task-list">
              {tasks.map((t) => (
                <article className={t.done ? "task done" : "task"} key={t.id}>
                  <button
                    className="task-check"
                    aria-label={`${t.done ? "Reopen" : "Complete"} ${t.title}`}
                    onClick={() =>
                      update({
                        ...data,
                        tasks: data.tasks.map((v) =>
                          v.id === t.id ? { ...v, done: !v.done } : v,
                        ),
                      })
                    }
                  >
                    {t.done && <Check size={17} />}
                  </button>
                  <div>
                    <h3>{t.title}</h3>
                    <p>
                      {exams.find((e) => e.id === t.exam)?.name ?? t.exam} ·{" "}
                      {t.date}
                    </p>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={`Delete ${t.title}`}
                    onClick={() =>
                      update({
                        ...data,
                        tasks: data.tasks.filter((v) => v.id !== t.id),
                      })
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Your next step starts here.</h3>
              <p>Add one focused study session above.</p>
            </div>
          )}
        </section>
        <aside>
          <div className="panel">
            <span className="eyebrow">YOUR ROUTINE</span>
            <strong className="progress-number">
              {data.tasks.filter((t) => t.done).length}
              <small> / {data.tasks.length}</small>
            </strong>
            <p>Study sessions completed</p>
            <div className="progress-track">
              <span
                style={{
                  width: `${data.tasks.length ? (data.tasks.filter((t) => t.done).length / data.tasks.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="panel">
            <h3>Keep a copy.</h3>
            <p>
              Export plans, paper notes and study time together. This backup is
              separate from the earlier practice-results backup.
            </p>
            <button disabled={!ready} className="button" onClick={backup}>
              <Download size={16} /> Export workspace
            </button>
            {!ready && (
              <button className="button" onClick={rawBackup}>
                Export raw recovery data
              </button>
            )}
            <label className="button">
              <Upload size={16} /> Import backup
              <input
                className="visually-hidden"
                type="file"
                accept="application/json,.json"
                onChange={(e) => {
                  restore(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {pending && (
              <div className="restore-confirm">
                <p>
                  Replace this workspace with {pending.tasks.length} sessions
                  and {Object.keys(pending.papers).length} paper notebooks?
                  Export your current data first.
                </p>
                <button
                  className="button primary"
                  onClick={() => {
                    update(pending, true);
                    setPending(null);
                  }}
                >
                  Replace workspace
                </button>
                <button className="button" onClick={() => setPending(null)}>
                  Cancel
                </button>
              </div>
            )}
            <p role="status" className="small-copy">
              {status}
            </p>
          </div>
        </aside>
      </div>
    </StudyShell>
  );
}
