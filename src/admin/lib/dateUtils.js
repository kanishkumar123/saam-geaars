// Shared date helpers — every displayed date in the app uses DD/MM/YYYY.
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
}

// Accepts an ISO "YYYY-MM-DD" string, returns "DD/MM/YYYY".
export function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export const DUE_SOON_DAYS = 7;

// Parses a user-typed date fragment (matching the app's DD/MM/YYYY display
// format) into an inclusive ISO date range for a backend gte/lte query.
// Accepts a full date, a MM/YYYY month, or a bare YYYY year; anything else
// (including free text like a company name) returns null so the caller can
// skip the date branch of a search.
export function parseDateFragmentToRange(q) {
  const trimmed = q.trim();

  let m = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
    return { gte: iso, lte: iso };
  }

  m = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, mo, y] = m;
    const monthNum = Number(mo);
    if (monthNum < 1 || monthNum > 12) return null;
    const gte = `${y}-${mo.padStart(2, "0")}-01`;
    const lastDay = new Date(Number(y), monthNum, 0).getDate();
    const lte = `${y}-${mo.padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return { gte, lte };
  }

  m = trimmed.match(/^(\d{4})$/);
  if (m) {
    const [, y] = m;
    return { gte: `${y}-01-01`, lte: `${y}-12-31` };
  }

  return null;
}
