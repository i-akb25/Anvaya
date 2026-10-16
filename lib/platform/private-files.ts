/** Browser-only PDF storage. Bytes never enter the learning vault or cloud sync. */
export const fileLimits = {
  perFile: 20 * 1024 * 1024,
  total: 60 * 1024 * 1024,
  count: 20,
};
export type PrivateFile = {
  id: string;
  name: string;
  size: number;
  sha256: string;
  savedAt: string;
  blob: Blob;
};
export function validatePdfHeader(bytes: Uint8Array, size: number) {
  if (
    !Number.isSafeInteger(size) ||
    size < 5 ||
    size > fileLimits.perFile ||
    new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-"
  )
    throw Error(
      "Choose a valid PDF up to 20 MB. Renaming a file does not make it a PDF.",
    );
}
async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("anvaya-private-files-v1", 1);
    req.onupgradeneeded = () =>
      req.result.createObjectStore("files", { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(Error("Private file storage is unavailable."));
    req.onblocked = () =>
      reject(Error("Close other Anvaya tabs before opening file storage."));
  });
}
async function transaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore, result: (value: T) => void) => void,
) {
  const db = await database();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction("files", mode);
    let value: T;
    tx.oncomplete = () => {
      db.close();
      resolve(value);
    };
    tx.onabort = tx.onerror = () => {
      db.close();
      reject(
        Error(
          "File storage failed. Existing saved files were not replaced. Check available space.",
        ),
      );
    };
    try {
      run(tx.objectStore("files"), (v) => {
        value = v;
      });
    } catch (e) {
      tx.abort();
      reject(e);
    }
  });
}
export async function listPrivateFiles() {
  return transaction<PrivateFile[]>("readonly", (store, result) => {
    const req = store.getAll();
    req.onsuccess = () => result(req.result);
  });
}
export async function savePrivatePdf(file: File, id = crypto.randomUUID()) {
  if (!/^[a-zA-Z0-9][\w-]{0,99}$/.test(id))
    throw Error("Invalid file identifier.");
  validatePdfHeader(
    new Uint8Array(await file.slice(0, 5).arrayBuffer()),
    file.size,
  );
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer(),
  );
  const item: PrivateFile = {
    id,
    name: file.name.slice(0, 200),
    size: file.size,
    sha256: Array.from(new Uint8Array(digest), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join(""),
    savedAt: new Date().toISOString(),
    blob: file,
  };
  return transaction<PrivateFile>("readwrite", (store, result) => {
    const req = store.getAll();
    req.onsuccess = () => {
      const old = req.result as PrivateFile[];
      const others = old.filter((v) => v.id !== id);
      if (
        others.length >= fileLimits.count ||
        others.reduce((s, v) => s + v.size, 0) + item.size > fileLimits.total
      ) {
        store.transaction.abort();
        return;
      }
      store.put(item);
      result(item);
    };
  });
}
export async function deletePrivateFile(id: string) {
  return transaction<void>("readwrite", (store, result) => {
    store.delete(id);
    result(undefined);
  });
}
