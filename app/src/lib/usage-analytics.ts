export type UsageEventType = "map_view" | "filters_applied" | "chat_message";

const SESSION_STORAGE_KEY = "recycler-usage-session";

export function getUsageSessionId(): string {
  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const sessionId = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export function trackUsageEvent(
  useCaseId: string,
  eventType: UsageEventType,
  metadata: Record<string, unknown> = {},
  sessionId = getUsageSessionId()
): void {
  void fetch("/api/usage-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ useCaseId, eventType, sessionId, metadata }),
    keepalive: true,
  }).catch(() => undefined);
}