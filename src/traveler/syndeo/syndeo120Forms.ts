// src/traveler/syndeo/syndeo120Forms.ts
// Full Syndeo 120 form map (ASCII-only labels to avoid Vite unicode/encoding issues)

export type FieldType = "text" | "date" | "checkbox" | "select" | "number" | "textarea";

export type OptionDef = { value: string; label: string };

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: OptionDef[];
  help?: string;
};

export type StepFormDef = {
  stepCode: string;
  allowNA?: boolean;
  allowFail?: boolean;
  fields: FieldDef[];
};

const PASS_FAIL: OptionDef[] = [
  { value: "PASS", label: "PASS" },
  { value: "FAIL", label: "FAIL" },
];

const YES_NO_NA: OptionDef[] = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
  { value: "N_A", label: "N/A" },
];

const PERFORMED_YES_NO: OptionDef[] = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No (N/A)" },
];

function pf(stepCode: string, label: string, allowFail = true, allowNA = false): StepFormDef {
  return {
    stepCode,
    allowFail,
    allowNA,
    fields: [
      {
        key: "result",
        label,
        type: "select",
        required: true,
        options: allowNA ? [...PASS_FAIL, { value: "N_A", label: "N/A" }] : PASS_FAIL,
      },
      { key: "notes", label: "Notes (optional)", type: "textarea" },
    ],
  };
}

export const SYNDEO120_FORMS: Record<string, StepFormDef> = {
  // -------------------------
  // STATION 1
  // -------------------------
  SYNDEO120_OP020_STATION1: {
    stepCode: "SYNDEO120_OP020_STATION1",
    fields: [
      { key: "method1_complete", label: "Method 1 complete", type: "checkbox", required: true },
      { key: "pump_assembly_sn", label: "Pump Assembly SN", type: "text", required: true },
      { key: "power_entry_assembly_lot", label: "Power Entry Assembly Lot", type: "text", required: true },
      { key: "light_panel_sn", label: "Light Panel SN", type: "text", required: true },
      { key: "light_panel_lot", label: "Light Panel Lot", type: "text", required: true },
      { key: "method2_complete", label: "Method 2 complete", type: "checkbox", required: true },
      { key: "torque_wrench_cal_id", label: "Torque Wrench Cal ID", type: "text", required: true },
      { key: "torque_wrench_due_date", label: "Torque Wrench Due Date", type: "date", required: true },
    ],
  },

  SYNDEO120_OP030_INSP_1_2: {
    stepCode: "SYNDEO120_OP030_INSP_1_2",
    fields: [{ key: "verified", label: "Verified completion of Methods 1-2", type: "checkbox", required: true }],
  },

  // -------------------------
  // STATION 2
  // -------------------------
  SYNDEO120_OP040_STATION2: {
    stepCode: "SYNDEO120_OP040_STATION2",
    fields: [
      { key: "method3_complete", label: "Method 3 complete (install monitor)", type: "checkbox", required: true },
      { key: "monitor_sn", label: "Monitor SN", type: "text", required: true },

      { key: "method4_complete", label: "Method 4 complete (install speaker)", type: "checkbox", required: true },
      { key: "method5_complete", label: "Method 5 complete (install fittings)", type: "checkbox", required: true },

      { key: "method6_complete", label: "Method 6 complete (bracket/cover)", type: "checkbox", required: true },
      { key: "hardware_controller_pcba_sn", label: "Hardware Controller PCBA SN", type: "text", required: true },

      { key: "method7_complete", label: "Method 7 complete (install side cradles)", type: "checkbox", required: true },

      { key: "torque_wrench_cal_id", label: "Torque Wrench Cal ID", type: "text", required: true },
      { key: "torque_wrench_due_date", label: "Torque Wrench Due Date", type: "date", required: true },
      { key: "torque_screwdriver_cal_id", label: "Torque Screwdriver Cal ID", type: "text", required: true },
      { key: "torque_screwdriver_due_date", label: "Torque Screwdriver Due Date", type: "date", required: true },
    ],
  },

  SYNDEO120_OP050_INSP_3_7: {
    stepCode: "SYNDEO120_OP050_INSP_3_7",
    fields: [{ key: "verified", label: "Verified completion of Methods 3-7", type: "checkbox", required: true }],
  },

  // -------------------------
  // STATION 3
  // -------------------------
  SYNDEO120_OP060_STATION3: {
    stepCode: "SYNDEO120_OP060_STATION3",
    fields: [
      { key: "method8_complete", label: "Method 8 complete", type: "checkbox", required: true },
      { key: "method9_complete", label: "Method 9 complete", type: "checkbox", required: true },
      { key: "method10_complete", label: "Method 10 complete", type: "checkbox", required: true },
      { key: "method11_complete", label: "Method 11 complete", type: "checkbox", required: true },
      { key: "method12_complete", label: "Method 12 complete", type: "checkbox", required: true },

      { key: "rfid_pcba_sn", label: "RFID PCBA SN", type: "text", required: true },

      { key: "torque_screwdriver_cal_id", label: "Torque Screwdriver Cal ID", type: "text", required: true },
      { key: "torque_screwdriver_due_date", label: "Torque Screwdriver Due Date", type: "date", required: true },
    ],
  },

  SYNDEO120_OP070_INSP_8_12: {
    stepCode: "SYNDEO120_OP070_INSP_8_12",
    fields: [{ key: "verified", label: "Verified completion of Methods 8-12", type: "checkbox", required: true }],
  },

  // -------------------------
  // STATION 4 (front)
  // -------------------------
  SYNDEO120_OP080_STATION4: {
    stepCode: "SYNDEO120_OP080_STATION4",
    fields: [
      { key: "method13_complete", label: "Method 13 complete", type: "checkbox", required: true },
      { key: "method14_complete", label: "Method 14 complete", type: "checkbox", required: true },
    ],
  },

  SYNDEO120_OP090_INSP_13_14: {
    stepCode: "SYNDEO120_OP090_INSP_13_14",
    fields: [{ key: "verified", label: "Verified completion of Methods 13-14", type: "checkbox", required: true }],
  },

  // -------------------------
  // ATP
  // -------------------------
  SYNDEO120_OP100_ATP_BOOT: pf("SYNDEO120_OP100_ATP_BOOT", "Result"),

  SYNDEO120_OP110_ATP_REFLASH: {
    stepCode: "SYNDEO120_OP110_ATP_REFLASH",
    allowFail: true,
    allowNA: true,
    fields: [
      {
        key: "performed",
        label: "Performed reflash?",
        type: "select",
        required: true,
        options: PERFORMED_YES_NO,
      },
      {
        key: "result",
        label: "Result",
        type: "select",
        required: true,
        options: [...PASS_FAIL, { value: "N_A", label: "N/A" }],
      },
      { key: "notes", label: "Notes (optional)", type: "textarea" },
    ],
  },

  SYNDEO120_OP120_ATP_ELECTRICAL_SAFETY: pf("SYNDEO120_OP120_ATP_ELECTRICAL_SAFETY", "Electrical Safety Result"),

  SYNDEO120_OP130_INSP_ELECTRICAL_SAFETY: {
    stepCode: "SYNDEO120_OP130_INSP_ELECTRICAL_SAFETY",
    fields: [{ key: "verified", label: "Verified electrical safety test complete", type: "checkbox", required: true }],
  },

  // -------------------------
  // STATION 4 (rear)
  // -------------------------
  SYNDEO120_OP140_STATION4_REAR: {
    stepCode: "SYNDEO120_OP140_STATION4_REAR",
    fields: [
      { key: "method15_complete", label: "Method 15 complete", type: "checkbox", required: true },
      { key: "method16_complete", label: "Method 16 complete", type: "checkbox", required: true },
      { key: "torque_screwdriver_cal_id", label: "Torque Screwdriver Cal ID", type: "text", required: true },
      { key: "torque_screwdriver_due_date", label: "Torque Screwdriver Due Date", type: "date", required: true },
    ],
  },

  SYNDEO120_OP150_INSP_15_16: {
    stepCode: "SYNDEO120_OP150_INSP_15_16",
    fields: [{ key: "verified", label: "Verified completion of Methods 15-16", type: "checkbox", required: true }],
  },

  // -------------------------
  // ATP Performance
  // -------------------------
  SYNDEO120_OP160_ATP_PART1: pf("SYNDEO120_OP160_ATP_PART1", "ATP Part 1 Result", true, false),

  SYNDEO120_OP170_INSP_ATP_PART1: {
    stepCode: "SYNDEO120_OP170_INSP_ATP_PART1",
    fields: [{ key: "verified", label: "Verified ATP Part 1 passed", type: "checkbox", required: true }],
  },

  SYNDEO120_OP180_ATP_PART2: pf("SYNDEO120_OP180_ATP_PART2", "ATP Part 2 Result", true, false),

  SYNDEO120_OP190_INSP_ATP_PART2: {
    stepCode: "SYNDEO120_OP190_INSP_ATP_PART2",
    fields: [{ key: "verified", label: "Verified ATP Part 2 passed", type: "checkbox", required: true }],
  },

  // -------------------------
  // Labels
  // -------------------------
  SYNDEO120_OP200_PRINT_LABELS: {
    stepCode: "SYNDEO120_OP200_PRINT_LABELS",
    fields: [
      { key: "assembly_pn", label: "Assembly P/N", type: "text", required: true },
      { key: "unit_label_pn", label: "Unit Label P/N", type: "text", required: true },
      { key: "carton_label_pn", label: "Carton Label P/N", type: "text", required: true },
      { key: "printed", label: "Labels printed", type: "checkbox", required: true },
      { key: "notes", label: "Notes (optional)", type: "textarea" },
    ],
  },

  SYNDEO120_OP210_APPLY_LABELS: {
    stepCode: "SYNDEO120_OP210_APPLY_LABELS",
    fields: [{ key: "labels_applied", label: "All required labels applied", type: "checkbox", required: true }],
  },

  SYNDEO120_OP220_INSP_LABELS_ATP: {
    stepCode: "SYNDEO120_OP220_INSP_LABELS_ATP",
    fields: [{ key: "verified", label: "Verified labels present and correctly placed", type: "checkbox", required: true }],
  },

  // -------------------------
  // QC
  // -------------------------
  SYNDEO120_OP230_QC_VERIFICATION: {
    stepCode: "SYNDEO120_OP230_QC_VERIFICATION",
    allowFail: true,
    fields: [
      { key: "atp_number", label: "ATP Number", type: "text", required: true },
      { key: "atp_revision", label: "ATP Revision", type: "text", required: true },
      { key: "atp_result", label: "ATP Result", type: "select", required: true, options: PASS_FAIL },
      { key: "unit_sn_verified", label: "Verified serial number matches ATP/docs", type: "checkbox", required: true },
      { key: "labels_verified", label: "Verified labels printed/applied", type: "checkbox", required: true },
      { key: "fpy_closed", label: "FPY closed", type: "select", required: true, options: YES_NO_NA },
      { key: "notes", label: "Notes (optional)", type: "textarea" },
    ],
  },

  SYNDEO120_OP231_QC_TESTMODE_CLOSURE: {
    stepCode: "SYNDEO120_OP231_QC_TESTMODE_CLOSURE",
    fields: [{ key: "set_ready", label: "ATP Section 36 complete (unit set ready)", type: "checkbox", required: true }],
  },

  // -------------------------
  // Packing + final QC
  // -------------------------
  SYNDEO120_OP240_PACKING: {
    stepCode: "SYNDEO120_OP240_PACKING",
    fields: [
      { key: "packed", label: "Packed per instruction", type: "checkbox", required: true },
      { key: "accessory_box_pn", label: "Accessory Box P/N used", type: "text", required: true },
      { key: "handpiece_kit_pn", label: "Handpiece Kit P/N used", type: "text", required: true },
    ],
  },

  SYNDEO120_OP250_QC_FINAL_RELEASE: {
    stepCode: "SYNDEO120_OP250_QC_FINAL_RELEASE",
    fields: [
      { key: "ship_label_matches", label: "Part # matches shipping label", type: "checkbox", required: true },
      { key: "coc_attached", label: "Accessories & COC attached", type: "checkbox", required: true },
      { key: "unit_matches_carton", label: "Unit label matches carton label", type: "checkbox", required: true },
      { key: "green_sticker", label: "Green sticker applied", type: "checkbox", required: true },
    ],
  },

  SYNDEO120_OP260_QC_SIGNOFF: {
    stepCode: "SYNDEO120_OP260_QC_SIGNOFF",
    fields: [
      { key: "qc_inspector_name", label: "QC Inspector Name", type: "text", required: true },
      { key: "approved", label: "Approved", type: "checkbox", required: true },
    ],
  },
};