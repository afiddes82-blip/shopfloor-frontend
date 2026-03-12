// src/traveler/elite/eliteMdRouter.ts
import type { Panel } from "../types";
import type { StepRow } from "../../api/traveler";
import { eliteMdVariantFromWoItem } from "./eliteMdConfig";

export type StepDef = {
  stepCode: string;
  title: string;
  description?: string;
  panel?: Panel;
};


type WorkOrder = {
  work_order_number: string;
  traveler_template: string;
  item_number?: string | null;
  item_desc?: string | null;
};

export const ELITE_MD_STEPS: StepDef[] = [
  { stepCode: "ELITE_MD_OP010_REV_CHECK", title: "OP010 Revision Check", description: "BOM/MOP/ATP revision" },
  { stepCode: "ELITE_MD_OP020_STATION1", title: "OP020 Station 1", description: "Select system + record electronic panel info" },
  { stepCode: "ELITE_MD_OP030_STATION2", title: "OP030 Station 2", description: "Confirm system selection" },
  { stepCode: "ELITE_MD_OP040_STATION3", title: "OP040 Station 3", description: "Confirm system + record rear panel S/N" },
  { stepCode: "ELITE_MD_OP050_ATP", title: "OP050 ATP Testing", description: "Run correct ATP + labels" },
  { stepCode: "ELITE_MD_OP060_QC_VERIFY", title: "OP060 Quality Control Verification", description: "Verify ATP, labels, FPY, WO, PN" },
  { stepCode: "ELITE_MD_OP070_PACKAGING", title: "OP070 Packaging", description: "Verify outer carton label" },
];

const PASS_FAIL_NA = [
  { value: "PASS", label: "PASS" },
  { value: "FAIL", label: "FAIL" },
  { value: "N_A", label: "N/A" },
];

export const ELITE_MD_FORMS: Record<string, any> = {
  ELITE_MD_OP010_REV_CHECK: {
    stepCode: "ELITE_MD_OP010_REV_CHECK",
    title: "OP010 Revision Check",
    fields: [
      { key: "bom_rev", label: "BOM Revision", type: "text", required: true },
      { key: "mop_rev", label: "MOP Revision", type: "text", required: true },
      { key: "atp_rev", label: "ATP Revision", type: "text", required: true },
    ],
  },

  ELITE_MD_OP020_STATION1: {
    stepCode: "ELITE_MD_OP020_STATION1",
    title: "OP020 Station 1",
    fields: [
      { key: "system_variant", label: "System Variant", type: "text", required: true },
      { key: "electronic_panel_sn", label: "Electronic Panel S/N", type: "text", required: false },
      { key: "msata_sn", label: "mSATA S/N", type: "text", required: false },
      { key: "electronic_panel_lot", label: "Electronic Panel Lot #", type: "text", required: false },
    ],
  },

  ELITE_MD_OP030_STATION2: {
    stepCode: "ELITE_MD_OP030_STATION2",
    title: "OP030 Station 2",
    fields: [
      { key: "confirm_variant", label: "Confirm Variant", type: "checkbox", required: true },
    ],
  },

  ELITE_MD_OP040_STATION3: {
    stepCode: "ELITE_MD_OP040_STATION3",
    title: "OP040 Station 3",
    fields: [
      { key: "rear_panel_sn", label: "Rear Panel S/N", type: "text", required: false },
      { key: "confirm_variant", label: "Confirm Variant", type: "checkbox", required: true },
    ],
  },

  ELITE_MD_OP050_ATP: {
    stepCode: "ELITE_MD_OP050_ATP",
    title: "OP050 ATP Testing",
    fields: [
      { key: "software_family", label: "Software (17774 or 1200000-K)", type: "text", required: false },
      { key: "electrical_safety", label: "Electrical Safety Test", type: "select", options: PASS_FAIL_NA, required: true },
      { key: "language_selection", label: "Language Selection Verification", type: "select", options: PASS_FAIL_NA, required: true },
      { key: "visual_inspection", label: "Visual Inspection Test", type: "select", options: PASS_FAIL_NA, required: true },
      { key: "noise_level", label: "Noise Level Test", type: "select", options: PASS_FAIL_NA, required: true },
      { key: "touch_display", label: "Touch Display Test", type: "select", options: PASS_FAIL_NA, required: true },
      { key: "vacuum_output", label: "Vacuum Output Test", type: "select", options: PASS_FAIL_NA, required: true },
      { key: "vacuum_pressure", label: "Vacuum Pressure Test", type: "select", options: PASS_FAIL_NA, required: true },
      { key: "camera_modality", label: "Camera Modality Test (17774 only)", type: "select", options: PASS_FAIL_NA, required: false },
      { key: "usb_polarity", label: "USB Polarity Test", type: "select", options: PASS_FAIL_NA, required: true },
      { key: "fluid_flow", label: "Fluid Flow Test", type: "select", options: PASS_FAIL_NA, required: true },
      { key: "touch_settings", label: "Touch Screen Settings", type: "select", options: PASS_FAIL_NA, required: true },
      { key: "power_switch", label: "Power On/Off Switch", type: "select", options: PASS_FAIL_NA, required: true },
    ],
  },

  ELITE_MD_OP060_QC_VERIFY: {
    stepCode: "ELITE_MD_OP060_QC_VERIFY",
    title: "OP060 QC Verification",
    fields: [
      { key: "correct_atp_used", label: "Correct ATP used?", type: "checkbox", required: true },
      { key: "atp_passed", label: "ATP passed?", type: "checkbox", required: true },
      { key: "serial_sequence_ok", label: "Serial number sequence verified?", type: "checkbox", required: true },
      { key: "labels_correct", label: "Correct labels printed?", type: "checkbox", required: true },
      { key: "fpy_closed", label: "FPY form completed & closed?", type: "checkbox", required: true },
      { key: "wo_ok", label: "Work Order # correct?", type: "checkbox", required: true },
      { key: "pn_ok", label: "Part Number correct?", type: "checkbox", required: true },
    ],
  },

  ELITE_MD_OP070_PACKAGING: {
    stepCode: "ELITE_MD_OP070_PACKAGING",
    title: "OP070 Packaging",
    fields: [
      { key: "carton_label_ok", label: "Outer carton label verified?", type: "checkbox", required: true },
    ],
  },
};


function opFromCode(stepCode: string): number | null {
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

export const eliteMdRouter = {
  id: "ELITE_MD",
  label: "Elite MD Router",

  forms: ELITE_MD_FORMS,

  getSteps(wo: WorkOrder | null, _rows: StepRow[]): StepDef[] {
    // You could tailor descriptions based on variant (ATP doc, labels)
    const v = wo ? eliteMdVariantFromWoItem(wo.item_number) : null;
    if (!v) return ELITE_MD_STEPS;

    return ELITE_MD_STEPS.map((s) => {
      if (s.stepCode === "ELITE_MD_OP050_ATP") {
        return {
          ...s,
          description: `Run ${v.atp_doc} • Unit label ${v.unitLabelPn} • Carton label ${v.cartonLabelPn}`,
        };
      }
      return s;
    });
  },

  panelForStep(stepCode: string): Panel {
    const step = ELITE_MD_STEPS.find((s: any) => s.stepCode === stepCode);
    if (step?.panel) return step.panel;

    if (stepCode.includes("_OP050_")) return "START_ATP";
    if (stepCode.includes("_OP060_")) return "QUALITY_INSPECTIONS";
    if (stepCode.includes("_OP070_")) return "PRINT_APPLY_LABELS";
    return "RESUME_WO";
  },

  globalOrderedStepCodes(_wo: WorkOrder | null): string[] {
    const withMeta = ELITE_MD_STEPS.map((s, idx) => ({
      code: s.stepCode,
      op: opFromCode(s.stepCode) ?? 999999,
      idx,
    }));
    withMeta.sort((a, b) => (a.op !== b.op ? a.op - b.op : a.idx - b.idx));
    return withMeta.map((x) => x.code);
  },

  computeNextSuggestion(wo: WorkOrder | null, rows: StepRow[]) {
    const m = statusMap(rows);
    const ordered = this.globalOrderedStepCodes(wo);

    for (const code of ordered) {
      if (!isComplete(m, code)) {
        const panel = this.panelForStep(code);
        const stageLabel =
          panel === "START_ATP" ? "ATP" : panel === "QUALITY_INSPECTIONS" ? "Quality Inspections" : panel === "PRINT_APPLY_LABELS" ? "Print + Apply Labels" : "Assembly";
        const action =
          panel === "START_ATP" ? "Go to ATP station" : panel === "QUALITY_INSPECTIONS" ? "Get a Quality Auditor" : panel === "PRINT_APPLY_LABELS" ? "Go to label / packaging station" : "Go to assembly station";
        return { panel, nextStepCode: code, stageLabel, action };
      }
    }
    return null;
  },

  isLockedByGlobalOrder(wo: WorkOrder | null, stepCode: string, rows: StepRow[]) {
    const m = statusMap(rows);
    const ordered = this.globalOrderedStepCodes(wo);
    const idx = ordered.indexOf(stepCode);
    if (idx <= 0) return false;
    if (isComplete(m, stepCode)) return false;

    for (let i = 0; i < idx; i++) {
      if (!isComplete(m, ordered[i])) return true;
    }
    return false;
  },

  firstMissingPrereq(wo: WorkOrder | null, stepCode: string, rows: StepRow[]) {
    const m = statusMap(rows);
    const ordered = this.globalOrderedStepCodes(wo);
    const idx = ordered.indexOf(stepCode);
    if (idx <= 0) return null;

    for (let i = 0; i < idx; i++) {
      const prior = ordered[i];
      if (!isComplete(m, prior)) return prior;
    }
    return null;
  },
} as const;

export type EliteMdRouter = typeof eliteMdRouter;