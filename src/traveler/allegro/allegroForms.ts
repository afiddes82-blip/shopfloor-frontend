// src/traveler/allegro/allegroForms.ts
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


const YES_NO: OptionDef[] = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
];

const YES_NO_NA: OptionDef[] = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
  { value: "N_A", label: "N/A" },
];

export const ALLEGRO_FORMS: Record<string, StepFormDef> = {
  ALLEGRO_OP010_REV_CHECK: {
    stepCode: "ALLEGRO_OP010_REV_CHECK",
    fields: [
      { key: "assembly_pn", label: "Assembly P/N", type: "text", required: true },
      { key: "assembly_rev", label: "Assembly Rev", type: "text", required: true },
      { key: "mop_number", label: "MOP Number", type: "text", required: true },
      { key: "mop_rev", label: "MOP Rev", type: "text", required: true },
      { key: "atp_number", label: "ATP Number", type: "text", required: true },
      { key: "atp_rev", label: "ATP Rev", type: "text", required: true },
    ],
  },

  ALLEGRO_OP020_STATION1: {
    stepCode: "ALLEGRO_OP020_STATION1",
    fields: [
      { key: "install_nylon_rivets", label: "Install Nylon Rivets", type: "checkbox", required: true },
      { key: "install_damping_sheet_ssr", label: "Install Damping Sheet / Plate / SSR", type: "checkbox", required: true },
      { key: "install_foam_coupling", label: "Install Foam and Coupling", type: "checkbox", required: true },
      { key: "install_blue_led_light", label: "Install Blue LED Light", type: "checkbox", required: true },
      { key: "install_regulator_assembly", label: "Install Regulator Assembly", type: "checkbox", required: true },
      { key: "install_power_supply", label: "Install Power Supply", type: "checkbox", required: true },
      { key: "install_lcd_assembly", label: "Install LCD Assembly", type: "checkbox", required: true },
    ],
  },

  ALLEGRO_OP030_INSP_1_2: {
    stepCode: "ALLEGRO_OP030_INSP_1_2",
    fields: [{ key: "verified", label: "Verified completion of Station 1", type: "checkbox", required: true }],
  },

  ALLEGRO_OP040_STATION2: {
    stepCode: "ALLEGRO_OP040_STATION2",
    fields: [
      { key: "install_pump_assembly", label: "Install Pump Assembly", type: "checkbox", required: true },
      { key: "pump_assembly_sn", label: "Pump Assembly SN", type: "text", required: true },
      { key: "install_pump_tubing_receiver", label: "Install Pump Tubing Inlet and Canister Receiver", type: "checkbox", required: true },
      { key: "install_power_entry", label: "Install Power Entry Assembly", type: "checkbox", required: true },
      { key: "pump_power_entry_wiring", label: "Perform Pump and Power Entry Wiring", type: "checkbox", required: true },
      { key: "install_dual_usb", label: "Install Dual USB Assembly", type: "checkbox", required: true },
      { key: "install_allegro_main_cable", label: "Install Allegro Main Cable", type: "checkbox", required: true },
      { key: "cable_management_muffler", label: "Perform Cable Management and Muffler Assembly Installation", type: "checkbox", required: true },
    ],
  },

  ALLEGRO_OP050_INSP_3_7: {
    stepCode: "ALLEGRO_OP050_INSP_3_7",
    fields: [{ key: "verified", label: "Verified completion of Station 2", type: "checkbox", required: true }],
  },

  ALLEGRO_OP060_STATION3: {
    stepCode: "ALLEGRO_OP060_STATION3",
    fields: [
      { key: "assemble_lcd", label: "Assemble LCD Assembly", type: "checkbox", required: true },
      { key: "assemble_ribbon_cable", label: "Assemble Allegro Ribbon Cable Assembly", type: "checkbox", required: true },
      { key: "assemble_control_board", label: "Assemble Allegro Control Board Assembly", type: "checkbox", required: true },
      { key: "install_control_board_and_ribbon", label: "Install Control Board and Ribbon Cable Assembly", type: "checkbox", required: true },
      { key: "install_bottom_weld_plate_drawer", label: "Install Bottom Weld Plate and Drawer", type: "checkbox", required: true },
      { key: "install_hinge_and_catch", label: "Install Door Hinge Assembly and Magnetic Catch", type: "checkbox", required: true },
      { key: "install_allegro_door", label: "Install Allegro Door Assembly", type: "checkbox", required: true },
      { key: "install_manifold", label: "Install Manifold Assembly", type: "checkbox", required: true },
    ],
  },

  ALLEGRO_OP070_INSP_8_12: {
    stepCode: "ALLEGRO_OP070_INSP_8_12",
    fields: [{ key: "verified", label: "Verified completion of Station 3", type: "checkbox", required: true }],
  },

  ALLEGRO_OP080_STATION4: {
    stepCode: "ALLEGRO_OP080_STATION4",
    fields: [
      { key: "install_shell_and_bumpers", label: "Install Allegro Shell Assembly and Bumpers", type: "checkbox", required: true },
      { key: "install_side_panels", label: "Install Side Panels", type: "checkbox", required: true },
      { key: "install_rail", label: "Install Rail", type: "checkbox", required: true },
    ],
  },

  ALLEGRO_OP090_INSP_13_14: {
    stepCode: "ALLEGRO_OP090_INSP_13_14",
    fields: [{ key: "verified", label: "Verified completion of Station 4", type: "checkbox", required: true }],
  },

  ALLEGRO_OP110_ATP_ELECTRICAL_SAFETY: {
    stepCode: "ALLEGRO_OP110_ATP_ELECTRICAL_SAFETY",
    allowFail: true,
    fields: [
      { key: "atp_number", label: "ATP Number", type: "text", required: true },
      { key: "electrical_safety_result", label: "Electrical Safety Test", type: "select", required: true, options: PASS_FAIL },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },

  ALLEGRO_OP120_ATP_NOISE: {
    stepCode: "ALLEGRO_OP120_ATP_NOISE",
    allowFail: true,
    fields: [
      { key: "atp_number", label: "ATP Number", type: "text", required: true },
      { key: "noise_level_result", label: "Noise Level Test", type: "select", required: true, options: PASS_FAIL },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },

  ALLEGRO_OP130_INSP_ELECTRICAL_SAFETY: {
    stepCode: "ALLEGRO_OP130_INSP_ELECTRICAL_SAFETY",
    fields: [{ key: "verified", label: "Verified electrical safety test complete", type: "checkbox", required: true }],
  },

  ALLEGRO_OP131_INSP_NOISE: {
    stepCode: "ALLEGRO_OP131_INSP_NOISE",
    fields: [{ key: "verified", label: "Verified noise level test complete", type: "checkbox", required: true }],
  },

  ALLEGRO_OP140_ATP_PERFORMANCE: {
    stepCode: "ALLEGRO_OP140_ATP_PERFORMANCE",
    allowFail: true,
    fields: [
      { key: "atp_number", label: "ATP Number", type: "text", required: true },
      { key: "visual_inspection_result", label: "Section 2 Visual Inspection", type: "select", required: true, options: PASS_FAIL },
      { key: "functional_performance_result", label: "Section 5 Functional and Performance", type: "select", required: true, options: PASS_FAIL },
      { key: "power_on_off_key_result", label: "Section 6 Power On/Off Key", type: "select", required: true, options: PASS_FAIL },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },

  ALLEGRO_OP170_INSP_ATP_PART1: {
    stepCode: "ALLEGRO_OP170_INSP_ATP_PART1",
    fields: [{ key: "verified", label: "Verified ATP completed and passed", type: "checkbox", required: true }],
  },

  ALLEGRO_OP200_PRINT_LABELS: {
    stepCode: "ALLEGRO_OP200_PRINT_LABELS",
    fields: [
      { key: "assembly_pn", label: "Assembly P/N", type: "text", required: true },
      { key: "unit_label_pn", label: "Unit Label P/N", type: "text", required: true },
      { key: "carton_label_pn", label: "Carton Label P/N", type: "text", required: true },
      { key: "label_1_unit_printed", label: "Label #1 for Unit printed", type: "checkbox", required: true },
      { key: "label_2_carton_printed", label: "Label #2 for Carton/Box printed", type: "checkbox", required: true },
      { key: "label_3_duplicate_unit_printed", label: "Label #3 duplicate of unit printed", type: "checkbox", required: true },
      { key: "label_4_duplicate_carton_printed", label: "Label #4 duplicate of carton printed", type: "checkbox", required: true },
    ],
  },

  ALLEGRO_OP210_DEVICE_LABELING: {
    stepCode: "ALLEGRO_OP210_DEVICE_LABELING",
    fields: [
      { key: "adhere_label_per_atp", label: "Adhere label on device per ATP Section 7", type: "checkbox", required: true },
      { key: "attach_cover_plate_over_dual_usb", label: "Attach cover plate over dual USB", type: "checkbox", required: true },
    ],
  },

  ALLEGRO_OP220_INSP_TESTING_STATION_ATP: {
    stepCode: "ALLEGRO_OP220_INSP_TESTING_STATION_ATP",
    fields: [
      { key: "verify_atp_completion", label: "Verify completion of ATP", type: "checkbox", required: true },
      { key: "verify_three_bf_labels", label: "Verify 3 BF labels", type: "checkbox", required: true },
      { key: "verify_waste_container_label", label: "Verify Waste Container Label", type: "checkbox", required: true },
      { key: "verify_allegro_unit_label", label: "Verify Allegro Unit Label", type: "checkbox", required: true },
    ],
  },

  ALLEGRO_OP230_QC_VERIFICATION: {
    stepCode: "ALLEGRO_OP230_QC_VERIFICATION",
    allowFail: true,
    fields: [
      { key: "verify_atp_number", label: "ATP #", type: "text", required: true },
      { key: "verify_atp_rev", label: "ATP Rev", type: "text", required: true },
      { key: "verify_atp_test", label: "Verify ATP Test", type: "select", required: true, options: PASS_FAIL },
      { key: "serial_matches_all_docs", label: "Serial Number matches COC / Router / Electrical Safety Test", type: "select", required: true, options: YES_NO },
      { key: "printed_labels_verified", label: "Verify Printed Labels", type: "select", required: true, options: YES_NO },
      { key: "unit_label_pn", label: "Unit Label P/N", type: "text", required: true },
      { key: "unit_label_rev", label: "Unit Label Rev", type: "text", required: true },
      { key: "carton_label_pn", label: "Carton/Box Label P/N", type: "text", required: true },
      { key: "carton_label_rev", label: "Carton/Box Label Rev", type: "text", required: true },
      { key: "secondary_label_applicable", label: "Secondary Label", type: "select", required: true, options: YES_NO_NA },
      { key: "secondary_label_pn", label: "Secondary Label P/N", type: "text", required: false },
      { key: "secondary_label_rev", label: "Secondary Label Rev", type: "text", required: false },
      { key: "fpy_closed", label: "Verify FPY form completed and closed", type: "select", required: true, options: YES_NO_NA },
      { key: "verify_work_order", label: "Verify Work Order #", type: "select", required: true, options: YES_NO },
      { key: "verify_part_number", label: "Verify Part number on all COC / Unit Label / Carton Label", type: "select", required: true, options: YES_NO },
    ],
  },

  ALLEGRO_OP240_PACKING: {
    stepCode: "ALLEGRO_OP240_PACKING",
    fields: [
      { key: "verify_outer_carton_label", label: "Verify correct labels placed on outer carton", type: "checkbox", required: true },
      { key: "verify_accessory_box_included", label: "Verify Accessory Box Included", type: "checkbox", required: true },
      { key: "verify_black_handpiece_kit_included", label: "Verify Black Handpiece Kit Included", type: "checkbox", required: true },
    ],
  },

  ALLEGRO_OP250_QC_FINAL_RELEASE: {
    stepCode: "ALLEGRO_OP250_QC_FINAL_RELEASE",
    fields: [
      { key: "verify_shipping_label_matches_unit", label: "Verify shipping label part number matches unit label", type: "checkbox", required: true },
      { key: "verify_two_boxes_and_coc_attached", label: "Verify 2 boxes of accessories and COC are attached", type: "checkbox", required: true },
      { key: "verify_unit_label_matches_carton", label: "Verify unit label matches outer carton label", type: "checkbox", required: true },
      { key: "green_sticker_applied", label: "Initial green sticker and apply on shipping box label", type: "checkbox", required: true },
    ],
  },

  ALLEGRO_OP260_QC_SIGNOFF: {
    stepCode: "ALLEGRO_OP260_QC_SIGNOFF",
    fields: [
      { key: "qc_inspector_name", label: "Quality Control Inspector (Print Name)", type: "text", required: true },
      { key: "approved", label: "Verified By", type: "checkbox", required: true },
    ],
  },
};