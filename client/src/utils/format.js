// Small helpers to show dates and times nicely (India style).

// "2026-11-03T00:00:00.000Z" -> "03 Nov 2026"  (dates are stored at midnight UTC)
export const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "-";

// a real moment in time -> "09:05 am" in India time
export const fmtTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : "-";

// "2026-11-03" (a plain day string) -> "03 Nov 2026"
export const fmtDay = (ymd) =>
  new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

// hours between two moments, e.g. "8h 55m"
export const worked = (from, to) => {
  if (!from || !to) return "-";
  const mins = Math.max(0, Math.round((new Date(to) - new Date(from)) / 60000));
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

// today's date in India as "YYYY-MM-DD"
export const todayIST = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

export const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// turns an axios error into a message for the screen
export const errMsg = (err, fallback) => err.response?.data?.msg || fallback;
