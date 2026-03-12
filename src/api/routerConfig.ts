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

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(txt || `HTTP ${r.status}`);
  }
  return r.json();
}

async function postJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(txt || `HTTP ${r.status}`);
  }
  return r.json();
}

export async function validateAdminPin(pin: string) {
  return postJSON<{ success: boolean }>("/api/admin/validate-pin", { pin });
}

export async function fetchRouterConfig(template: string) {
  return getJSON<{
    template: string;
    revision: number;
    is_active: boolean;
    config_json: RouterConfigPayload;
    updated_at?: string;
    updated_by?: string;
  }>(`/api/router-config/${encodeURIComponent(template)}`);
}

export async function saveRouterConfig(template: string, config_json: RouterConfigPayload, updated_by = "admin") {
  return postJSON(`/api/router-config/${encodeURIComponent(template)}`, {
    config_json,
    updated_by,
  });
}