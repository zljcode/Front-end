export const riskTone = {
  pass: {
    label: "PASS",
    title: "Trusted",
    message: "当前访问未命中高风险信号。",
    className: "tone-pass"
  },
  review: {
    label: "REVIEW",
    title: "Needs Review",
    message: "存在需要复核的网络或环境信号。",
    className: "tone-review"
  },
  reject: {
    label: "REJECT",
    title: "High Risk",
    message: "命中高风险规则，建议拒绝或加强验证。",
    className: "tone-reject"
  }
};

export function formatBooleanState(value, confidence) {
  if (confidence === "unknown" || value === null || value === undefined) return "Unknown";
  if (value === true) return "Detected";
  if (value === false) return "Not Detected";
  return String(value);
}

export function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "unknown";

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

export function emptyValue(value) {
  return value === null || value === undefined || value === "" ? "Not available" : value;
}

export function formatMemory(value) {
  if (value === null || value === undefined || value === "" || value === "unknown") {
    return "Not available";
  }

  return `${value} GB`;
}
