export const REPORT_REASONS = [
  { value: "scam", label: "Scam or fraud" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "not_berkeley", label: "Not a Berkeley affiliate" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];
