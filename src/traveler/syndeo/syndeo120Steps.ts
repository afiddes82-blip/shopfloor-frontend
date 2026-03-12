// src/traveler/syndeo/syndeo120Steps.ts

export type StepDef = {
  stepCode: string;
  title: string;
  description?: string;

  group?: "STATION" | "INSPECTION" | "ATP" | "LABEL" | "QC" | "PACK";
  isInspection?: boolean;
};

export const SYNDEO120_STEPS: StepDef[] = [
  // STATION 1
  {
    stepCode: "SYNDEO120_OP020_STATION1",
    title: "OP020 - Station 1",
    description: "Methods 1-2 + traceability + torque wrench calibration",
    group: "STATION",
  },
  {
    stepCode: "SYNDEO120_OP030_INSP_1_2",
    title: "OP030 - Inspection (Methods 1-2)",
    description: "Verify completion of Methods 1-2",
    group: "INSPECTION",
    isInspection: true,
  },

  // STATION 2
  {
    stepCode: "SYNDEO120_OP040_STATION2",
    title: "OP040 - Station 2",
    description: "Methods 3-7 + serial captures + torque tool calibrations",
    group: "STATION",
  },
  {
    stepCode: "SYNDEO120_OP050_INSP_3_7",
    title: "OP050 - Inspection (Methods 3-7)",
    description: "Verify completion of Methods 3-7",
    group: "INSPECTION",
    isInspection: true,
  },

  // STATION 3
  {
    stepCode: "SYNDEO120_OP060_STATION3",
    title: "OP060 - Station 3",
    description: "Methods 8-12 + RFID PCBA SN + torque screwdriver calibration",
    group: "STATION",
  },
  {
    stepCode: "SYNDEO120_OP070_INSP_8_12",
    title: "OP070 - Inspection (Methods 8-12)",
    description: "Verify completion of Methods 8-12",
    group: "INSPECTION",
    isInspection: true,
  },

  // STATION 4 (front)
  {
    stepCode: "SYNDEO120_OP080_STATION4",
    title: "OP080 - Station 4",
    description: "Methods 13-14",
    group: "STATION",
  },
  {
    stepCode: "SYNDEO120_OP090_INSP_13_14",
    title: "OP090 - Inspection (Methods 13-14)",
    description: "Verify completion of Methods 13-14",
    group: "INSPECTION",
    isInspection: true,
  },

  // ATP - initial + reflash + safety
  {
    stepCode: "SYNDEO120_OP100_ATP_BOOT",
    title: "OP100 - ATP Initial Boot-Up Test",
    description: "ATP Sections 8-10 (Pass/Fail)",
    group: "ATP",
  },
  {
    stepCode: "SYNDEO120_OP110_ATP_REFLASH",
    title: "OP110 - ATP Software Reflash",
    description: "ATP Section 11 (Pass/Fail/N/A)",
    group: "ATP",
  },
  {
    stepCode: "SYNDEO120_OP120_ATP_ELECTRICAL_SAFETY",
    title: "OP120 - ATP Electrical Safety Test",
    description: "ATP Section 12.1 (Pass/Fail)",
    group: "ATP",
  },
  {
    stepCode: "SYNDEO120_OP130_INSP_ELECTRICAL_SAFETY",
    title: "OP130 - Inspection (Electrical Safety)",
    description: "Verify electrical safety test complete",
    group: "INSPECTION",
    isInspection: true,
  },

  // STATION 4 (rear)
  {
    stepCode: "SYNDEO120_OP140_STATION4_REAR",
    title: "OP140 - Station 4 (Rear Install)",
    description: "Methods 15-16 + torque screwdriver calibration",
    group: "STATION",
  },
  {
    stepCode: "SYNDEO120_OP150_INSP_15_16",
    title: "OP150 - Inspection (Methods 15-16)",
    description: "Verify completion of Methods 15-16",
    group: "INSPECTION",
    isInspection: true,
  },

  // ATP - performance testing
  {
    stepCode: "SYNDEO120_OP160_ATP_PART1",
    title: "OP160 - ATP Part 1 Performance Test",
    description: "ATP Sections 13-25 (Pass/Fail)",
    group: "ATP",
  },
  {
    stepCode: "SYNDEO120_OP170_INSP_ATP_PART1",
    title: "OP170 - Inspection (ATP Part 1)",
    description: "Verify ATP Part 1 passed",
    group: "INSPECTION",
    isInspection: true,
  },
  {
    stepCode: "SYNDEO120_OP180_ATP_PART2",
    title: "OP180 - ATP Part 2",
    description: "ATP Sections 26-30 (Pass/Fail)",
    group: "ATP",
  },
  {
    stepCode: "SYNDEO120_OP190_INSP_ATP_PART2",
    title: "OP190 - Inspection (ATP Part 2)",
    description: "Verify ATP Part 2 passed",
    group: "INSPECTION",
    isInspection: true,
  },

  // LABEL PRINT + APPLY + INSPECT
  {
    stepCode: "SYNDEO120_OP200_PRINT_LABELS",
    title: "OP200 - Print Labels",
    description: "Print 4 labels (unit/carton mapping by assembly P/N)",
    group: "LABEL",
  },
  {
    stepCode: "SYNDEO120_OP210_APPLY_LABELS",
    title: "OP210 - Apply Device Labels",
    description: "Method 17 - adhere printed labels",
    group: "LABEL",
  },
  {
    stepCode: "SYNDEO120_OP220_INSP_LABELS_ATP",
    title: "OP220 - Inspect Labels / ATP",
    description: "Verify labels placed and required labels present",
    group: "INSPECTION",
    isInspection: true,
  },

  // QC VERIFICATION + TEST MODE CLOSURE
  {
    stepCode: "SYNDEO120_OP230_QC_VERIFICATION",
    title: "OP230 - Quality Control Verification",
    description: "ATP #/rev + SN checks + labels printed + FPY closed + WO verification",
    group: "QC",
  },
  {
    stepCode: "SYNDEO120_OP231_QC_TESTMODE_CLOSURE",
    title: "OP231 - QC Device Test Mode Closure",
    description: "ATP Section 36 - set ready / close test mode",
    group: "QC",
  },

  // PACK + FINAL QC + SIGNOFF
  {
    stepCode: "SYNDEO120_OP240_PACKING",
    title: "OP240 - Packing",
    description: "Carton labels + accessory box + handpiece kit",
    group: "PACK",
  },
  {
    stepCode: "SYNDEO120_OP250_QC_FINAL_RELEASE",
    title: "OP250 - QC Final Release",
    description: "Verify ship label, accessories/COC, unit label matches carton, apply green sticker",
    group: "QC",
  },
  {
    stepCode: "SYNDEO120_OP260_QC_SIGNOFF",
    title: "OP260 - QC Signoff",
    description: "Verified/approved by QC inspector (print name)",
    group: "QC",
  },
];