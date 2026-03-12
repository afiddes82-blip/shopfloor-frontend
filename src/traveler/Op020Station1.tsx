import { useMemo, useState } from "react";
import { upsertTravelerStep } from "../api/traveler";

function nowUtcIso() {
  return new Date().toISOString();
}

export default function Op020Station1(props: {
  buildId: string;
  techId: string;
  station: string;
  stepCode: string; // "SYNDEO120_OP020_STATION1"
  initialValues?: any;
  onSaved: () => void;
}) {
  const v = props.initialValues || {};

  const [method1Complete, setMethod1Complete] = useState<boolean>(!!v.method1_complete);
  const [pumpAssemblySn, setPumpAssemblySn] = useState<string>(v.pump_assembly_sn || "");
  const [powerEntryLot, setPowerEntryLot] = useState<string>(v.power_entry_assembly_lot || "");
  const [lightPanelSn, setLightPanelSn] = useState<string>(v.light_panel_sn || "");
  const [lightPanelLot, setLightPanelLot] = useState<string>(v.light_panel_lot || "");

  const [method2Complete, setMethod2Complete] = useState<boolean>(!!v.method2_complete);

  const [torqueCalId, setTorqueCalId] = useState<string>(v.torque_wrench_cal_id || "");
  const [torqueDueDate, setTorqueDueDate] = useState<string>(v.torque_wrench_due_date || "");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canComplete = useMemo(() => {
    if (!method1Complete) return false;
    if (!pumpAssemblySn.trim()) return false;
    if (!powerEntryLot.trim()) return false;
    if (!lightPanelSn.trim()) return false;
    if (!lightPanelLot.trim()) return false;

    if (!method2Complete) return false;

    if (!torqueCalId.trim()) return false;
    if (!torqueDueDate.trim()) return false;

    return true;
  }, [method1Complete, pumpAssemblySn, powerEntryLot, lightPanelSn, lightPanelLot, method2Complete, torqueCalId, torqueDueDate]);

  async function saveComplete() {
    setErr(null);
    setSaving(true);
    try {
      await upsertTravelerStep({
        build_id: props.buildId,
        step_code: props.stepCode,
        status: "COMPLETE",
        values_json: {
          method1_complete: method1Complete,
          pump_assembly_sn: pumpAssemblySn.trim(),
          power_entry_assembly_lot: powerEntryLot.trim(),
          light_panel_sn: lightPanelSn.trim(),
          light_panel_lot: lightPanelLot.trim(),
          method2_complete: method2Complete,
          torque_wrench_cal_id: torqueCalId.trim(),
          torque_wrench_due_date: torqueDueDate,
        },
        tech_id: props.techId,
        station: props.station,
        timestamp_utc: nowUtcIso(),
      });

      props.onSaved();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid #ddd",
    fontSize: 14,
    outline: "none",
  };

  return (
    <div style={{ marginTop: 12 }}>
      {err && (
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid #f5c2c7", background: "#f8d7da", marginBottom: 10 }}>
          <b>Error:</b> {err}
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={method1Complete} onChange={(e) => setMethod1Complete(e.target.checked)} />
          <b>Method 1 complete</b>
        </label>

        <input style={inputStyle} placeholder="Pump Assembly SN *" value={pumpAssemblySn} onChange={(e) => setPumpAssemblySn(e.target.value)} />
        <input style={inputStyle} placeholder="Power Entry Assembly Lot *" value={powerEntryLot} onChange={(e) => setPowerEntryLot(e.target.value)} />
        <input style={inputStyle} placeholder="Light Panel SN *" value={lightPanelSn} onChange={(e) => setLightPanelSn(e.target.value)} />
        <input style={inputStyle} placeholder="Light Panel Lot *" value={lightPanelLot} onChange={(e) => setLightPanelLot(e.target.value)} />

        <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
          <input type="checkbox" checked={method2Complete} onChange={(e) => setMethod2Complete(e.target.checked)} />
          <b>Method 2 complete</b>
        </label>

        <input style={inputStyle} placeholder="Torque Wrench Cal ID *" value={torqueCalId} onChange={(e) => setTorqueCalId(e.target.value)} />
        <input style={inputStyle} type="date" placeholder="Torque Wrench Due Date *" value={torqueDueDate} onChange={(e) => setTorqueDueDate(e.target.value)} />

        <button
          onClick={saveComplete}
          disabled={!canComplete || saving}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #111",
            background: canComplete ? "#111" : "#eee",
            color: canComplete ? "white" : "#666",
            fontWeight: 900,
            cursor: canComplete ? "pointer" : "not-allowed",
            marginTop: 8,
          }}
        >
          {saving ? "Saving…" : "Complete OP020"}
        </button>
      </div>
    </div>
  );
}