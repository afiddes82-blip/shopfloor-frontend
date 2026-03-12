// src/traveler/allegro/allegroRouter.ts
import type { StepRow } from "../../api/traveler";
import type { TravelerRouter, NextSuggestion, Panel } from "../types";
import { ALLEGRO_STEPS } from "./allegroSteps";
import { ALLEGRO_FORMS } from "./allegroForms";

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

function orderedCodes() {
  return [...ALLEGRO_STEPS]
    .map((s, idx) => ({
      code: s.stepCode,
      op: opFromStepCode(s.stepCode) ?? 999999,
      idx,
    }))
    .sort((a, b) => (a.op !== b.op ? a.op - b.op : a.idx - b.idx))
    .map((x) => x.code);
}

function getStep(stepCode: string) {
  return ALLEGRO_STEPS.find((s) => s.stepCode === stepCode);
}

function panelForStep(stepCode: string): Panel {
  return getStep(stepCode)?.panel ?? "RESUME_WO";
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

export const allegroRouter: TravelerRouter = {
  id: "ALLEGRO",
  label: "Allegro Router",
  forms: ALLEGRO_FORMS,

  getSteps(_wo, _rows) {
    return ALLEGRO_STEPS;
  },

  panelForStep,

  globalOrderedStepCodes(_wo) {
    return orderedCodes();
  },

  computeNextSuggestion(_wo, rows): NextSuggestion | null {
    const m = statusMap(rows);
    const codes = orderedCodes();

    for (const code of codes) {
      if (!isComplete(m, code)) {
        const panel = panelForStep(code);
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

  isLockedByGlobalOrder(_wo, stepCode, rows) {
    const m = statusMap(rows);
    const codes = orderedCodes();
    const idx = codes.indexOf(stepCode);

    if (idx <= 0) return false;
    if (isComplete(m, stepCode)) return false;

    for (let i = 0; i < idx; i++) {
      if (!isComplete(m, codes[i])) return true;
    }
    return false;
  },

  firstMissingPrereq(_wo, stepCode, rows) {
    const m = statusMap(rows);
    const codes = orderedCodes();
    const idx = codes.indexOf(stepCode);

    if (idx <= 0) return null;

    for (let i = 0; i < idx; i++) {
      const prior = codes[i];
      if (!isComplete(m, prior)) return prior;
    }
    return null;
  },
};