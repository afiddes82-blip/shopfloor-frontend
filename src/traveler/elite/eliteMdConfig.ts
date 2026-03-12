// src/traveler/elite/eliteMdConfig.ts
export type EliteMdVariantKey =
  | "MD_120V"
  | "MD_240V"
  | "MD_KOREA_240V"
  | "MD_CHINA_240V"
  | "NMD_INTL_240V";

export type EliteMdVariant = {
  key: EliteMdVariantKey;
  label: string;

  pn: string;            // finished-good part number
  voltage: "120V" | "240V";

  mop: string;           // shown in router doc
  atp_number: string;    // ATP-130, ATP-133
  atp_doc: string;       // ATP-130 Rev W, ATP-133 Rev AA

  unitLabelPn: string;
  cartonLabelPn: string;

  // optional flags
  isChinaOrKorea?: boolean;
};

export const ELITE_MD_VARIANTS: EliteMdVariant[] = [
  {
    key: "MD_120V",
    label: "MD System Elite 120V",
    pn: "70143-03-01",
    voltage: "120V",
    mop: "MOP-70143-03",
    atp_number: "ATP-130",
    atp_doc: "ATP-130 Rev W",
    unitLabelPn: "88011-01",
    cartonLabelPn: "88032-01",
  },
  {
    key: "MD_240V",
    label: "MD System Elite 240V",
    pn: "70290-03-01",
    voltage: "240V",
    mop: "MOP-70290-03",
    atp_number: "ATP-133",
    atp_doc: "ATP-133 Rev AA",
    unitLabelPn: "88013-01",
    cartonLabelPn: "88034-01",
  },
  {
    key: "MD_KOREA_240V",
    label: "MD System Elite Korea 240V",
    pn: "70290-03-01-KOR",
    voltage: "240V",
    mop: "MOP-70290-03",
    atp_number: "ATP-133",
    atp_doc: "ATP-133 Rev AA",
    unitLabelPn: "88189 & 88187",
    cartonLabelPn: "88190 & 88187",
    isChinaOrKorea: true,
  },
  {
    key: "MD_CHINA_240V",
    label: "MD System Elite China 240V",
    pn: "70290-03-04",
    voltage: "240V",
    mop: "MOP-70290-03",
    atp_number: "ATP-143",
    atp_doc: "ATP-143 (upload when ready)",
    unitLabelPn: "88121 & 88129",
    cartonLabelPn: "88130 & 88129",
    isChinaOrKorea: true,
  },
  {
    key: "NMD_INTL_240V",
    label: "NMD System Elite International 240V",
    pn: "70290-03-01-ITL",
    voltage: "240V",
    mop: "MOP-70290-03",
    atp_number: "ATP-133",
    atp_doc: "ATP-133 Rev AA",
    unitLabelPn: "1800187",
    cartonLabelPn: "1800188",
  },
];

export function eliteMdVariantFromWoItem(itemNumber?: string | null): EliteMdVariant | null {
  const pn = String(itemNumber ?? "").trim().toUpperCase();
  if (!pn) return null;
  return ELITE_MD_VARIANTS.find((v) => v.pn.toUpperCase() === pn) ?? null;
}