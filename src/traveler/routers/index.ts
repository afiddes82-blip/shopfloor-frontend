// src/traveler/routers/index.ts
import type { StepRow } from "../../api/traveler";
import type { Panel, NextSuggestion, TravelerRouter } from "../types";
import { SYNDEO120_STEPS } from "../syndeo/syndeo120Steps";
import { SYNDEO120_FORMS } from "../syndeo/syndeo120Forms";

import { eliteMdRouter } from "../elite/eliteMdRouter";
import { allegroRouter } from "../allegro/allegroRouter";

// ----------------------------
// Helpers
// ----------------------------
function normalizeTemplate(x?: string | null) {
  return String(x ?? "").trim().toUpperCase();
}

function opFromStepCode(stepCode: string): number | null {
  const m = stepCode.match(/_OP(\d+)_/);
  return m ? Number(m[1]) : null;
}

function statusMap(rows: StepRow[]) {
  const m = new Map<string, string>();
  for (const r of rows) m.set(r.STEP_CODE, r.STATUS);
  return m;
}

function isComplete(m: Map<string, string>, code: string) {
  return m.get(code) === "COMPLETE";
}

function orderedCodesFromSteps() {
  const withMeta = SYNDEO120_STEPS.map((s: any, idx: number) => ({
    code: s.stepCode,
    op: opFromStepCode(s.stepCode) ?? 999999,
    idx,
  }));
  withMeta.sort((a, b) => (a.op !== b.op ? a.op - b.op : a.idx - b.idx));
  return withMeta.map((x) => x.code);
}

function panelFromOp(stepCode: string): Panel {
  const op = opFromStepCode(stepCode);

  const isInspection = stepCode.includes("_INSP_") || stepCode.includes("_INSP");
  const isLabels = op !== null && op >= 200 && op <= 210;
  const isAtp = op !== null && op >= 100 && op <= 231;

  if (isLabels) return "PRINT_APPLY_LABELS";
  if (isInspection) return "QUALITY_INSPECTIONS";
  if (isAtp) return "START_ATP";
  return "RESUME_WO";
}


function stageLabelForPanel(panel: Panel) {
  if (panel === "START_ATP") return "ATP";
  if (panel === "QUALITY_INSPECTIONS") return "Quality Inspections";
  if (panel === "PRINT_APPLY_LABELS") return "Print + Apply Labels";
  return "Assembly";
}

function actionForPanel(panel: Panel) {
  if (panel === "START_ATP") return "Go to ATP station";
  if (panel === "QUALITY_INSPECTIONS") return "Get a Quality Auditor";
  if (panel === "PRINT_APPLY_LABELS") return "Go to label station / printer";
  return "Go to assembly station";
}

// ----------------------------
// Syndeo Router
// ----------------------------
const syndeoRouter: TravelerRouter = {
  id: "SYNDEO_120",
  label: "Syndeo 120 Router",
  forms: SYNDEO120_FORMS,

  getSteps(_wo: any | null, _rows: StepRow[]) {
    return SYNDEO120_STEPS;
  },

  panelForStep(stepCode: string) {
    const step = SYNDEO120_STEPS.find((s: any) => s.stepCode === stepCode);
    const stepAny = step as any;
    if (stepAny?.panel) return stepAny.panel as Panel;
    return panelFromOp(stepCode);
  },

  globalOrderedStepCodes(_wo: any | null) {
    return orderedCodesFromSteps();
  },

  computeNextSuggestion(_wo: any | null, rows: StepRow[]): NextSuggestion | null {
  const m = statusMap(rows);
  const codes = orderedCodesFromSteps();

  for (const code of codes) {
    if (!isComplete(m, code)) {
      const panel = this.panelForStep(code);
      return {
        panel,
        nextStepCode: code,
        stageLabel: stageLabelForPanel(panel),
        action: actionForPanel(panel),
      };
    }
  }
  return null;
},

  isLockedByGlobalOrder(_wo: any | null, stepCode: string, rows: StepRow[]) {
    const m = statusMap(rows);
    const codes = orderedCodesFromSteps();
    const idx = codes.indexOf(stepCode);

    if (idx <= 0) return false;
    if (isComplete(m, stepCode)) return false;

    for (let i = 0; i < idx; i++) {
      if (!isComplete(m, codes[i])) return true;
    }
    return false;
  },

  firstMissingPrereq(_wo: any | null, stepCode: string, rows: StepRow[]) {
    const m = statusMap(rows);
    const codes = orderedCodesFromSteps();
    const idx = codes.indexOf(stepCode);
    if (idx <= 0) return null;

    for (let i = 0; i < idx; i++) {
      const prior = codes[i];
      if (!isComplete(m, prior)) return prior;
    }
    return null;
  },
};

// ----------------------------
// Router Registry
// ----------------------------
export function getRouterForWorkOrder(wo: any | null): TravelerRouter | null {
  if (!wo) return null;

  const tpl = normalizeTemplate(wo.traveler_template);
  const item = String(wo.item_number ?? "").toUpperCase();
  const desc = String(wo.item_desc ?? "").toUpperCase();

  if (tpl.includes("SYNDEO") || item.includes("SYNDEO") || desc.includes("SYNDEO")) {
    return syndeoRouter;
  }

  if (tpl.includes("ELITE") || item.includes("ELITE") || desc.includes("ELITE")) {
    return eliteMdRouter;
  }

  if (tpl.includes("ALLEGRO") || item.includes("ALLEGRO") || desc.includes("ALLEGRO")) {
    return allegroRouter;
  }

  return null;
}