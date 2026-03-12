// src/traveler/allegro/allegroSteps.ts
import type { Panel } from "../types";

export type StepDef = {
  stepCode: string;
  title: string;
  description?: string;
  group?: "STATION" | "INSPECTION" | "ATP" | "LABEL" | "QC" | "PACK";
  isInspection?: boolean;
  panel: Panel;
};

export const ALLEGRO_STEPS: StepDef[] = [
  {
    stepCode: "ALLEGRO_OP010_REV_CHECK",
    title: "OP010 - Verify Document Revisions",
    description: "Verify assembly, MOP, and ATP revisions",
    group: "STATION",
    panel: "RESUME_WO",
  },
  {
    stepCode: "ALLEGRO_OP020_STATION1",
    title: "OP020 - Station 1",
    description: "Install nylon rivets, damping sheet, coupling, LED, regulator, power supply, LCD assembly",
    group: "STATION",
    panel: "RESUME_WO",
  },
  {
    stepCode: "ALLEGRO_OP030_INSP_1_2",
    title: "OP030 - Inspection Method 1-2",
    description: "Verify completion of steps performed in Station 1",
    group: "INSPECTION",
    isInspection: true,
    panel: "QUALITY_INSPECTIONS",
  },
  {
    stepCode: "ALLEGRO_OP040_STATION2",
    title: "OP040 - Station 2",
    description: "Install pump assembly, tubing inlet, power entry, wiring, dual USB, main cable, cable management",
    group: "STATION",
    panel: "RESUME_WO",
  },
  {
    stepCode: "ALLEGRO_OP050_INSP_3_7",
    title: "OP050 - Inspection Method 3-7",
    description: "Verify completion of steps performed in Station 2",
    group: "INSPECTION",
    isInspection: true,
    panel: "QUALITY_INSPECTIONS",
  },
  {
    stepCode: "ALLEGRO_OP060_STATION3",
    title: "OP060 - Station 3",
    description: "Assemble LCD, ribbon cable, control board, manifold, drawer, hinges, door",
    group: "STATION",
    panel: "RESUME_WO",
  },
  {
    stepCode: "ALLEGRO_OP070_INSP_8_12",
    title: "OP070 - Inspection Method 8-12",
    description: "Verify completion of steps performed in Station 3",
    group: "INSPECTION",
    isInspection: true,
    panel: "QUALITY_INSPECTIONS",
  },
  {
    stepCode: "ALLEGRO_OP080_STATION4",
    title: "OP080 - Station 4",
    description: "Install shell assembly, bumpers, side panels, rail",
    group: "STATION",
    panel: "RESUME_WO",
  },
  {
    stepCode: "ALLEGRO_OP090_INSP_13_14",
    title: "OP090 - Inspection Method 13-14",
    description: "Verify completion of steps performed in Station 4",
    group: "INSPECTION",
    isInspection: true,
    panel: "QUALITY_INSPECTIONS",
  },
  {
    stepCode: "ALLEGRO_OP110_ATP_ELECTRICAL_SAFETY",
    title: "OP110 - ATP Electrical Safety Test",
    description: "Perform Section 3 of ATP-138 or ATP-139",
    group: "ATP",
    panel: "START_ATP",
  },
  {
    stepCode: "ALLEGRO_OP120_ATP_NOISE",
    title: "OP120 - ATP Noise Level Test",
    description: "Perform Section 4 of ATP-138 or ATP-139",
    group: "ATP",
    panel: "START_ATP",
  },
  {
    stepCode: "ALLEGRO_OP130_INSP_ELECTRICAL_SAFETY",
    title: "OP130 - Inspection Method - Electrical Safety Test",
    description: "Verify completion of the electrical safety test",
    group: "INSPECTION",
    isInspection: true,
    panel: "QUALITY_INSPECTIONS",
  },
  {
    stepCode: "ALLEGRO_OP131_INSP_NOISE",
    title: "OP131 - Inspection Method Noise Level Test",
    description: "Verify completion of the noise level test",
    group: "INSPECTION",
    isInspection: true,
    panel: "QUALITY_INSPECTIONS",
  },
  {
    stepCode: "ALLEGRO_OP140_ATP_PERFORMANCE",
    title: "OP140 - ATP Performance",
    description: "Perform visual inspection, functional/performance, and power on/off key sections",
    group: "ATP",
    panel: "START_ATP",
  },
  {
    stepCode: "ALLEGRO_OP170_INSP_ATP_PART1",
    title: "OP170 - Inspection Method ATP Part 1",
    description: "Verify ATP was completed and all tests successfully passed",
    group: "INSPECTION",
    isInspection: true,
    panel: "QUALITY_INSPECTIONS",
  },
  {
    stepCode: "ALLEGRO_OP200_PRINT_LABELS",
    title: "OP200 - Print 4 Labels",
    description: "Print and place unit/carton labels and duplicates",
    group: "LABEL",
    panel: "PRINT_APPLY_LABELS",
  },
  {
    stepCode: "ALLEGRO_OP210_DEVICE_LABELING",
    title: "OP210 - Device Labeling",
    description: "Apply label per ATP and attach cover plate over dual USB",
    group: "LABEL",
    panel: "PRINT_APPLY_LABELS",
  },
  {
    stepCode: "ALLEGRO_OP220_INSP_TESTING_STATION_ATP",
    title: "OP220 - Inspect Testing Station ATP",
    description: "Verify ATP completion, BF labels, waste container label, Allegro unit label",
    group: "INSPECTION",
    isInspection: true,
    panel: "QUALITY_INSPECTIONS",
  },
  {
    stepCode: "ALLEGRO_OP230_QC_VERIFICATION",
    title: "OP230 - Quality Control Verification",
    description: "Verify ATP, labels, serials, FPY, work order, and part numbers",
    group: "QC",
    panel: "QUALITY_INSPECTIONS",
  },
  {
    stepCode: "ALLEGRO_OP240_PACKING",
    title: "OP240 - Packing",
    description: "Verify carton label, accessory box, and black handpiece kit",
    group: "PACK",
    panel: "PRINT_APPLY_LABELS",
  },
  {
    stepCode: "ALLEGRO_OP250_QC_FINAL_RELEASE",
    title: "OP250 - QC Final Release of Finished Goods",
    description: "Verify shipping label match, accessories/COC, unit/carton label match, green sticker",
    group: "QC",
    panel: "QUALITY_INSPECTIONS",
  },
  {
    stepCode: "ALLEGRO_OP260_QC_SIGNOFF",
    title: "OP260 - Verified and Approved by Quality Control Inspector",
    description: "QC inspector signoff",
    group: "QC",
    panel: "QUALITY_INSPECTIONS",
  },
];