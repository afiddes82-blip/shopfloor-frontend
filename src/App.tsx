// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import bhLogo from "./assets/BH.svg";

import { fetchTravelerSteps, type StepRow } from "./api/traveler";
import {
  fetchRouterConfig,
  saveRouterConfig,
  validateAdminPin,
  type EditableRouterStep,
} from "./api/routerConfig";

import GenericStep from "./traveler/GenericStep";
import { getRouterForWorkOrder } from "./traveler/routers";
import { resolveBomItem } from "./traveler/resolveBomItem";

/* ----- Default router step definitions for Admin Panel fallback ----- */
import { ALLEGRO_STEPS } from "./traveler/allegro/allegroSteps";
import { ELITE_MD_STEPS } from "./traveler/elite/eliteMdRouter";
import { SYNDEO120_STEPS } from "./traveler/syndeo/syndeo120Steps";

/* ----- Shared traveler types ----- */
import type { TravelerRouter, StepDef, Panel, NextSuggestion } from "./traveler/types";

type WorkOrder = {
  work_order_id: number;
  work_order_number: string;
  item_number?: string | null;
  item_desc?: string | null;
  sc_dept?: string | null;
  sc_class?: string | null;
  prod_class?: string | null;
  location_name?: string | null;
  open_wo_qty: number;
  traveler_template: string;
};

type BomRow = {
  COMPONENT_ITEM: string;
  COMPONENT_QTY: number;
  UOM: string;
  LEVEL: number;
  TYPE: string;
  VERIFIED: boolean;
  ITEM_DESC?: string | null;
  LOGISTICS_CLASS?: string | null;
};

type ReplacementEntry = {
  component_item: string;
  quantity: string;
};

type EditTarget = {
  stepCode: string;
  row: StepRow;
} | null;

/**
 * IMPORTANT:
 * No API_BASE here.
 * These requests should go to the same origin your frontend is served from.
 * If Vite dev proxy is configured, these will proxy correctly in dev too.
 */
async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, {
    credentials: "include",
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(txt || `HTTP ${r.status}`);
  }

  return r.json();
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
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

function nowUtcIso() {
  return new Date().toISOString();
}

function normalizeVerified(v: any): boolean {
  if (v === true) return true;
  if (v === false) return false;

  const s = String(v ?? "").trim().toUpperCase();
  return s === "T" || s === "TRUE" || s === "Y" || s === "YES" || s === "1";
}

function normalizeBomRows(rows: any[]): BomRow[] {
  return (rows || []).map((r: any) => ({
    ...r,
    VERIFIED: normalizeVerified(r.VERIFIED),
  }));
}

function rowTimestamp(row: StepRow): string {
  const r = row as any;
  return String(
    r.UPDATED_AT_UTC ??
      r.UPDATED_AT ??
      r.CREATED_AT_UTC ??
      r.CREATED_AT ??
      r.TIMESTAMP_UTC ??
      r.TIMESTAMP ??
      ""
  );
}

const PANELS: { key: Panel; title: string; subtitle: string; emoji: string }[] = [
  { key: "START_WO", title: "Start Work Order", subtitle: "Pick verify items", emoji: "🟢" },
  { key: "RESUME_WO", title: "Resume Work Order", subtitle: "Assembly steps", emoji: "🟡" },
  { key: "QUALITY_INSPECTIONS", title: "Quality Inspections", subtitle: "Inspection ops", emoji: "🧪" },
  { key: "START_ATP", title: "Start ATP", subtitle: "ATP steps", emoji: "⚡" },
  { key: "PRINT_APPLY_LABELS", title: "Print + Apply Labels", subtitle: "Labels / Packaging", emoji: "🏷️" },
];

export default function App() {
  const [panel, setPanel] = useState<Panel>("START_WO");
  const [activeStep, setActiveStep] = useState<string | null>(null);

  const [nextSuggested, setNextSuggested] = useState<NextSuggestion | null>(null);

  const [open, setOpen] = useState<WorkOrder[]>([]);
  const [resume, setResume] = useState<WorkOrder[]>([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [techId, setTechId] = useState("SYSTEM");
  const [station, setStation] = useState("MAIN_WHSE_US");

  const [selectedWo, setSelectedWo] = useState<WorkOrder | null>(null);

  // BOM verify
  const [bomLoading, setBomLoading] = useState(false);
  const [bomErr, setBomErr] = useState<string | null>(null);
  const [bomRows, setBomRows] = useState<BomRow[]>([]);

  // PR replacement entry
  const [replacementCount, setReplacementCount] = useState("0");
  const [replacementRows, setReplacementRows] = useState<ReplacementEntry[]>([]);
  const [savingReplacements, setSavingReplacements] = useState(false);

  // Traveler steps
  const [stepRows, setStepRows] = useState<StepRow[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [stepsErr, setStepsErr] = useState<string | null>(null);

  // Completed-step edit pane (NO PIN)
  const [editPaneOpen, setEditPaneOpen] = useState(true);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);

  // Router admin pane (PIN REQUIRED)
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [adminPinErr, setAdminPinErr] = useState<string | null>(null);
  const [adminTemplate, setAdminTemplate] = useState("ALLEGRO");
  const [adminSteps, setAdminSteps] = useState<EditableRouterStep[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminMsg, setAdminMsg] = useState<string | null>(null);

  const router: TravelerRouter | null = useMemo(() => getRouterForWorkOrder(selectedWo), [selectedWo]);

  const activeSteps: StepDef[] = useMemo(
    () => (router ? router.getSteps(selectedWo, stepRows) : []),
    [router, selectedWo, stepRows]
  );

  const activeForms = router?.forms ?? {};

  const resolvedSelectedItem = useMemo(
    () => resolveBomItem(selectedWo?.item_number ?? ""),
    [selectedWo?.item_number]
  );

  const isPrVariant = Boolean(resolvedSelectedItem?.isPrVariant);
  const resolvedBomItem = resolvedSelectedItem?.bomItem ?? "";

  const replacementOptions = useMemo(() => {
    const seen = new Set<string>();
    return bomRows
      .filter((r) => {
        const key = String(r.COMPONENT_ITEM ?? "").trim().toUpperCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((r) => ({
        value: r.COMPONENT_ITEM,
        label: r.ITEM_DESC ? `${r.COMPONENT_ITEM} — ${r.ITEM_DESC}` : r.COMPONENT_ITEM,
      }));
  }, [bomRows]);

  async function loadWos() {
    setErr(null);
    setLoading(true);
    try {
      const [openRes, resumeRes] = await Promise.all([
        getJSON<WorkOrder[]>("/open-workorders"),
        getJSON<WorkOrder[]>("/resume-workorders"),
      ]);
      setOpen(openRes);
      setResume(resumeRes);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWos();
    const t = setInterval(loadWos, 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!selectedWo) {
      setActiveStep(null);
      setEditTarget(null);
      return;
    }

    if (panel === "START_WO") {
      setActiveStep(null);
      return;
    }

    loadSteps(selectedWo.work_order_number).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel, selectedWo?.work_order_number]);

  useEffect(() => {
    setActiveStep(null);
    setEditTarget(null);
    setReplacementCount("0");
    setReplacementRows([]);
  }, [selectedWo?.work_order_number]);

  useEffect(() => {
    if (adminUnlocked) {
      loadAdminTemplate(adminTemplate).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminTemplate, adminUnlocked]);

  const list = useMemo(() => {
    const base =
      panel === "START_WO"
        ? open
        : panel === "RESUME_WO" ||
          panel === "QUALITY_INSPECTIONS" ||
          panel === "START_ATP" ||
          panel === "PRINT_APPLY_LABELS"
        ? resume
        : [];

    const q = search.trim().toLowerCase();
    if (!q) return base;

    return base.filter((wo) => {
      const haystack = [wo.work_order_number, wo.item_number, wo.item_desc, wo.location_name, wo.traveler_template]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [panel, open, resume, search]);

  async function loadSteps(buildId: string) {
    setStepsErr(null);
    setStepsLoading(true);
    try {
      const res = await fetchTravelerSteps(buildId);
      const rows = res.rows || [];
      setStepRows(rows);

      if (router) {
        const suggestion = router.computeNextSuggestion(selectedWo, rows);
        setNextSuggested(suggestion);
      } else {
        setNextSuggested(null);
      }
    } catch (e: any) {
      setStepsErr(e?.message || String(e));
      setStepRows([]);
      setNextSuggested(null);
    } finally {
      setStepsLoading(false);
    }
  }

  function syncReplacementRows(rawCount: string) {
    const numericCount = Math.max(0, parseInt(rawCount || "0", 10) || 0);
    setReplacementCount(String(numericCount));

    setReplacementRows((prev) => {
      const next = [...prev];

      while (next.length < numericCount) {
        next.push({ component_item: "", quantity: "" });
      }

      return next.slice(0, numericCount);
    });
  }

  function updateReplacementRow(index: number, patch: Partial<ReplacementEntry>) {
    setReplacementRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  async function openWorkOrder(wo: WorkOrder) {
    const resolved = resolveBomItem(wo.item_number ?? "");

    setSelectedWo(wo);
    setActiveStep(null);
    setEditTarget(null);

    setNextSuggested(null);
    setStepsErr(null);
    setBomRows([]);
    setReplacementCount("0");
    setReplacementRows([]);

    setBomErr(null);
    setBomLoading(true);

    try {
      if (panel === "START_WO") {
        if (!wo.item_number) {
          throw new Error("This work order is missing an item number, so BOM snapshot cannot be created.");
        }

        if (!resolved.bomItem) {
          throw new Error(`No base BOM item could be resolved from ${wo.item_number}.`);
        }

        await postJSON("/build-bom-snapshot", {
          build_id: wo.work_order_number,
          item_number: resolved.bomItem,
          original_item_number: wo.item_number,
          tech_id: techId.trim(),
          station: station.trim(),
          selected_at_utc: nowUtcIso(),
          wo_qty: Math.max(1, Math.round(Number(wo.open_wo_qty ?? 1))),
          bom_source: "PC_FIVETRAN_DB.NETSUITE_SUITEANALYTICS.BOM_BY_LEVEL_MAIN_WHSE_US",
        });
      }

      const data = await getJSON<{ build_id: string; rows: BomRow[] }>(
        `/build-bom-components/${encodeURIComponent(wo.work_order_number)}`
      );

      setBomRows(normalizeBomRows(data.rows || []));
    } catch (e: any) {
      setBomErr(e?.message || String(e));
      setBomRows([]);
    } finally {
      setBomLoading(false);
    }

    if (panel !== "START_WO") {
      await loadSteps(wo.work_order_number);
    }
  }

  async function verifyComponent(component_item: string) {
    if (!selectedWo) return;

    setBomErr(null);
    try {
      await postJSON("/build-bom-verify", {
        build_id: selectedWo.work_order_number,
        component_item,
        verified: true,
        tech_id: techId.trim(),
        timestamp_utc: nowUtcIso(),
      });

      const data = await getJSON<{ build_id: string; rows: BomRow[] }>(
        `/build-bom-components/${encodeURIComponent(selectedWo.work_order_number)}`
      );

      const rows = normalizeBomRows(data.rows || []);
      setBomRows(rows);

      const remaining = rows.filter((r) => !r.VERIFIED);

      if (rows.length > 0 && remaining.length === 0) {
        await postJSON("/build-events", {
          build_id: selectedWo.work_order_number,
          tech_id: techId.trim(),
          station: station.trim(),
          status: "PICKING_COMPLETE",
          timestamp_utc: nowUtcIso(),
          traveler_template: selectedWo.traveler_template,
          notes: "All components verified",
        });

        await loadWos();
        setSelectedWo(null);
        setBomRows([]);
        setPanel("RESUME_WO");
      }
    } catch (e: any) {
      setBomErr(e?.message || String(e));
    }
  }

  async function savePrReplacements() {
    if (!selectedWo) return;

    const numericCount = Math.max(0, parseInt(replacementCount || "0", 10) || 0);

    if (numericCount <= 0) {
      setBomErr("Enter how many different items were replaced.");
      return;
    }

    if (!resolvedBomItem) {
      setBomErr("No base BOM item could be resolved for this PR work order.");
      return;
    }

    const cleaned = replacementRows.map((r) => ({
      component_item: String(r.component_item ?? "").trim(),
      quantity: String(r.quantity ?? "").trim(),
    }));

    if (cleaned.length !== numericCount) {
      setBomErr("Replacement row count does not match the number entered.");
      return;
    }

    for (let i = 0; i < cleaned.length; i++) {
      if (!cleaned[i].component_item) {
        setBomErr(`Select an item for replacement row ${i + 1}.`);
        return;
      }
      if (!cleaned[i].quantity || Number(cleaned[i].quantity) <= 0) {
        setBomErr(`Enter a valid quantity for replacement row ${i + 1}.`);
        return;
      }
    }

    const duplicateCheck = cleaned.map((r) => r.component_item.toUpperCase());
    if (new Set(duplicateCheck).size !== duplicateCheck.length) {
      setBomErr("The same replacement item was chosen more than once.");
      return;
    }

    setBomErr(null);
    setSavingReplacements(true);

    try {
      await postJSON("/pr-replacements", {
        build_id: selectedWo.work_order_number,
        work_order_number: selectedWo.work_order_number,
        wo_item_number: selectedWo.item_number,
        bom_source_item: resolvedBomItem,
        replacement_count: numericCount,
        tech_id: techId.trim(),
        station: station.trim(),
        timestamp_utc: nowUtcIso(),
        replacements: cleaned.map((r, idx) => ({
          line_number: idx + 1,
          component_item: r.component_item,
          quantity: Number(r.quantity),
        })),
      });

      await postJSON("/build-events", {
        build_id: selectedWo.work_order_number,
        tech_id: techId.trim(),
        station: station.trim(),
        status: "PICKING_COMPLETE",
        timestamp_utc: nowUtcIso(),
        traveler_template: selectedWo.traveler_template,
        notes: `PR replacements recorded from BOM ${resolvedBomItem}`,
      });

      await loadWos();
      setSelectedWo(null);
      setBomRows([]);
      setReplacementCount("0");
      setReplacementRows([]);
      setPanel("RESUME_WO");
    } catch (e: any) {
      setBomErr(e?.message || String(e));
    } finally {
      setSavingReplacements(false);
    }
  }

 

  function clearEditTarget() {
    setEditTarget(null);
  }

  function openEditRow(row: StepRow) {
    if (!router || !selectedWo) return;

    const targetPanel = router.panelForStep(row.STEP_CODE);
    setEditTarget({
      stepCode: row.STEP_CODE,
      row,
    });
    setPanel(targetPanel);
    setActiveStep(row.STEP_CODE);
  }

  async function unlockAdmin() {
    setAdminPinErr(null);
    setAdminMsg(null);
    try {
      const res = await validateAdminPin(adminPin);
      if (!res?.success) {
        setAdminPinErr("Invalid PIN");
        return;
      }
      setAdminUnlocked(true);
      await loadAdminTemplate(adminTemplate);
    } catch (e: any) {
      setAdminPinErr(e?.message || String(e));
    }
  }

  function getDefaultStepsForTemplate(template: string): EditableRouterStep[] {
    const tpl = String(template || "").toUpperCase();

    let baseSteps: StepDef[] = [];

    if (tpl.includes("ALLEGRO")) {
      baseSteps = ALLEGRO_STEPS;
    } else if (tpl.includes("ELITE")) {
      baseSteps = ELITE_MD_STEPS;
    } else if (tpl.includes("SYNDEO")) {
      baseSteps = SYNDEO120_STEPS;
    }

    return baseSteps.map((s, idx) => {
      const stepAny = s as any;

      return {
        stepCode: s.stepCode,
        title: s.title,
        description: s.description || "",
        panel: stepAny.panel || "RESUME_WO",
        sortOrder: Number(stepAny.sortOrder ?? (idx + 1) * 10),
        isActive: stepAny.isActive !== false,
      };
    });
  }

  async function loadAdminTemplate(template: string) {
    setAdminLoading(true);
    setAdminMsg(null);
    try {
      const res = await fetchRouterConfig(template);
      const steps = (res?.config_json?.steps || []).map((s: any) => ({
        ...s,
        panel: s.panel || "RESUME_WO",
        sortOrder: Number(s.sortOrder ?? 0),
        isActive: s.isActive !== false,
      }));
      setAdminSteps(steps);
    } catch {
      setAdminSteps(getDefaultStepsForTemplate(template));
    } finally {
      setAdminLoading(false);
    }
  }

  async function saveAdminTemplate() {
    setAdminSaving(true);
    setAdminMsg(null);
    try {
      await saveRouterConfig(adminTemplate, { steps: adminSteps }, techId || "admin");
      setAdminMsg("Router steps saved for future work orders.");
    } catch (e: any) {
      setAdminMsg(e?.message || String(e));
    } finally {
      setAdminSaving(false);
    }
  }

  function updateAdminStep(index: number, patch: Partial<EditableRouterStep>) {
    setAdminSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  const total = bomRows.length;
  const verifiedCount = bomRows.filter((r) => r.VERIFIED).length;
  const remainingRows = bomRows.filter((r) => !r.VERIFIED);
  const pct = total > 0 ? Math.round((verifiedCount / total) * 100) : 0;

  function getStepStatus(stepCode: string) {
    const row = stepRows.find((r) => r.STEP_CODE === stepCode);
    return row?.STATUS || "NOT_STARTED";
  }

  const stepsForPanel = useMemo(() => {
    if (!router || !selectedWo) return [];
    return activeSteps.filter((s) => router.panelForStep(s.stepCode) === panel);
  }, [router, selectedWo, activeSteps, panel]);

  const savedRowsForSelectedWo = useMemo(() => {
    if (!router || !selectedWo) return [];
    return [...stepRows].sort((a, b) => rowTimestamp(b).localeCompare(rowTimestamp(a)));
  }, [router, selectedWo, stepRows]);

  const anyRightPaneOpen = editPaneOpen || adminOpen;

  function resetSelection() {
    setSelectedWo(null);
    setBomRows([]);
    setStepRows([]);
    setActiveStep(null);
    setNextSuggested(null);
    setStepsErr(null);
    setBomErr(null);
    setEditTarget(null);
    setReplacementCount("0");
    setReplacementRows([]);
  }

  const travelerLabel = router?.label ?? "No traveler configured";

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f8" }}>
      <div style={header}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.2 }}>SPARK Application</div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Shop Floor Work Order Execution</div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={loadWos} disabled={loading} style={btnSmall}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button onClick={() => setEditPaneOpen((v) => !v)} style={btnSmall}>
              {editPaneOpen ? "Hide Completed Steps" : "Show Completed Steps"}
            </button>

            <button onClick={() => setAdminOpen((v) => !v)} style={btnSmall}>
              {adminOpen ? "Hide Router Admin" : "Show Router Admin"}
            </button>
          </div>
        </div>

        <div style={logoBox}>
          <img src={bhLogo} alt="BeautyHealth" style={{ height: 28 }} />
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div
          style={{
            ...shell,
            gridTemplateColumns: anyRightPaneOpen ? "320px 1fr 420px" : "320px 1fr",
          }}
        >
          <div style={leftRail}>
            {PANELS.map((p) => {
              const active = p.key === panel;
              return (
                <button key={p.key} onClick={() => setPanel(p.key)} style={active ? railBtnActive : railBtn}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 18, lineHeight: "18px" }}>{p.emoji}</div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 900 }}>{p.title}</div>
                      <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{p.subtitle}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={content}>
            {err && (
              <div style={errorBox}>
                <b>Error:</b> {err}
              </div>
            )}

            <div
              style={{
                marginTop: 4,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "baseline",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {panel === "START_WO" && "Start Work Order"}
                {panel === "RESUME_WO" && "Resume Work Order"}
                {panel === "QUALITY_INSPECTIONS" && "Quality Inspections"}
                {panel === "START_ATP" && "Start ATP"}
                {panel === "PRINT_APPLY_LABELS" && "Print + Apply Labels"}
              </h2>
              {selectedWo && (
                <div style={{ fontSize: 12, color: "#666" }}>
                  Traveler: <b>{travelerLabel}</b>
                </div>
              )}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <input value={techId} onChange={(e) => setTechId(e.target.value)} placeholder="Tech ID" style={inputStyle} />
              <input
                value={station}
                onChange={(e) => setStation(e.target.value)}
                placeholder="Station"
                style={{ ...inputStyle, width: 240, flex: "unset" as any }}
              />
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search WO, item, description, location..."
                style={inputStyle}
              />
              {search.trim() && (
                <button style={btnSmall} onClick={() => setSearch("")}>
                  Clear
                </button>
              )}
            </div>

            {!selectedWo && (
              <WorkOrderList
                rows={list}
                onOpen={openWorkOrder}
                emptyText={panel === "START_WO" ? "No open work orders." : "No resume work orders."}
              />
            )}

            {selectedWo && (
              <>
                <div style={{ marginTop: 12 }}>
                  <button style={btnSmall} onClick={resetSelection}>
                    ← Back to list
                  </button>
                </div>

                {panel === "START_WO" && (
                  <div
                    style={{
                      marginTop: 12,
                      border: "1px solid #eee",
                      borderRadius: 16,
                      padding: 14,
                      background: "white",
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 16 }}>
                      {isPrVariant ? "PR Replacement Entry" : "BOM Verify"} — {selectedWo.work_order_number}
                    </div>

                    {isPrVariant && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: 12,
                          borderRadius: 12,
                          border: "1px solid #f2d38a",
                          background: "#fff8e6",
                          fontSize: 13,
                          color: "#5d4700",
                        }}
                      >
                        Work order item: <b>{selectedWo.item_number}</b>
                        <br />
                        Base BOM item used: <b>{resolvedBomItem || "(not resolved)"}</b>
                      </div>
                    )}

                    {!isPrVariant && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#444" }}>
                          <div>
                            Verified <b>{verifiedCount}</b> / <b>{total}</b> • Remaining <b>{remainingRows.length}</b>
                          </div>
                          <div style={{ fontWeight: 800 }}>{pct}%</div>
                        </div>
                        <div style={{ marginTop: 8, height: 10, borderRadius: 999, background: "#eee", overflow: "hidden" }}>
                          <div style={{ height: 10, width: `${pct}%`, background: "#111" }} />
                        </div>
                      </div>
                    )}

                    {bomErr && (
                      <div style={{ ...errorBox, marginTop: 10 }}>
                        <b>Error:</b> {bomErr}
                      </div>
                    )}

                    {bomLoading && <div style={{ marginTop: 10, color: "#666" }}>Loading BOM...</div>}

                    {!bomLoading && !bomErr && isPrVariant && bomRows.length === 0 && (
                      <div style={{ marginTop: 10, color: "#666" }}>
                        No BOM component options were returned for the resolved item <b>{resolvedBomItem}</b>.
                      </div>
                    )}

                    {!bomLoading && !bomErr && !isPrVariant && bomRows.length === 0 && (
                      <div style={{ marginTop: 10, color: "#666" }}>No BOM rows returned for this work order.</div>
                    )}

                    {!bomLoading && !bomErr && !isPrVariant && bomRows.length > 0 && remainingRows.length === 0 && (
                      <div style={{ marginTop: 10, color: "#666" }}>All BOM components are already verified.</div>
                    )}

                    {!bomLoading && isPrVariant && bomRows.length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontWeight: 900, marginBottom: 8 }}>How many different items did we replace?</div>

                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={replacementCount}
                            onChange={(e) => syncReplacementRows(e.target.value)}
                            style={{ ...inputStyle, width: 140, flex: "unset" as any }}
                          />
                        </div>

                        {replacementRows.length > 0 && (
                          <div style={{ display: "grid", gap: 10 }}>
                            {replacementRows.map((row, idx) => (
                              <div
                                key={idx}
                                style={{
                                  border: "1px solid #f0f0f0",
                                  borderRadius: 14,
                                  padding: 12,
                                  background: "#fff",
                                  display: "grid",
                                  gap: 10,
                                  gridTemplateColumns: "1fr 140px",
                                  alignItems: "end",
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
                                    Replacement Item {idx + 1}
                                  </div>
                                  <select
                                    value={row.component_item}
                                    onChange={(e) =>
                                      updateReplacementRow(idx, { component_item: e.target.value })
                                    }
                                    style={{ ...inputStyle, width: "100%" }}
                                  >
                                    <option value="">Select item</option>
                                    {replacementOptions.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
                                    Quantity
                                  </div>
                                  <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={row.quantity}
                                    onChange={(e) =>
                                      updateReplacementRow(idx, { quantity: e.target.value })
                                    }
                                    style={{ ...inputStyle, width: "100%" }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ marginTop: 14 }}>
                          <button
                            style={btnAction}
                            onClick={savePrReplacements}
                            disabled={savingReplacements}
                          >
                            {savingReplacements ? "Saving..." : "Save Replaced Parts"}
                          </button>
                        </div>
                      </div>
                    )}

                    {!bomLoading && !isPrVariant && remainingRows.length > 0 && (
                      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                        {remainingRows.map((r) => (
                          <div key={r.COMPONENT_ITEM} style={card}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                              <div>
                                <div style={{ fontWeight: 900 }}>{r.COMPONENT_ITEM}</div>
                                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                                  Qty: {r.COMPONENT_QTY} {r.UOM} • Type: {r.TYPE}
                                </div>
                                {r.ITEM_DESC && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{r.ITEM_DESC}</div>}
                              </div>
                              <button style={btnAction} onClick={() => verifyComponent(r.COMPONENT_ITEM)}>
                                Verify
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {panel !== "START_WO" && (
                  <div
                    style={{
                      marginTop: 12,
                      border: "1px solid #eee",
                      borderRadius: 16,
                      padding: 14,
                      background: "white",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>Steps — {selectedWo.work_order_number}</div>
                      <button style={btnSmall} onClick={() => loadSteps(selectedWo.work_order_number)} disabled={stepsLoading}>
                        {stepsLoading ? "Loading..." : "Reload"}
                      </button>
                    </div>

                    {!router && (
                      <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid #eee", background: "#fafafa" }}>
                        No traveler configured for this work order. (traveler_template: <b>{selectedWo.traveler_template}</b>)
                      </div>
                    )}

                    {router && nextSuggested && (
                      <div style={{ marginTop: 10, padding: 12, borderRadius: 12, border: "1px solid #eee", background: "#fafafa" }}>
                        <div style={{ fontWeight: 900 }}>Next Step: {nextSuggested.nextStepCode}</div>
                        <div style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
                          <b>Action:</b> {nextSuggested.action}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
                          <b>Stage:</b> {nextSuggested.stageLabel}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" as any }}>
                          <button style={btnSmall} onClick={() => setPanel(nextSuggested.panel)}>
                            Go to {nextSuggested.stageLabel}
                          </button>
                          <button
                            style={btnSmall}
                            onClick={() => {
                              setPanel(nextSuggested.panel);
                              setActiveStep(nextSuggested.nextStepCode);
                            }}
                          >
                            Open next step
                          </button>
                        </div>
                      </div>
                    )}

                    {stepsErr && (
                      <div style={{ ...errorBox, marginTop: 10 }}>
                        <b>Error:</b> {stepsErr}
                      </div>
                    )}

                    {stepsLoading && (
                      <div style={{ marginTop: 10, color: "#666", fontSize: 12 }}>
                        {stepRows.length > 0 ? "Refreshing steps..." : "Loading steps..."}
                      </div>
                    )}

                    {router && (
                      <div style={{ marginTop: 12 }}>
                        {stepsForPanel.length === 0 && (
                          <div style={{ fontSize: 13, color: "#666" }}>No steps in this panel for this traveler.</div>
                        )}

                        {stepsForPanel.map((s) => {
                          const status = getStepStatus(s.stepCode);
                          const isComplete = status === "COMPLETE";
                          const row = stepRows.find((r) => r.STEP_CODE === s.stepCode);
                          const form = activeForms[s.stepCode];

                          const locked = router.isLockedByGlobalOrder(selectedWo, s.stepCode, stepRows);
                          const missing = locked ? router.firstMissingPrereq(selectedWo, s.stepCode, stepRows) : null;

                          const isEditingThisStep = editTarget?.stepCode === s.stepCode;
                          const initialValues = isEditingThisStep ? editTarget?.row?.VALUES_JSON : row?.VALUES_JSON;

                          return (
                            <div
                              key={s.stepCode}
                              style={{
                                border: "1px solid #f0f0f0",
                                borderRadius: 14,
                                padding: 12,
                                marginBottom: 10,
                                background: "white",
                              }}
                            >
                              <div
                                onClick={() => setActiveStep((prev) => (prev === s.stepCode ? null : s.stepCode))}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "baseline",
                                  gap: 10,
                                  cursor: "pointer",
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 900 }}>{s.title}</div>
                                  <div style={{ fontSize: 12, color: "#666" }}>{s.description}</div>
                                  {locked && !isComplete && !isEditingThisStep && (
                                    <div style={{ fontSize: 12, color: "#a00", marginTop: 6 }}>
                                      🔒 Locked: complete prior steps first{missing ? ` (missing: ${missing})` : ""}.
                                    </div>
                                  )}
                                </div>

                                <div style={{ fontSize: 12, fontWeight: 900 }}>
                                  {isEditingThisStep ? "✏️ EDITING" : isComplete ? "✅ COMPLETE" : status}
                                </div>
                              </div>

                              {activeStep === s.stepCode && (
                                <div style={{ marginTop: 12 }}>
                                  {locked && !isComplete && !isEditingThisStep && (
                                    <div
                                      style={{
                                        padding: 12,
                                        borderRadius: 12,
                                        border: "1px solid #f5c2c7",
                                        background: "#fff5f5",
                                        fontSize: 13,
                                        color: "#7a1116",
                                      }}
                                    >
                                      This step is locked until earlier steps are completed.
                                      {missing ? (
                                        <div style={{ marginTop: 6 }}>
                                          Complete <b>{missing}</b> to unlock.
                                        </div>
                                      ) : null}
                                    </div>
                                  )}

                                  {((!locked && form && !isComplete) || (form && isEditingThisStep)) && (
                                    <div>
                                      {isEditingThisStep && (
                                        <div
                                          style={{
                                            marginBottom: 10,
                                            padding: 10,
                                            borderRadius: 12,
                                            border: "1px solid #cfe2ff",
                                            background: "#eef5ff",
                                            fontSize: 13,
                                            color: "#234",
                                          }}
                                        >
                                          Editing saved step: <b>{s.stepCode}</b>
                                          <div style={{ marginTop: 8 }}>
                                            <button style={btnSmall} onClick={clearEditTarget}>
                                              Cancel edit
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      <GenericStep
                                        key={`${selectedWo.work_order_number}-${s.stepCode}-${isEditingThisStep ? "edit" : "new"}`}
                                        buildId={selectedWo.work_order_number}
                                        techId={techId}
                                        station={station}
                                        form={form}
                                        initialValues={initialValues}
                                        onSaved={async () => {
                                          await loadSteps(selectedWo.work_order_number);
                                          setEditTarget(null);
                                        }}
                                      />
                                    </div>
                                  )}

                                  {!locked && !isComplete && !form && (
                                    <div style={{ fontSize: 13, color: "#666" }}>No form configured for this step yet.</div>
                                  )}

                                  {!isEditingThisStep && isComplete && (
                                    <div style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
                                      This step is complete. Use Completed Steps to reopen it.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {anyRightPaneOpen && (
            <div style={rightRail}>
              {editPaneOpen && (
                <div style={panelSection}>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>Completed Steps</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    Edit recorded step data for the current work order
                  </div>

                  {!selectedWo && (
                    <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>
                      Open a work order to view and edit completed steps.
                    </div>
                  )}

                  {selectedWo && panel === "START_WO" && (
                    <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>
                      Completed-step editing is available after BOM verify.
                    </div>
                  )}

                  {selectedWo && panel !== "START_WO" && (
                    <>
                      {editTarget && (
                        <div
                          style={{
                            marginTop: 12,
                            padding: 12,
                            borderRadius: 12,
                            border: "1px solid #cfe2ff",
                            background: "#eef5ff",
                          }}
                        >
                          <div style={{ fontWeight: 900 }}>Currently Editing</div>
                          <div style={{ fontSize: 12, color: "#345", marginTop: 4 }}>{editTarget.stepCode}</div>
                          <div style={{ marginTop: 8 }}>
                            <button style={btnSmall} onClick={clearEditTarget}>
                              Clear edit target
                            </button>
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                        {savedRowsForSelectedWo.length === 0 && (
                          <div style={sideCardMuted}>No saved step rows found for this work order.</div>
                        )}

                        {savedRowsForSelectedWo.map((row, idx) => {
                          const stepMeta = activeSteps.find((s) => s.stepCode === row.STEP_CODE);
                          const ts = rowTimestamp(row);
                          const rowPanel = router?.panelForStep(row.STEP_CODE) || "RESUME_WO";
                          const isThisEdit = editTarget?.stepCode === row.STEP_CODE;

                          return (
                            <div
                              key={`${row.STEP_CODE}-${idx}-${ts}`}
                              style={{
                                ...sideCard,
                                border: isThisEdit ? "1px solid #111" : "1px solid #eaeaea",
                              }}
                            >
                              <div style={{ fontWeight: 900, fontSize: 13 }}>{stepMeta?.title || row.STEP_CODE}</div>
                              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{row.STEP_CODE}</div>

                              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                                <div>
                                  Status: <b>{row.STATUS || "UNKNOWN"}</b>
                                </div>
                                <div>
                                  Panel: <b>{rowPanel}</b>
                                </div>
                                {ts ? (
                                  <div>
                                    Timestamp: <b>{ts}</b>
                                  </div>
                                ) : null}
                              </div>

                              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" as any }}>
                                <button style={btnSmall} onClick={() => openEditRow(row)}>
                                  Open for Edit
                                </button>
                                <button
                                  style={btnSmall}
                                  onClick={() => {
                                    const targetPanel = router?.panelForStep(row.STEP_CODE);
                                    if (!targetPanel) return;
                                    setPanel(targetPanel);
                                    setActiveStep(row.STEP_CODE);
                                  }}
                                >
                                  Go to Step
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {adminOpen && (
                <div style={panelSection}>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>Router Admin</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    Edit traveler template routing for future work orders
                  </div>

                  {!adminUnlocked && (
                    <div style={{ marginTop: 16 }}>
                      <input
                        type="password"
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value)}
                        placeholder="Enter Admin PIN"
                        style={{ ...inputStyle, width: "100%" }}
                      />
                      <button style={{ ...btnSmall, marginTop: 10, width: "100%" }} onClick={unlockAdmin}>
                        Unlock
                      </button>
                      {adminPinErr && <div style={{ color: "#a00", marginTop: 8, fontSize: 12 }}>{adminPinErr}</div>}
                    </div>
                  )}

                  {adminUnlocked && (
                    <>
                      <div style={{ marginTop: 16 }}>
                        <label style={{ fontSize: 12, color: "#666" }}>Traveler Template</label>
                        <select
                          value={adminTemplate}
                          onChange={(e) => setAdminTemplate(e.target.value)}
                          style={{ ...inputStyle, width: "100%", marginTop: 6 }}
                        >
                          <option value="SYNDEO">Syndeo</option>
                          <option value="ELITE">Elite</option>
                          <option value="ALLEGRO">Allegro</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button
                          style={{ ...btnSmall, flex: 1 }}
                          onClick={() => loadAdminTemplate(adminTemplate)}
                          disabled={adminLoading}
                        >
                          {adminLoading ? "Loading..." : "Reload"}
                        </button>
                        <button style={{ ...btnSmall, flex: 1 }} onClick={saveAdminTemplate} disabled={adminSaving}>
                          {adminSaving ? "Saving..." : "Save"}
                        </button>
                      </div>

                      {adminMsg && <div style={{ marginTop: 10, fontSize: 12, color: "#444" }}>{adminMsg}</div>}

                      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                        {adminSteps.length === 0 && (
                          <div style={sideCardMuted}>
                            No router steps loaded. If no saved config exists yet, open a matching traveler and use its defaults,
                            or create the template config first.
                          </div>
                        )}

                        {adminSteps.map((step, idx) => (
                          <div key={step.stepCode} style={sideCard}>
                            <div style={{ fontWeight: 900, fontSize: 13 }}>{step.stepCode}</div>

                            <div style={{ marginTop: 8 }}>
                              <input
                                value={step.title}
                                onChange={(e) => updateAdminStep(idx, { title: e.target.value })}
                                placeholder="Step title"
                                style={{ ...inputStyle, width: "100%" }}
                              />
                            </div>

                            <div style={{ marginTop: 8 }}>
                              <input
                                value={step.description || ""}
                                onChange={(e) => updateAdminStep(idx, { description: e.target.value })}
                                placeholder="Description"
                                style={{ ...inputStyle, width: "100%" }}
                              />
                            </div>

                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <select
                                value={step.panel}
                                onChange={(e) =>
  				  updateAdminStep(idx, {
                                   panel: e.target.value as "RESUME_WO" | "QUALITY_INSPECTIONS" | "START_ATP" | "PRINT_APPLY_LABELS",
                                 })
                               }
                                style={{ ...inputStyle, flex: 1 }}
                              >
                                <option value="RESUME_WO">Resume Work Order</option>
                                <option value="QUALITY_INSPECTIONS">Quality Inspections</option>
                                <option value="START_ATP">Start ATP</option>
                                <option value="PRINT_APPLY_LABELS">Print + Apply Labels</option>
                              </select>

                              <input
                                type="number"
                                value={step.sortOrder}
                                onChange={(e) => updateAdminStep(idx, { sortOrder: Number(e.target.value) })}
                                placeholder="Sort"
                                style={{ ...inputStyle, width: 90, flex: "unset" as any }}
                              />
                            </div>

                            <div style={{ marginTop: 8 }}>
                              <label style={{ fontSize: 12, color: "#444" }}>
                                <input
                                  type="checkbox"
                                  checked={step.isActive}
                                  onChange={(e) => updateAdminStep(idx, { isActive: e.target.checked })}
                                  style={{ marginRight: 8 }}
                                />
                                Active
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkOrderList({
  rows,
  onOpen,
  emptyText,
}: {
  rows: WorkOrder[];
  onOpen: (wo: WorkOrder) => void;
  emptyText: string;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      {rows.length === 0 ? (
        <div style={{ color: "#666", padding: 10 }}>{emptyText}</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((wo) => (
            <div key={wo.work_order_number} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{wo.work_order_number}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                    {wo.item_number} • Qty {wo.open_wo_qty} • {wo.location_name}
                  </div>
                </div>
                <button style={btnAction} onClick={() => onOpen(wo)}>
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- styles ---------- */

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 18px",
  background: "white",
  borderBottom: "1px solid #eee",
};

const logoBox: React.CSSProperties = {
  height: 38,
  padding: "0 10px",
  borderRadius: 10,
  border: "1px solid #eee",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const shell: React.CSSProperties = {
  background: "white",
  border: "1px solid #eee",
  borderRadius: 18,
  overflow: "hidden",
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  minHeight: "calc(100vh - 120px)",
};

const leftRail: React.CSSProperties = {
  padding: 12,
  borderRight: "1px solid #eee",
  background: "#fbfbfc",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const rightRail: React.CSSProperties = {
  borderLeft: "1px solid #eee",
  background: "#fcfcfd",
  padding: 16,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 18,
};

const panelSection: React.CSSProperties = {
  paddingBottom: 6,
};

const railBtn: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: "1px solid #eaeaea",
  background: "white",
  cursor: "pointer",
};

const railBtnActive: React.CSSProperties = {
  ...railBtn,
  border: "1px solid #111",
  boxShadow: "0 1px 0 rgba(0, 0, 0, 0.06)",
};

const content: React.CSSProperties = {
  padding: 16,
};

const btnSmall: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const btnAction: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const card: React.CSSProperties = {
  border: "1px solid #f0f0f0",
  borderRadius: 14,
  padding: 12,
  background: "white",
};

const sideCard: React.CSSProperties = {
  border: "1px solid #eaeaea",
  borderRadius: 12,
  padding: 12,
  background: "white",
};

const sideCardMuted: React.CSSProperties = {
  border: "1px solid #eaeaea",
  borderRadius: 12,
  padding: 12,
  background: "white",
  fontSize: 13,
  color: "#666",
};

const errorBox: React.CSSProperties = {
  marginBottom: 12,
  padding: 12,
  borderRadius: 12,
  border: "1px solid #f5c2c7",
  background: "#f8d7da",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 14,
  outline: "none",
};