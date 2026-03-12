export type StepRow = {
  STEP_CODE: string;
  STATUS: string;
  VALUES_JSON: any;
  TECH_ID: string | null;
  STATION: string | null;
  EVENT_TS_UTC: string | null;
};

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function postJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export function fetchTravelerSteps(buildId: string) {
  return getJSON<{ build_id: string; rows: StepRow[] }>(`/api/traveler/steps/${encodeURIComponent(buildId)}`);
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
  return postJSON<{ success: boolean }>(`/api/traveler/step-update`, payload);
}