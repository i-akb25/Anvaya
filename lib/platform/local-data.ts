import {
  emptyVault,
  readVault,
  validPayload,
  vaultKey,
  type SyncPayload,
} from "./vault.ts";
import { workspaceKey } from "../workspace.ts";
export function restoreLocalPayload(payload: SyncPayload) {
  if (!validPayload(payload))
    throw Error("Backup failed validation. Nothing was replaced.");
  let revision = Date.now();
  try {
    const current = readVault();
    revision = current.revision;
    if (current.active)
      throw Error(
        "Finish the active practice attempt before restoring a workspace.",
      );
  } catch (e) {
    if ((e as Error).message.startsWith("Finish")) throw e;
  }
  const oldLearning = localStorage.getItem(vaultKey),
    oldWorkspace = localStorage.getItem(workspaceKey);
  try {
    localStorage.setItem(workspaceKey, JSON.stringify(payload.workspace));
    localStorage.setItem(
      vaultKey,
      JSON.stringify({ ...payload.learning, revision: revision + 1 }),
    );
  } catch {
    try {
      if (oldWorkspace === null) localStorage.removeItem(workspaceKey);
      else localStorage.setItem(workspaceKey, oldWorkspace);
      if (oldLearning === null) localStorage.removeItem(vaultKey);
      else localStorage.setItem(vaultKey, oldLearning);
    } catch {
      throw Error(
        "Restore failed and automatic rollback could not finish. Keep your backup and raw recovery files; do not continue editing until recovered.",
      );
    }
    throw Error("Restore failed. Your previous workspace was restored.");
  }
}
export function clearLocalLearning() {
  let revision = Date.now();
  try {
    revision = readVault().revision;
  } catch {}
  localStorage.setItem(
    vaultKey,
    JSON.stringify({ ...emptyVault(), revision: revision + 1 }),
  );
  localStorage.removeItem(workspaceKey);
}
