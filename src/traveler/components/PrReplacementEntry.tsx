import React from "react";

export type BomOption = {
  componentItem: string;
  description?: string;
};

export type ReplacementRow = {
  componentItem: string;
  quantity: number | "";
};

type Props = {
  bomOptions: BomOption[];
  replacedCount: number;
  setReplacedCount: React.Dispatch<React.SetStateAction<number>>;
  rows: ReplacementRow[];
  setRows: React.Dispatch<React.SetStateAction<ReplacementRow[]>>;
};

export default function PrReplacementEntry({
  bomOptions,
  replacedCount,
  setReplacedCount,
  rows,
  setRows,
}: Props) {
  const resizeRows = (count: number) => {
    const safeCount = Math.max(0, count);

    setReplacedCount(safeCount);

    setRows((prev) => {
      const next = [...prev];

      if (safeCount > next.length) {
        while (next.length < safeCount) {
          next.push({
            componentItem: "",
            quantity: "",
          });
        }
      } else if (safeCount < next.length) {
        next.length = safeCount;
      }

      return next;
    });
  };

  const updateRow = (idx: number, patch: Partial<ReplacementRow>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row))
    );
  };

  return (
    <div className="space-y-4 rounded-xl border p-4 bg-white">
      <div>
        <label className="mb-1 block text-sm font-medium">
          How many different items were replaced?
        </label>
        <input
          type="number"
          min={0}
          step={1}
          value={replacedCount}
          onChange={(e) => resizeRows(Number(e.target.value || 0))}
          className="w-32 rounded border px-3 py-2"
        />
      </div>

      {rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 gap-3 rounded-lg border p-3 md:grid-cols-[1fr_140px]"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Item {idx + 1}
                </label>
                <select
                  value={row.componentItem}
                  onChange={(e) =>
                    updateRow(idx, { componentItem: e.target.value })
                  }
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="">Select component</option>
                  {bomOptions.map((opt) => (
                    <option key={opt.componentItem} value={opt.componentItem}>
                      {opt.componentItem}
                      {opt.description ? ` — ${opt.description}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={row.quantity}
                  onChange={(e) =>
                    updateRow(idx, {
                      quantity: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}