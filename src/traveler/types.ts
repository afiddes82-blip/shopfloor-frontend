// src/traveler/types.ts
import type { StepRow } from "../api/traveler";

export type Panel =
  | "START_WO"
  | "RESUME_WO"
  | "QUALITY_INSPECTIONS"
  | "START_ATP"
  | "PRINT_APPLY_LABELS";

export type OptionDef = {
  value: string;
  label: string;
};

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "checkbox" | "date";
  required?: boolean;
  options?: OptionDef[];
  placeholder?: string;
};

export type StepFormDef = {
  stepCode: string;
  title?: string;
  fields: FieldDef[];
  allowFail?: boolean;
  allowNA?: boolean;
};

export type StepDef = {
  stepCode: string;
  title: string;
  description?: string;
  panel?: Panel;
  sortOrder?: number;
  isActive?: boolean;
};

export type NextSuggestion = {
  panel: Panel;
  nextStepCode: string;
  stageLabel: string;
  action: string;
};

export type TravelerRouter = {
  id: string;
  label: string;
  forms: Record<string, StepFormDef>;
  getSteps: (wo: any | null, rows: StepRow[]) => StepDef[];
  panelForStep: (stepCode: string) => Panel;
  globalOrderedStepCodes: (wo: any | null) => string[];
  computeNextSuggestion: (wo: any | null, rows: StepRow[]) => NextSuggestion | null;
  isLockedByGlobalOrder: (wo: any | null, stepCode: string, rows: StepRow[]) => boolean;
  firstMissingPrereq: (wo: any | null, stepCode: string, rows: StepRow[]) => string | null;
};