// Time-zone helpers for live classes. Class times are stored as weekly UTC slots.

export const userTimeZone = (() => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; }
})();

// Next Date (absolute instant) at which this weekly UTC slot happens.
export function nextOccurrence(cls, from = new Date()) {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), cls.utcHour, cls.utcMin));
  let diff = (cls.day - d.getUTCDay() + 7) % 7;
  if (diff === 0 && d <= from) diff = 7;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function formatLocal(date, opts = { weekday: 'short', hour: 'numeric', minute: '2-digit' }) {
  return new Intl.DateTimeFormat(undefined, { ...opts, timeZone: userTimeZone }).format(date);
}

export function localDayKey(date) {
  // yyyy-mm-dd in the user's zone
  return new Intl.DateTimeFormat('en-CA', { timeZone: userTimeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function tzAbbrev(date = new Date()) {
  try {
    return new Intl.DateTimeFormat(undefined, { timeZone: userTimeZone, timeZoneName: 'short' })
      .formatToParts(date).find((p) => p.type === 'timeZoneName')?.value || '';
  } catch { return ''; }
}

export function toICSDate(d) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
