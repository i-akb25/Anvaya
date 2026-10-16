export type Task = {
  id: string;
  title: string;
  exam: string;
  date: string;
  done: boolean;
};
export type PaperNote = { text: string; seconds: number };
export type Workspace = {
  version: 1;
  tasks: Task[];
  papers: Record<string, PaperNote>;
};
export const emptyWorkspace: Workspace = { version: 1, tasks: [], papers: {} };
export const workspaceKey = "anvaya-workspace-v1";
export function validWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== "object") return false;
  const v = value as Workspace;
  return (
    v.version === 1 &&
    Array.isArray(v.tasks) &&
    v.tasks.length <= 1000 &&
    new Set(v.tasks.map((t) => t?.id)).size === v.tasks.length &&
    v.tasks.every(
      (t) =>
        t &&
        typeof t.id === "string" &&
        t.id.length < 100 &&
        typeof t.title === "string" &&
        t.title.length <= 500 &&
        typeof t.exam === "string" &&
        typeof t.date === "string" &&
        typeof t.done === "boolean",
    ) &&
    !!v.papers &&
    typeof v.papers === "object" &&
    !Array.isArray(v.papers) &&
    Object.keys(v.papers).length <= 500 &&
    Object.entries(v.papers).every(
      ([k, p]) =>
        !["__proto__", "constructor", "prototype"].includes(k) &&
        p &&
        typeof p.text === "string" &&
        p.text.length <= 100000 &&
        Number.isSafeInteger(p.seconds) &&
        p.seconds >= 0,
    )
  );
}
export function readWorkspace(): Workspace {
  const raw = localStorage.getItem(workspaceKey);
  if (!raw) return structuredClone(emptyWorkspace);
  const parsed: unknown = JSON.parse(raw);
  if (!validWorkspace(parsed))
    throw new Error(
      "Saved workspace is invalid. Export raw recovery data before replacing it.",
    );
  return parsed;
}
export function saveWorkspace(value: Workspace) {
  if (!validWorkspace(value)) throw new Error("Invalid workspace");
  localStorage.setItem(workspaceKey, JSON.stringify(value));
}

// Preserve paper edits while rejecting a planner tab with an outdated task list.
export function saveTaskEdit(expected: Workspace, next: Workspace): Workspace {
  const current = readWorkspace();
  if (JSON.stringify(current.tasks) !== JSON.stringify(expected.tasks))
    throw new Error(
      "Study sessions changed in another tab. Reload before editing the plan.",
    );
  const value = { ...next, papers: current.papers };
  saveWorkspace(value);
  return value;
}
