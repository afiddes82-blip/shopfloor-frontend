export type StepRow = {
  STEP_CODE: string;
  STATUS: string;
  VALUES_JSON: any;
  TECH_ID: string | null;
  STATION: string | null;
  EVENT_TS_UTC: string | null;
};

const API_BASE =
  import.meta.env.VITE_API_BASE ?? "https://qdk2wkr3k2.us-east-2.awsapprunner.com";

function buildUrl(path: string): string {
  const base = API_BASE.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(buildUrl(url), {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function postJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(buildUrl(url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export function fetchTravelerSteps(buildId: string) {
  return getJSON<{ build_id: string; rows: StepRow[] }>(
    `/traveler/steps/${encodeURIComponent(buildId)}`
  );
}

export function upsertTravelerStep(payload: {
  build_id: string;
  step_code: string;
  status: string;
  values_json: any;
  tech_id: string;
  station: string;
  timestamp_utc: string;
}) {
  return postJSON<{ success: boolean }>(
    `/traveler/step-update`,
    payload
  );
}