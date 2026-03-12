// src/api/routerConfig.ts

export type EditableRouterStep = {
  stepCode: string;
  title: string;
  description?: string;
  panel: "RESUME_WO" | "QUALITY_INSPECTIONS" | "START_ATP" | "PRINT_APPLY_LABELS";
  sortOrder: number;
  isActive: boolean;
};

export type RouterConfigPayload = {
  steps: EditableRouterStep[];
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

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(txt || `HTTP ${r.status}`);
  }

  return r.json();
}

async function postJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(buildUrl(url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(txt || `HTTP ${r.status}`);
  }

  return r.json();
}

export async function validateAdminPin(pin: string) {
  return postJSON<{ success: boolean }>(
    "/admin/validate-pin",
    { pin }
  );
}

export async function fetchRouterConfig(template: string) {
  return getJSON<{
    template: string;
    revision: number;
    is_active: boolean;
    config_json: RouterConfigPayload;
    updated_at?: string;
    updated_by?: string;
  }>(
    `/router-config/${encodeURIComponent(template)}`
  );
}

export async function saveRouterConfig(
  template: string,
  config_json: RouterConfigPayload,
  updated_by = "admin"
) {
  return postJSON(
    `/router-config/${encodeURIComponent(template)}`,
    {
      config_json,
      updated_by,
    }
  );
}