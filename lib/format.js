export function getMakerNames(makerIds = [], makersById = {}) {
  return makerIds
    .map((id) => makersById[id]?.name)
    .filter(Boolean)
    .join(" · ");
}

export function hasOpenUrl(url) {
  return Boolean(url) && url !== "#";
}

export function getThumbnailLabel(title = "") {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && /^[A-Za-z]/.test(parts[0]) && /^[A-Za-z]/.test(parts[1])) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return title.slice(0, 2);
}

export function comparePrograms(a, b) {
  return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
}

export function getVisibilityLabel(visibility) {
  if (visibility === "school") return "🏫 이솔고 교직원";
  if (visibility === "private") return "🔒 비공개";
  return "🌐 전체 공개";
}

export function joinCommaList(items = []) {
  return (items || []).filter(Boolean).join(", ");
}

export function parseCommaList(value, max = 8) {
  return String(value || "")
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);
}

export function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type)?.value || "";
  return `${Number(get("year"))}. ${Number(get("month"))}. ${Number(get("day"))}. ${get("hour")}:${get("minute")}`;
}
