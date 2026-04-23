import React, { useState, useEffect, useCallback } from "react";
import { X, Merge, SplitSquareHorizontal, ArrowRight, ArrowDown, Trash2, Plus, Minus } from "lucide-react";

// Color Palette for Spreadsheet
const COLORS = [
  "transparent", "#f8fafc", "#fef2f2", "#f0fdf4", "#fefce8", "#eff6ff", "#f5f3ff", "#fff1f2",
  "#fed7aa", "#bbf7d0", "#bfdbfe", "#fca5a5"
];

const COURSE_SUGGESTIONS = [
  "ICE 1101", "ICE 1102", "ICE 1201", "ICE 1211", "ICE 1252",
  "ICE 2101", "ICE 2201", "ICE 2211", "ICE 2231", "ICE 2252", "ICE 2311",
  "ICE 3101", "ICE 3102", "ICE 3111", "ICE 3121", "ICE 3131", "ICE 3141",
  "ICE 3142", "ICE 3151", "ICE 3152", "ICE 3201", "ICE 3211", "ICE 3342",
  "ICE 4101", "ICE 4102", "ICE 4111", "ICE 4112", "ICE 4121", "ICE 4131",
  "ICE 4132", "ICE 4141", "ICE 4142", "ICE 4201", "ICE 4211", "ICE 4221",
  "ICE 4222", "ICE 4241", "ICE 4242",
  "ICE M001", "ICE M003", "ICE M301", "ICE M901", "ICE M1012",
  "CSE 1101", "CSE 1202", "CSE 2101", "CSE 3101", "CSE 3152",
  "MATH 1101", "MATH 1211", "MATH 2211", "MATH 2221",
  "STAT 1211", "PHY 1101", "PHY 1221",
  "ECON 1211", "LAW 2311",
  "EEE 1101", "EEE 2101", "MGT 2101", "ENG 1101",
];

const EditableText = ({ value, onChange, placeholder, style, readOnly }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  const handleBlur = () => {
    setEditing(false);
    if (val !== value) onChange(val);
  };

  if (editing && !readOnly) {
    return (
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => { if (e.key === 'Enter') handleBlur(); }}
        style={{
          width: "100%", padding: "2px 4px", fontSize: "inherit",
          textAlign: "center", border: "1px solid #3b82f6", borderRadius: "4px",
          color: "#1e293b", background: "#fff", outline: "none", boxSizing: "border-box"
        }}
      />
    );
  }

  return (
    <div onClick={() => { if (!readOnly) setEditing(true); }} style={{ cursor: readOnly ? "default" : "pointer", minHeight: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", ...style }} title={readOnly ? "" : "Click to edit"}>
      {value || <span style={{ color: "rgba(0,0,0,0.3)", fontStyle: "italic" }}>{placeholder}</span>}
    </div>
  );
};

const UnifiedGrid = {
  getCell: (gridState, r, c) => {
    if (r === 0) {
      if (c === 0) return { value: "Day", readOnly: true };
      if (c === 1) return { value: "Year", readOnly: true };
      if (c === 2) return { value: "Semester", readOnly: true };
      let col = gridState.columns[c - 3];
      return typeof col === 'object' ? col : { value: col, rowSpan: 1, colSpan: 1, hidden: false, bgColor: 'transparent', fontSize: 0.78 };
    } else {
      const idx = r - 1;
      if (!gridState.rows[idx]) return null;
      if (c === 0) return typeof gridState.rows[idx].day === 'object' ? gridState.rows[idx].day : { value: gridState.rows[idx].day, rowSpan: 1, colSpan: 1, hidden: false, bgColor: 'transparent', fontSize: 0.78 };
      if (c === 1) return typeof gridState.rows[idx].year === 'object' ? gridState.rows[idx].year : { value: gridState.rows[idx].year, rowSpan: 1, colSpan: 1, hidden: false, bgColor: 'transparent', fontSize: 0.78 };
      if (c === 2) return typeof gridState.rows[idx].sem === 'object' ? gridState.rows[idx].sem : { value: gridState.rows[idx].sem, rowSpan: 1, colSpan: 1, hidden: false, bgColor: 'transparent', fontSize: 0.78 };
      if (!gridState.cells[idx] || !gridState.cells[idx][c - 3]) return null;
      return gridState.cells[idx][c - 3];
    }
  },
  setCell: (draft, r, c, newCell) => {
    if (r === 0) {
      if (c >= 3) draft.columns[c - 3] = newCell;
    } else {
      const idx = r - 1;
      if (!draft.rows[idx]) return;
      if (c === 0) draft.rows[idx].day = newCell;
      else if (c === 1) draft.rows[idx].year = newCell;
      else if (c === 2) draft.rows[idx].sem = newCell;
      else {
        if (!draft.cells[idx]) draft.cells[idx] = [];
        draft.cells[idx][c - 3] = newCell;
      }
    }
  }
};

const RoutineGrid = ({ gridState, setGridState, allTeachers = [] }) => {
  const [selection, setSelection] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [cellEditor, setCellEditor] = useState(null);

  const getExpandedBounds = useCallback((startR, startC, endR, endC) => {
    let minR = Math.min(startR, endR);
    let maxR = Math.max(startR, endR);
    let minC = Math.min(startC, endC);
    let maxC = Math.max(startC, endC);

    let expanded = true;
    while (expanded) {
      expanded = false;
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const cell = UnifiedGrid.getCell(gridState, r, c);
          if (!cell) continue;

          let tR = r, tC = c, tRowSpan = cell.rowSpan || 1, tColSpan = cell.colSpan || 1;
          if (cell.hidden && cell.mergeParent) {
            tR = cell.mergeParent.r;
            tC = cell.mergeParent.c;
            const parent = UnifiedGrid.getCell(gridState, tR, tC);
            tRowSpan = parent?.rowSpan || 1;
            tColSpan = parent?.colSpan || 1;
          }

          if (tR < minR) { minR = tR; expanded = true; }
          if (tR + tRowSpan - 1 > maxR) { maxR = tR + tRowSpan - 1; expanded = true; }
          if (tC < minC) { minC = tC; expanded = true; }
          if (tC + tColSpan - 1 > maxC) { maxC = tC + tColSpan - 1; expanded = true; }
        }
      }
    }
    return { minR, maxR, minC, maxC };
  }, [gridState]);

  const bounds = selection ? getExpandedBounds(selection.start.r, selection.start.c, selection.end.r, selection.end.c) : null;
  const isSelected = (r, c) => bounds && r >= bounds.minR && r <= bounds.maxR && c >= bounds.minC && c <= bounds.maxC;

  const handleMouseDown = (r, c, e) => {
    if (e.button !== 0) return;
    const isShift = e.shiftKey || multiSelectMode;
    if (isShift && selection) setSelection(prev => ({ ...prev, end: { r, c } }));
    else setSelection({ start: { r, c }, end: { r, c } });
    setIsDragging(true);
  };

  const handleMouseEnter = (r, c) => {
    if (isDragging && selection) setSelection(prev => ({ ...prev, end: { r, c } }));
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const getDraftState = () => ({
    columns: [...gridState.columns],
    rows: gridState.rows.map(r => ({ ...r })),
    cells: gridState.cells.map(r => [...r])
  });

  const unmergeCellsInRange = (draft, minR, maxR, minC, maxC) => {
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const cell = UnifiedGrid.getCell(draft, r, c);
        if (!cell || cell.readOnly) continue;
        if (!cell.hidden && (cell.rowSpan > 1 || cell.colSpan > 1)) {
          const sR = cell.rowSpan;
          const sC = cell.colSpan;
          UnifiedGrid.setCell(draft, r, c, { ...cell, rowSpan: 1, colSpan: 1 });
          for (let ir = r; ir < r + sR; ir++) {
            for (let ic = c; ic < c + sC; ic++) {
              if (ir === r && ic === c) continue;
              const subCell = UnifiedGrid.getCell(draft, ir, ic);
              if (subCell) UnifiedGrid.setCell(draft, ir, ic, { ...subCell, hidden: false, mergeParent: null });
            }
          }
        }
      }
    }
  };

  const handleMerge = () => {
    if (!bounds || (bounds.minR === bounds.maxR && bounds.minC === bounds.maxC)) return;
    const { minR, maxR, minC, maxC } = bounds;
    if (minC < 3 && maxC >= 3) return alert("Cannot merge Row Headers with Data Cells.");
    if (minR === 0 && maxR > 0) return alert("Cannot merge Column Headers with Data Cells.");
    if (minR === 0 && minC < 3) return alert("Cannot merge corner cells.");

    const draft = getDraftState();
    unmergeCellsInRange(draft, minR, maxR, minC, maxC);
    const parent = UnifiedGrid.getCell(draft, minR, minC);
    UnifiedGrid.setCell(draft, minR, minC, { ...parent, rowSpan: maxR - minR + 1, colSpan: maxC - minC + 1 });

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (r === minR && c === minC) continue;
        const cell = UnifiedGrid.getCell(draft, r, c);
        if (cell && !cell.readOnly) {
          UnifiedGrid.setCell(draft, r, c, { ...cell, hidden: true, mergeParent: { r: minR, c: minC } });
        }
      }
    }
    setGridState(draft);
    setSelection({ start: { r: minR, c: minC }, end: { r: minR, c: minC } });
  };

  const handleUnmerge = () => {
    if (!bounds) return;
    const draft = getDraftState();
    unmergeCellsInRange(draft, bounds.minR, bounds.maxR, bounds.minC, bounds.maxC);
    setGridState(draft);
  };

  const applyColor = (color) => {
    if (!bounds) return;
    const draft = getDraftState();
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const cell = UnifiedGrid.getCell(draft, r, c);
        if (cell && !cell.readOnly) {
          UnifiedGrid.setCell(draft, r, c, { ...cell, bgColor: color });
        }
      }
    }
    setGridState(draft);
  };

  const changeFontSize = (delta) => {
    if (!bounds) return;
    const draft = getDraftState();
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const cell = UnifiedGrid.getCell(draft, r, c);
        if (cell && !cell.readOnly && !cell.hidden) {
          const currentSize = cell.fontSize || 0.78;
          const newSize = Math.max(0.4, currentSize + delta);
          UnifiedGrid.setCell(draft, r, c, { ...cell, fontSize: newSize });
        }
      }
    }
    setGridState(draft);
  };

  const addRow = () => {
    const rIdx = bounds && bounds.maxR > 0 ? bounds.maxR : gridState.rows.length;
    const prevRow = rIdx > 0 ? gridState.rows[rIdx - 1] : { day: "SUN", year: "1st", sem: "1st Sem" };
    const dayVal = typeof prevRow.day === 'object' ? prevRow.day.value : prevRow.day;
    const yearVal = typeof prevRow.year === 'object' ? prevRow.year.value : prevRow.year;
    const semVal = typeof prevRow.sem === 'object' ? prevRow.sem.value : prevRow.sem;

    const newRowHeader = { id: crypto.randomUUID(), day: dayVal, year: yearVal, sem: semVal };
    const newRowCells = gridState.columns.map(() => ({ course: "", teacher: "", room: "", status: "NORMAL", reason: "", textLabel: "", rowSpan: 1, colSpan: 1, hidden: false, bgColor: 'transparent', fontSize: 0.78 }));

    const draft = getDraftState();
    draft.rows.splice(rIdx, 0, newRowHeader);
    draft.cells.splice(rIdx, 0, newRowCells);

    for (let r = 0; r <= rIdx; r++) {
      for (let c = 0; c < gridState.columns.length + 3; c++) {
        const cell = UnifiedGrid.getCell(draft, r, c);
        if (cell && !cell.hidden && cell.rowSpan > rIdx - r + 1) {
          UnifiedGrid.setCell(draft, r, c, { ...cell, rowSpan: cell.rowSpan + 1 });
          UnifiedGrid.setCell(draft, rIdx + 1, c, { hidden: true, mergeParent: { r, c } });
        }
      }
    }
    setGridState(draft);
  };

  const deleteRow = () => {
    if (!bounds || bounds.minR === 0) return;
    const draft = getDraftState();
    unmergeCellsInRange(draft, 0, draft.rows.length, 0, draft.columns.length + 2);
    draft.rows.splice(bounds.minR - 1, bounds.maxR - bounds.minR + 1);
    draft.cells.splice(bounds.minR - 1, bounds.maxR - bounds.minR + 1);
    setGridState(draft);
    setSelection(null);
  };

  const addColumn = () => {
    const cIdx = bounds && bounds.maxC > 2 ? bounds.maxC - 2 : gridState.columns.length;
    const draft = getDraftState();
    draft.columns.splice(cIdx, 0, "New Slot");
    draft.cells.forEach(row => {
      row.splice(cIdx, 0, { course: "", teacher: "", room: "", status: "NORMAL", reason: "", textLabel: "", rowSpan: 1, colSpan: 1, hidden: false, bgColor: 'transparent', fontSize: 0.78 });
    });
    for (let r = 1; r <= draft.rows.length; r++) {
      for (let c = 3; c < cIdx + 3; c++) {
        const cell = UnifiedGrid.getCell(draft, r, c);
        if (cell && !cell.hidden && cell.colSpan > cIdx + 3 - c) {
          UnifiedGrid.setCell(draft, r, c, { ...cell, colSpan: cell.colSpan + 1 });
          UnifiedGrid.setCell(draft, r, cIdx + 3, { hidden: true, mergeParent: { r, c } });
        }
      }
    }
    setGridState(draft);
  };

  const deleteColumn = () => {
    if (!bounds || bounds.minC < 3) return;
    const draft = getDraftState();
    unmergeCellsInRange(draft, 0, draft.rows.length, 0, draft.columns.length + 2);
    const deleteCount = bounds.maxC - bounds.minC + 1;
    draft.columns.splice(bounds.minC - 3, deleteCount);
    draft.cells.forEach(row => row.splice(bounds.minC - 3, deleteCount));
    setGridState(draft);
    setSelection(null);
  };

  const clearSelectedCells = () => {
    if (!bounds) return;
    const draft = getDraftState();
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const cell = UnifiedGrid.getCell(draft, r, c);
        if (cell && !cell.hidden && !cell.readOnly) {
          UnifiedGrid.setCell(draft, r, c, { ...cell, course: "", teacher: "", room: "", textLabel: "", status: "NORMAL", bgColor: 'transparent' });
        }
      }
    }
    setGridState(draft);
  }

  const saveCell = (updatedCell) => {
    const draft = getDraftState();
    const old = UnifiedGrid.getCell(draft, cellEditor.r, cellEditor.c);
    UnifiedGrid.setCell(draft, cellEditor.r, cellEditor.c, { ...old, ...updatedCell });
    setGridState(draft);
    setCellEditor(null);
  };

  const renderCellEditor = () => {
    if (!cellEditor) return null;
    const { cell } = cellEditor;
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ background: "white", padding: "1.25rem 1.5rem", borderRadius: "14px", width: "100%", maxWidth: "380px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontWeight: "700" }}>Edit Cell</h3>
            <button onClick={() => setCellEditor(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", background: cell.status === "CANCELLED" ? "#fee2e2" : "#f8fafc", padding: "0.5rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <input type="checkbox" checked={cell.status === "CANCELLED"} onChange={(e) => setCellEditor({ ...cellEditor, cell: { ...cell, status: e.target.checked ? "CANCELLED" : "NORMAL" } })} />
            <span style={{ fontWeight: "600", color: cell.status === "CANCELLED" ? "#dc2626" : "#475569" }}>Mark as Cancelled</span>
          </label>
          {cell.status === "CANCELLED" ? (
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b" }}>Reason</label>
              <input value={cell.reason || ''} onChange={e => setCellEditor({ ...cellEditor, cell: { ...cell, reason: e.target.value } })} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b" }}>Course / Title</label>
                <input list="course-suggestions" value={cell.course || ''} onChange={e => setCellEditor({ ...cellEditor, cell: { ...cell, course: e.target.value } })} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                <datalist id="course-suggestions">{COURSE_SUGGESTIONS.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b" }}>Teacher Initials</label>
                <input list="teacher-suggestions" value={cell.teacher || ''} onChange={e => setCellEditor({ ...cellEditor, cell: { ...cell, teacher: e.target.value } })} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                <datalist id="teacher-suggestions">{allTeachers.map(t => <option key={t._id} value={t.full_name.split(" ").map(w => w[0]?.toUpperCase()).join("")} label={t.full_name} />)}</datalist>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b" }}>Room Number</label>
                <input value={cell.room || ''} onChange={e => setCellEditor({ ...cellEditor, cell: { ...cell, room: e.target.value } })} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </div>
            </>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button onClick={() => setCellEditor(null)} style={{ padding: "8px 16px", borderRadius: "6px", background: "#f1f5f9", border: "1px solid #e2e8f0" }}>Cancel</button>
            <button onClick={() => saveCell(cell)} style={{ padding: "8px 16px", borderRadius: "6px", background: "#3b82f6", color: "white", border: "none", fontWeight: "600" }}>Save Cell</button>
          </div>
        </div>
      </div>
    );
  };

  const isMultiSelected = bounds && (bounds.minR !== bounds.maxR || bounds.minC !== bounds.maxC);
  const canMerge = isMultiSelected;
  const canUnmerge = bounds && (() => {
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const cl = UnifiedGrid.getCell(gridState, r, c);
        if (cl && !cl.hidden && (cl.rowSpan > 1 || cl.colSpan > 1)) return true;
      }
    }
    return false;
  })();

  const tbBtnStyle = { display: "flex", alignItems: "center", gap: "0.3rem", background: "#fff", border: "1px solid #cbd5e1", padding: "0.35rem 0.6rem", borderRadius: "6px", fontSize: "0.78rem", cursor: "pointer", color: "#334155" };
  const thStyle = { padding: "0.4rem", borderRight: "1px solid rgba(255,255,255,0.15)", whiteSpace: "nowrap" };

  return (
    <div style={{ userSelect: isDragging ? "none" : "auto" }}>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem", background: "#f8fafc", padding: "0.75rem", borderRadius: "10px", border: "1px solid #e2e8f0", alignItems: "center" }}>
        <div style={{ fontWeight: "600", color: "#475569", marginRight: "0.5rem", fontSize: "0.85rem" }}>Grid Tools:</div>
        <button onClick={handleMerge} disabled={!canMerge} style={{ ...tbBtnStyle, opacity: canMerge ? 1 : 0.5 }}><Merge size={14} /> Merge</button>
        <button onClick={handleUnmerge} disabled={!canUnmerge} style={{ ...tbBtnStyle, opacity: canUnmerge ? 1 : 0.5 }}><SplitSquareHorizontal size={14} /> Unmerge</button>

        <div style={{ width: "1px", height: "20px", background: "#cbd5e1", margin: "0 0.25rem" }} />

        {/* FONT SIZE TOOLS */}
        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600", marginRight: "0.25rem" }}>Text:</span>
          <button onClick={() => changeFontSize(0.05)} disabled={!bounds} style={{ ...tbBtnStyle, padding: "0.35rem 0.5rem", opacity: bounds ? 1 : 0.5 }} title="Increase Font Size"><Plus size={12} />A</button>
          <button onClick={() => changeFontSize(-0.05)} disabled={!bounds} style={{ ...tbBtnStyle, padding: "0.35rem 0.5rem", opacity: bounds ? 1 : 0.5 }} title="Decrease Font Size"><Minus size={12} />A</button>
        </div>

        <div style={{ width: "1px", height: "20px", background: "#cbd5e1", margin: "0 0.25rem" }} />

        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600", marginRight: "0.25rem" }}>Fill:</span>
          {COLORS.map(color => (
            <button key={color} onClick={() => applyColor(color)} style={{ width: "20px", height: "20px", borderRadius: "4px", background: color, border: color === 'transparent' ? '1px dashed #cbd5e1' : '1px solid rgba(0,0,0,0.1)', cursor: bounds ? "pointer" : "not-allowed", opacity: bounds ? 1 : 0.5 }} title={`Color: ${color}`} />
          ))}
        </div>

        <div style={{ width: "1px", height: "20px", background: "#cbd5e1", margin: "0 0.25rem" }} />

        <button onClick={addRow} style={tbBtnStyle}><ArrowDown size={14} /> Add Row</button>
        <button onClick={deleteRow} disabled={!bounds || bounds.minR === 0} style={{ ...tbBtnStyle, color: bounds && bounds.minR > 0 ? "#ef4444" : "inherit", opacity: bounds && bounds.minR > 0 ? 1 : 0.5 }}><Trash2 size={14} /> Del Row</button>
        <button onClick={addColumn} style={tbBtnStyle}><ArrowRight size={14} /> Add Col</button>
        <button onClick={deleteColumn} disabled={!bounds || bounds.minC < 3} style={{ ...tbBtnStyle, color: bounds && bounds.minC >= 3 ? "#ef4444" : "inherit", opacity: bounds && bounds.minC >= 3 ? 1 : 0.5 }}><Trash2 size={14} /> Del Col</button>

        <div style={{ width: "1px", height: "20px", background: "#cbd5e1", margin: "0 0.25rem" }} />
        <button onClick={clearSelectedCells} disabled={!bounds} style={{ ...tbBtnStyle, opacity: bounds ? 1 : 0.5 }}><X size={14} /> Clear Content</button>

        <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", cursor: "pointer", background: multiSelectMode ? "#dbeafe" : "#fff", padding: "0.3rem 0.6rem", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
          <input type="checkbox" checked={multiSelectMode} onChange={e => setMultiSelectMode(e.target.checked)} /> Hold Selection
        </label>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #cbd5e1", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", background: "white" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", minWidth: "900px" }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
              {Array.from({ length: gridState.columns.length + 3 }).map((_, c) => {
                const cell = UnifiedGrid.getCell(gridState, 0, c);
                if (!cell || cell.hidden) return null;
                const selected = isSelected(0, c);
                return (
                  <th key={`th-${c}`} rowSpan={cell.rowSpan || 1} colSpan={cell.colSpan || 1}
                    onMouseDown={(e) => handleMouseDown(0, c, e)}
                    onMouseEnter={() => handleMouseEnter(0, c)}
                    style={{
                      ...thStyle, width: c < 3 ? "60px" : "120px", color: "white",
                      background: selected ? "rgba(59, 130, 246, 0.4)" : cell.bgColor !== "transparent" && cell.bgColor ? cell.bgColor : "transparent",
                      boxShadow: selected ? "inset 0 0 0 2px #60a5fa" : "none",
                      cursor: "cell", verticalAlign: "middle", textAlign: "center"
                    }}>
                    <EditableText value={cell.value}
                      onChange={val => {
                        const draft = getDraftState();
                        const { bgColor, fontSize, ...rest } = cell; // strip UI-only properties
                        UnifiedGrid.setCell(draft, r, c, { ...rest, value: val });
                        setGridState(draft);
                      }}

                      readOnly={cell.readOnly} style={{ fontWeight: "700", fontSize: `${cell.fontSize || 0.78}rem` }} />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {gridState.rows.map((row, idx) => {
              const r = idx + 1;
              return (
                <tr key={`r-${idx}`} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  {Array.from({ length: gridState.columns.length + 3 }).map((_, c) => {
                    const cell = UnifiedGrid.getCell(gridState, r, c);
                    if (!cell || cell.hidden) return null;
                    const selected = isSelected(r, c);

                    if (c < 3) {
                      return (
                        <td key={`rh-${r}-${c}`} rowSpan={cell.rowSpan || 1} colSpan={cell.colSpan || 1}
                          onMouseDown={(e) => handleMouseDown(r, c, e)}
                          onMouseEnter={() => handleMouseEnter(r, c)}
                          style={{
                            padding: "0.4rem", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #e2e8f0", textAlign: "center", cursor: "cell",
                            background: selected ? "#e0f2fe" : cell.bgColor && cell.bgColor !== "transparent" ? cell.bgColor : "#f8fafc",
                            color: c === 0 ? "#1e40af" : "#475569", fontWeight: c === 0 ? "700" : "600",
                            boxShadow: selected ? "inset 0 0 0 2px #3b82f6" : "none"
                          }}>
                          <EditableText value={cell.value} onChange={val => { const draft = getDraftState(); UnifiedGrid.setCell(draft, r, c, { ...cell, value: val }); setGridState(draft); }} style={{ fontSize: `${cell.fontSize || 0.78}rem` }} />
                        </td>
                      );
                    }

                    return (
                      <td key={`td-${r}-${c}`} rowSpan={cell.rowSpan || 1} colSpan={cell.colSpan || 1}
                        onMouseDown={(e) => handleMouseDown(r, c, e)}
                        onMouseEnter={() => handleMouseEnter(r, c)}
                        onDoubleClick={() => setCellEditor({ r, c, cell })}
                        style={{
                          padding: "0.4rem", border: "1px solid #cbd5e1", textAlign: "center", verticalAlign: "middle", cursor: "cell", position: "relative",
                          background: selected ? "#e0f2fe" : cell.bgColor && cell.bgColor !== "transparent" ? cell.bgColor : (cell.status === "CANCELLED" ? "#fef2f2" : cell.course ? "#f0fdf4" : "white"),
                          boxShadow: selected ? "inset 0 0 0 2px #3b82f6" : "none",
                          minWidth: "100px", transition: "background 0.1s"
                        }}
                      >
                        {cell.status === "CANCELLED" ? (
                          <div style={{ fontSize: `${cell.fontSize || 0.78}rem` }}>
                            <div style={{ color: "#ef4444", fontWeight: 700, fontSize: "0.9em" }}>CANCELLED</div>
                            {cell.reason && <div style={{ fontSize: "0.8em", color: "#b91c1c", marginTop: "0.1rem" }}>{cell.reason}</div>}
                          </div>
                        ) : cell.course ? (
                          <div style={{ lineHeight: 1.3, whiteSpace: "pre-wrap", fontSize: `${cell.fontSize || 0.78}rem` }}>
                            <div style={{ fontWeight: 700, color: cell.course.includes("BREAK") ? "#dc2626" : "#0c4a6e", letterSpacing: cell.course.length <= 5 ? "0.1em" : "normal" }}>
                              {cell.course}
                            </div>
                            {cell.teacher && <div style={{ color: "#16a34a", fontSize: "0.9em", marginTop: "2px" }}>[{cell.teacher}]</div>}
                            {cell.room && <div style={{ color: "#64748b", fontSize: "0.85em" }}>({cell.room})</div>}
                          </div>
                        ) : (
                          <div style={{ color: selected ? "#93c5fd" : "transparent" }}>+</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {renderCellEditor()}
    </div>
  );
};

export default RoutineGrid;