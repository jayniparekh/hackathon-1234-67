import type { EditRecord } from "./db";

export function applyEdits(content: string, edits: EditRecord[]): string {
  let result = content;
  for (const edit of edits) {
    const idx = result.indexOf(edit.original);
    if (idx !== -1) {
      result = result.slice(0, idx) + edit.enhanced + result.slice(idx + edit.original.length);
    }
  }
  return result;
}
