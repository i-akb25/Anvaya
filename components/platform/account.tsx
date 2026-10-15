"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  readVault,
  validPayload,
  vaultKey,
  type SyncPayload,
} from "@/lib/platform/vault";
import { readWorkspace, workspaceKey } from "@/lib/workspace";
import { StudyShell } from "../study-shell";
import {
  restoreLocalPayload,
  clearLocalLearning,
} from "@/lib/platform/local-data";
function download(value: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([value], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function AccountDesk() {
  const [configured, setConfigured] = useState<boolean | null>(null),
    [signedIn, setSignedIn] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [revision, setRevision] = useState<number | null>(null),
    [remote, setRemote] = useState<SyncPayload | null>(null),
    [pending, setPending] = useState<SyncPayload | null>(null),
    [remoteDate, setRemoteDate] = useState("");
  async function account() {
    try {
      const r = await fetch("/api/account", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setConfigured(d.configured);
      setSignedIn(d.signedIn);
    } catch {
      setStatus("Account service unavailable. Local study remains available.");
    }
  }
  useEffect(() => {
    account();
  }, []);
  function snapshot(): SyncPayload {
    return { schema: 1, learning: readVault(), workspace: readWorkspace() };
  }
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signin", email, password }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setPassword("");
      setSignedIn(true);
      setStatus("Signed in. Cloud transfer happens only when you choose it.");
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setPassword("");
      setBusy(false);
    }
  }
  async function loadCloud() {
    setBusy(true);
    try {
      const r = await fetch("/api/sync", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      if (d.record) {
        if (
          !validPayload(d.record.payload) ||
          !Number.isSafeInteger(d.record.revision)
        )
          throw Error("Cloud data failed validation.");
        setRemote(d.record.payload);
        setRevision(d.record.revision);
        setRemoteDate(d.record.updated_at);
        setStatus(
          "Cloud copy loaded for review. Nothing on this device was replaced.",
        );
      } else {
        setRemote(null);
        setRevision(0);
        setRemoteDate("");
        setStatus("No cloud copy yet. You can upload this device's workspace.");
      }
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function push() {
    if (revision === null) return;
    setBusy(true);
    try {
      const payload = snapshot();
      if (new TextEncoder().encode(JSON.stringify(payload)).length > 1900000)
        throw Error(
          "Workspace exceeds the cloud size limit. Export a file backup before reducing saved data.",
        );
      if (!validPayload(payload)) throw Error("Local data failed validation.");
      const r = await fetch("/api/sync", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedRevision: revision, payload }),
      });
      const d = await r.json();
      if (!r.ok) {
        if (r.status === 409) setRevision(null);
        throw Error(d.error);
      }
      setRevision(d.record.revision);
      setRemote(payload);
      setRemoteDate(d.record.updated_at);
      setStatus(
        "Cloud copy saved. Sign in on another device and load it to continue.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      const r = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signout" }),
      });
      if (!r.ok) throw Error();
      setSignedIn(false);
      setRemote(null);
      setRevision(null);
      setStatus("Signed out. Local browser copies remain on this device.");
    } catch {
      setStatus("Sign-out could not be confirmed. Try again.");
    } finally {
      setBusy(false);
    }
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 10000000)
        throw Error("Backup must be smaller than 10 MB.");
      const parsed: unknown = JSON.parse(await file.text());
      if (!validPayload(parsed))
        throw Error("Backup failed validation. No data was changed.");
      setPending(parsed);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  function replace() {
    if (!pending) return;
    try {
      restoreLocalPayload(pending);
      setPending(null);
      setStatus(
        "Workspace restored on this device. An unfinished attempt retains its original deadline. Open Practice and take over the attempt to resume.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">YOUR WORK, WITH YOU</span>
        <h1>Private account & backups.</h1>
        <p>
          Learning notes, completed units, results, writing and study plans can
          move between your devices. Transfers are explicit. Local PDFs and
          attachments are never included.
        </p>
      </div>
      <div className="planner-layout">
        <section>
          <div className="panel">
            <h2>Private sign-in</h2>
            {configured === null ? (
              <p>Checking account availability…</p>
            ) : !configured ? (
              <p>
                Cloud sign-in is turned off for this deployment. Local learning
                and file backups work without an account. Public registration is
                disabled.
              </p>
            ) : signedIn ? (
              <>
                <p>Signed in to the permitted private account.</p>
                <button className="button" disabled={busy} onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <form className="account-form" onSubmit={login}>
                <label>
                  Email
                  <input
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    autoComplete="current-password"
                    minLength={8}
                    maxLength={256}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                <button disabled={busy} className="button primary">
                  Sign in
                </button>
                <p className="small-copy">
                  Only the configured owner can sign in. No account creation is
                  offered.
                </p>
              </form>
            )}
          </div>
          {signedIn && (
            <div className="panel">
              <h2>Cross-device workspace</h2>
              <p>
                First load the cloud version. Review it before replacing either
                copy. A conflicting update is rejected instead of silently
                overwriting another device.
              </p>
              <button className="button" disabled={busy} onClick={loadCloud}>
                Load cloud copy
              </button>
              {revision !== null && (
                <>
                  <p>
                    Cloud revision {revision}
                    {remoteDate
                      ? ` · ${new Date(remoteDate).toLocaleString()}`
                      : ""}
                  </p>
                  {remote && (
                    <p className="small-copy">
                      {remote.learning.completed.length} completed unit contexts
                      · {remote.learning.attempts.length} results ·{" "}
                      {remote.workspace.tasks.length} planned sessions
                    </p>
                  )}
                  <button
                    className="button primary"
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Replace the cloud copy with this device's learning notes, writing, results and plans?",
                        )
                      )
                        push();
                    }}
                  >
                    Upload this device’s copy
                  </button>
                  {remote && (
                    <>
                      <button
                        className="button"
                        disabled={busy}
                        onClick={() => setPending(remote)}
                      >
                        Review cloud restore
                      </button>
                      <button
                        className="button"
                        onClick={() =>
                          download(
                            JSON.stringify(remote, null, 2),
                            "anvaya-cloud-backup.json",
                          )
                        }
                      >
                        Export cloud backup
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
          <p role="status" className="study-status">
            {status}
          </p>
        </section>
        <aside>
          <div className="panel">
            <h2>Independent backup</h2>
            <p>
              Keep a file outside the app. This includes the new learning
              workspace and the paper/planner workspace. Earlier demo/practice
              backups remain separate.
            </p>
            <button
              className="button"
              onClick={() => {
                try {
                  download(
                    JSON.stringify(snapshot(), null, 2),
                    "anvaya-learning-backup.json",
                  );
                  setStatus(
                    "Backup downloaded. Keep it private; it contains your notes and writing.",
                  );
                } catch (e) {
                  setStatus((e as Error).message);
                }
              }}
            >
              Export workspace backup
            </button>
            <label className="button">
              Import backup
              <input
                className="visually-hidden"
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  importFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              className="button"
              onClick={() => {
                try {
                  download(
                    JSON.stringify({
                      learning: localStorage.getItem(vaultKey),
                      workspace: localStorage.getItem(workspaceKey),
                    }),
                    "anvaya-raw-recovery.json",
                  );
                } catch {
                  setStatus("Browser storage is unavailable.");
                }
              }}
            >
              Export raw recovery data
            </button>
            <Link href="/results/legacy">Earlier practice backup →</Link>
          </div>
          <div className="panel">
            <h3>Shared device?</h3>
            <p>
              Signing out ends cloud access but leaves local browser copies.
              Export first, then clear local learning/planner data if needed.
              Original demo history is managed separately.
            </p>
            <button
              className="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Clear the new learning and planner data on this device? Cloud data and old demo history will remain. Export a backup first.",
                  )
                ) {
                  try {
                    clearLocalLearning();
                    setStatus(
                      "Local learning and planner data cleared. Cloud copy is unchanged.",
                    );
                  } catch (e) {
                    setStatus((e as Error).message);
                  }
                }
              }}
            >
              Clear local learning workspace
            </button>
          </div>
        </aside>
      </div>
      {pending && (
        <section
          className="restore-dialog"
          role="dialog"
          aria-modal="false"
          aria-label="Review workspace replacement"
        >
          <h2>Review replacement</h2>
          <p>
            Replace this device’s notes, writing, completed units, results and
            plans with {pending.learning.completed.length} completed contexts,{" "}
            {pending.learning.attempts.length} results and{" "}
            {pending.workspace.tasks.length} sessions? Export your current copy
            first. Close other Anvaya tabs before restoring.
          </p>
          <p>
            An unfinished practice retains its original deadline. It may already
            have expired; the timer never restarts.
          </p>
          <button className="button primary" onClick={replace}>
            Replace this device’s workspace
          </button>
          <button className="button" onClick={() => setPending(null)}>
            Cancel
          </button>
        </section>
      )}
    </StudyShell>
  );
}
