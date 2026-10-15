export function sameOrigin(origin: string | null, expected: string) {
  try {
    return !!origin && new URL(origin).origin === new URL(expected).origin;
  } catch {
    return false;
  }
}
export function allowedOwner(
  userId: string | undefined,
  ownerId: string | undefined,
) {
  return !!ownerId && /^[0-9a-f-]{36}$/i.test(ownerId) && userId === ownerId;
}
export function parseRevision(raw: unknown) {
  return Number.isSafeInteger(raw) && Number(raw) >= 0 ? Number(raw) : null;
}
