// Phase 5 — match logic for upsert during import.

export function normalizeFullName(
  firstName: string,
  lastName: string | null | undefined,
): string {
  return `${firstName.trim()} ${(lastName ?? '').trim()}`.trim().toLowerCase()
}
