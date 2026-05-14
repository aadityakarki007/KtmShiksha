import NepaliDate from "nepali-date-converter";

export function defaultBsYmd() {
  try {
    return NepaliDate.now().format("YYYY-MM-DD");
  } catch {
    return "2081-01-01";
  }
}

export function normalizeBsYmdInput(value) {
  return String(value ?? "")
    .trim()
    .replace(/\//g, "-");
}

export function isValidBsYmd(value) {
  try {
    const normalized = normalizeBsYmdInput(value);
    if (!normalized) return false;
    const nd = new NepaliDate(normalized);
    nd.toJsDate();
    return true;
  } catch {
    return false;
  }
}

/** Gregorian instant → Bikram Sambat YYYY-MM-DD */
export function formatAdAsBsYmd(ad) {
  try {
    const d = ad instanceof Date ? ad : new Date(ad);
    if (Number.isNaN(d.getTime())) return "—";
    return NepaliDate.fromAD(d).format("YYYY-MM-DD");
  } catch {
    return "—";
  }
}

/** Gregorian instant → readable BS label in English month names */
export function formatAdAsBsLongEn(ad) {
  try {
    const d = ad instanceof Date ? ad : new Date(ad);
    if (Number.isNaN(d.getTime())) return "—";
    const nd = NepaliDate.fromAD(d);
    return nd.format("DD MMMM YYYY", "en");
  } catch {
    return "—";
  }
}

/**
 * Bikram Sambat calendar day (YYYY-MM-DD) → start/end of that day in the browser's
 * local timezone, as ISO strings (for API filters).
 */
export function bsYmdToLocalDayBoundsIso(bsYmd) {
  const normalized = normalizeBsYmdInput(bsYmd);
  const nd = new NepaliDate(normalized);
  const js = nd.toJsDate();
  const y = js.getFullYear();
  const m = js.getMonth();
  const day = js.getDate();
  const start = new Date(y, m, day, 0, 0, 0, 0);
  const end = new Date(y, m, day, 23, 59, 59, 999);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

/** ISO instant sent to attendance API when saving a BS calendar day */
export function bsYmdToAttendanceSaveIso(bsYmd) {
  const { startIso } = bsYmdToLocalDayBoundsIso(bsYmd);
  return startIso;
}
