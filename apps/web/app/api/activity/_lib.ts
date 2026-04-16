const EVENTS_API_URL = process.env.EVENTS_API_URL;
const EVENTS_ACTIVITY_URL = process.env.EVENTS_ACTIVITY_URL;
const EVENTS_ACTIVITY_API_KEY = process.env.EVENTS_ACTIVITY_API_KEY;

function withTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

export function getEventsIngestUrl() {
  return EVENTS_API_URL;
}

export function buildEventsServiceUrl(pathname: string) {
  const baseUrl = EVENTS_ACTIVITY_URL ?? EVENTS_API_URL;

  if (!baseUrl) {
    return null;
  }

  return new URL(pathname.replace(/^\//, ""), withTrailingSlash(baseUrl)).toString();
}

export function createActivityHeaders() {
  const headers: Record<string, string> = {
    "content-type": "application/json"
  };

  if (EVENTS_ACTIVITY_API_KEY) {
    headers["x-activity-key"] = EVENTS_ACTIVITY_API_KEY;
  }

  return headers;
}
