// src/traveler/GenericStep.tsx
import { useMemo, useState } from "react";
import { upsertTravelerStep } from "../api/traveler";
import type { StepFormDef, FieldDef } from "./types";

function nowUtcIso() {
  return new Date().toISOString();
}

function isFilled(val: any, type: string) {
  if (type === "checkbox") return val === true;
  if (val === null || val === undefined) return false;
  if (typeof val === "string") return val.trim().length > 0;
  return true;
}

export default function GenericStep(props: {
  buildId: string;
  techId: string;
  station: string;
  form: StepFormDef;
  initialValues?: any;
  onSaved: () => void;
}) {
  const init = props.initialValues || {};
  const [values, setValues] = useState<Record<string, any>>({ ...init });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const requiredMissing = useMemo(() => {
    const missing: string[] = [];
    for (const f of props.form.fields) {
      if (!f.required) continue;
      const v = values[f.key];
      if (!isFilled(v, f.type)) missing.push(f.label);
    }
    return missing;
  }, [values, props.form.fields]);

  const canComplete = requiredMissing.length === 0;

  function setField(f: FieldDef, v: any) {
    setValues((prev) => ({ ...prev, [f.key]: v }));
  }

  async function complete(status: "COMPLETE" | "FAIL" | "N_A") {
    setErr(null);
    setSaving(true);
    try {
      await upsertTravelerStep({
        build_id: props.buildId,
        step_code: props.form.stepCode,
        status,
        values_json: values,
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

      {requiredMissing.length > 0 && (
        <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          <b>Required:</b> {requiredMissing.join(", ")}
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {props.form.fields.map((f: FieldDef) => {
          const v = values[f.key];

          if (f.type === "checkbox") {
            return (
              <label key={f.key} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={v === true}
                  onChange={(e) => setField(f, e.target.checked)}
                />
                <b>{f.label}</b>
              </label>
            );
          }

          if (f.type === "select") {
            return (
              <div key={f.key}>
                <div style={{ fontSize: 12, color: "#444", fontWeight: 800, marginBottom: 6 }}>{f.label}{f.required ? " *" : ""}</div>
                <select
                  style={inputStyle}
                  value={v ?? ""}
                  onChange={(e) => setField(f, e.target.value)}
                >
                  <option value="">(Select)</option>
                  {(f.options || []).map((o: { value: string; label: string }) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (f.type === "date") {
            return (
              <div key={f.key}>
                <div style={{ fontSize: 12, color: "#444", fontWeight: 800, marginBottom: 6 }}>{f.label}{f.required ? " *" : ""}</div>
                <input
                  type="date"
                  style={inputStyle}
                  value={v ?? ""}
                  onChange={(e) => setField(f, e.target.value)}
                />
              </div>
            );
          }

          if (f.type === "number") {
            return (
              <div key={f.key}>
                <div style={{ fontSize: 12, color: "#444", fontWeight: 800, marginBottom: 6 }}>{f.label}{f.required ? " *" : ""}</div>
                <input
                  type="number"
                  style={inputStyle}
                  value={v ?? ""}
                  onChange={(e) => setField(f, e.target.value)}
                />
              </div>
            );
          }

          if (f.type === "textarea") {
            return (
              <div key={f.key}>
                <div style={{ fontSize: 12, color: "#444", fontWeight: 800, marginBottom: 6 }}>{f.label}{f.required ? " *" : ""}</div>
                <textarea
                  style={{ ...inputStyle, minHeight: 90 }}
                  value={v ?? ""}
                  onChange={(e) => setField(f, e.target.value)}
                />
              </div>
            );
          }

          // default text
          return (
            <div key={f.key}>
              <div style={{ fontSize: 12, color: "#444", fontWeight: 800, marginBottom: 6 }}>{f.label}{f.required ? " *" : ""}</div>
              <input
                type="text"
                style={inputStyle}
                value={v ?? ""}
                onChange={(e) => setField(f, e.target.value)}
              />
            </div>
          );
        })}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
          <button
            onClick={() => complete("COMPLETE")}
            disabled={!canComplete || saving}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #111",
              background: canComplete ? "#111" : "#eee",
              color: canComplete ? "white" : "#666",
              fontWeight: 900,
              cursor: canComplete ? "pointer" : "not-allowed",
            }}
          >
            {saving ? "Saving…" : "Complete Step"}
          </button>

          {props.form.allowFail && (
            <button
              onClick={() => complete("FAIL")}
              disabled={saving}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "white",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Mark FAIL
            </button>
          )}

          {props.form.allowNA && (
            <button
              onClick={() => complete("N_A")}
              disabled={saving}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "white",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Mark N/A
            </button>
          )}
        </div>
      </div>
    </div>
  );
}