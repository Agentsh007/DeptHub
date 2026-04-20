import React, { useState, useEffect, useCallback } from "react";
import {
  UploadCloud,
  FileText,
  Trash2,
  Folder,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  Archive,
  Code,
  Video,
  Music,
  Edit2,
  Save,
  X,
  Check,
  Paperclip,
  Merge,
  SplitSquareHorizontal,
  ArrowRight,
  ArrowDown
} from "lucide-react";

// ============================================================================
// STANDALONE MOCKS (Replacing missing local imports for standalone preview)
// ============================================================================
const useLocation = () => ({ search: "?tab=routine" });
const useNavigate = () => () => {};

const AuthContext = React.createContext({
  user: { id: "1", name: "Dr. John Doe", email: "teacher@university.edu", role: "Teacher", department: "ICE" },
  loadUser: async () => {},
  loading: false
});

const axios = {
  get: async (url) => {
    if (url === '/batches') return { data: [{ _id: '1', batch_name: 'ICE 4th Year' }, { _id: '2', batch_name: 'CSE 1st Year' }] };
    if (url === '/auth/teachers') return { data: [{ _id: '1', full_name: 'John Doe Smith' }, { _id: '2', full_name: 'Jane Smith' }] };
    return { data: [] };
  },
  post: async () => ({ data: { success: true } }),
  put: async () => ({ data: { success: true } }),
  delete: async () => ({ data: { success: true } })
};

const s = {
  wrapper: { padding: "1.5rem", maxWidth: "1280px", margin: "0 auto", fontFamily: "system-ui, sans-serif" },
  outerCard: { background: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "1.5rem" },
  sectionTitle: { fontSize: "1.25rem", fontWeight: "700", color: "#1e293b", marginBottom: "1rem" },
  input: { width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  submitBtn: { background: "#3b82f6", color: "white", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: "600", border: "none", cursor: "pointer" },
  declineBtn: { background: "#f1f5f9", color: "#475569", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: "600", border: "1px solid #cbd5e1", cursor: "pointer" },
  publishBtn: { background: "#10b981", color: "white", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: "600", border: "none", cursor: "pointer" },
  label: { display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" },
  uploadZone: { border: "2px dashed #cbd5e1", padding: "3rem", borderRadius: "12px", textAlign: "center", cursor: "pointer", background: "#f8fafc" },
  folderCard: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem", textAlign: "center" },
  deleteBtn: { background: "none", border: "none", color: "#ef4444", cursor: "pointer" },
  profileCard: { background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" },
  profileLabel: { fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
  profileValue: { fontSize: "1rem", fontWeight: "600", color: "#0f172a", marginTop: "0.25rem" }
};

const Layout = ({ children }) => <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>{children}</div>;
const Loader = () => <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Loading dashboard...</div>;

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDanger }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
      <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", width: "100%", maxWidth: "400px" }}>
        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>{title}</h3>
        <p style={{ margin: "0 0 1.5rem 0", color: "#64748b" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button onClick={onClose} style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "none", background: isDanger ? "#ef4444" : "#3b82f6", color: "white", cursor: "pointer" }}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

const Notice = () => <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Notices Module placeholder for standalone view.</div>;
const NoticeDetail = () => null;

// ============================================================================
// DATA CONSTANTS
// ============================================================================
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

const TIME_SLOT_LABELS = ["09:05-10:00", "10:05-11:00", "11:05-12:00", "01:00-02:00", "02:05-03:00", "03:05-04:00"];
const YEAR_GROUPS = [
  { year: "1st", semesters: ["1st Sem (2024)"] },
  { year: "2nd", semesters: ["2nd Sem (2025)"] },
  { year: "3rd", semesters: ["3rd Sem (2026)"] },
  { year: "4th", semesters: ["Old (2025)", "Even (2024)"] },
  { year: "MSc", semesters: ["1st Sem"] },
];

const getFileIcon = (filename) => {
  if (!filename) return <FileText size={36} color="#64748b" />;
  const ext = filename.split(".").pop().toLowerCase();
  if (["pdf"].includes(ext)) return <FileText size={36} color="#ef4444" />;
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext)) return <ImageIcon size={36} color="#3b82f6" />;
  if (["doc", "docx"].includes(ext)) return <FileText size={36} color="#2563eb" />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <FileSpreadsheet size={36} color="#16a34a" />;
  if (["ppt", "pptx"].includes(ext)) return <Presentation size={36} color="#d97706" />;
  if (["zip", "rar", "7z", "tar"].includes(ext)) return <Archive size={36} color="#9333ea" />;
  if (["mp4", "mkv", "avi", "mov"].includes(ext)) return <Video size={36} color="#be123c" />;
  if (["mp3", "wav", "ogg"].includes(ext)) return <Music size={36} color="#db2777" />;
  if (["js", "jsx", "ts", "tsx", "html", "css", "json", "py", "java", "c", "cpp"].includes(ext)) return <Code size={36} color="#4b5563" />;
  return <FileText size={36} color="#64748b" />;
};

const StatusBadge = ({ status }) => {
  const map = {
    PENDING_FEEDBACK: { bg: "#fef3c7", color: "#b45309", label: "Peer Review" },
    PENDING_APPROVAL: { bg: "#fed7aa", color: "#c2410c", label: "Awaiting Approval" },
    APPROVED: { bg: "#dcfce7", color: "#16a34a", label: "Approved" },
    REJECTED: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
  };
  const st = map[status] || { bg: "#f1f5f9", color: "#64748b", label: status };
  return (
    <span style={{ background: st.bg, color: st.color, fontSize: "0.72rem", fontWeight: "700", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>
      {st.label}
    </span>
  );
};

// ============================================================================
// 1. ROUTINE GRID COMPONENT (Fully self-contained Matrix Grid engine)
// ============================================================================
const EditableText = ({ value, onChange, placeholder, style }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  const handleBlur = () => {
    setEditing(false);
    if (val !== value) onChange(val);
  };

  if (editing) {
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
    <div onClick={() => setEditing(true)} style={{ cursor: "pointer", minHeight: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", ...style }} title="Click to edit">
      {value || <span style={{ color: "rgba(0,0,0,0.3)", fontStyle: "italic" }}>{placeholder}</span>}
    </div>
  );
};

const RoutineGrid = ({ gridState, setGridState, allTeachers }) => {
  const [selection, setSelection] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [cellEditor, setCellEditor] = useState(null);

  const { columns, rows, cells } = gridState;

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
          if (!cells[r] || !cells[r][c]) continue;
          const cell = cells[r][c];
          
          let tR = r, tC = c, tRowSpan = cell.rowSpan, tColSpan = cell.colSpan;
          if (cell.hidden && cell.mergeParent) {
            tR = cell.mergeParent.r;
            tC = cell.mergeParent.c;
            tRowSpan = cells[tR]?.[tC]?.rowSpan || 1;
            tColSpan = cells[tR]?.[tC]?.colSpan || 1;
          }

          if (tR < minR) { minR = tR; expanded = true; }
          if (tR + tRowSpan - 1 > maxR) { maxR = tR + tRowSpan - 1; expanded = true; }
          if (tC < minC) { minC = tC; expanded = true; }
          if (tC + tColSpan - 1 > maxC) { maxC = tC + tColSpan - 1; expanded = true; }
        }
      }
    }
    return { minR, maxR, minC, maxC };
  }, [cells]);

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

  const unmergeCellsInRange = (minR, maxR, minC, maxC, newCells) => {
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const cell = newCells[r]?.[c];
        if (!cell) continue;
        if (!cell.hidden && (cell.rowSpan > 1 || cell.colSpan > 1)) {
          const sR = cell.rowSpan;
          const sC = cell.colSpan;
          newCells[r][c] = { ...cell, rowSpan: 1, colSpan: 1 };
          for (let ir = r; ir < r + sR; ir++) {
            for (let ic = c; ic < c + sC; ic++) {
              if (ir === r && ic === c) continue;
              if (newCells[ir] && newCells[ir][ic]) {
                newCells[ir][ic] = { ...newCells[ir][ic], hidden: false, mergeParent: null };
              }
            }
          }
        }
      }
    }
  };

  const handleMerge = () => {
    if (!bounds || (bounds.minR === bounds.maxR && bounds.minC === bounds.maxC)) return;
    const { minR, maxR, minC, maxC } = bounds;
    const newCells = cells.map(row => [...row]);

    unmergeCellsInRange(minR, maxR, minC, maxC, newCells);

    const parent = { ...newCells[minR][minC], rowSpan: maxR - minR + 1, colSpan: maxC - minC + 1 };
    newCells[minR][minC] = parent;

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (r === minR && c === minC) continue;
        newCells[r][c] = { ...newCells[r][c], hidden: true, mergeParent: { r: minR, c: minC } };
      }
    }
    setGridState(prev => ({ ...prev, cells: newCells }));
    setSelection({ start: { r: minR, c: minC }, end: { r: minR, c: minC } });
  };

  const handleUnmerge = () => {
    if (!bounds) return;
    const newCells = cells.map(row => [...row]);
    unmergeCellsInRange(bounds.minR, bounds.maxR, bounds.minC, bounds.maxC, newCells);
    setGridState(prev => ({ ...prev, cells: newCells }));
  };

  const addRow = () => {
    const rIdx = bounds ? bounds.maxR + 1 : rows.length;
    const prevRow = rIdx > 0 ? rows[rIdx - 1] : { day: "SUN", year: "1st", sem: "1st Sem" };
    const newRowHeader = { ...prevRow, id: crypto.randomUUID() };
    const newRowCells = columns.map(() => ({ course: "", teacher: "", room: "", status: "NORMAL", reason: "", textLabel: "", rowSpan: 1, colSpan: 1, hidden: false }));
    
    const newRows = [...rows];
    newRows.splice(rIdx, 0, newRowHeader);
    const newCells = cells.map(r => [...r]);
    newCells.splice(rIdx, 0, newRowCells);

    for(let r=0; r < rIdx; r++) {
      for(let c=0; c < columns.length; c++) {
         const cell = newCells[r][c];
         if (!cell.hidden && cell.rowSpan > rIdx - r) {
             newCells[r][c] = { ...cell, rowSpan: cell.rowSpan + 1 };
             newCells[rIdx][c] = { hidden: true, mergeParent: {r, c} };
         }
      }
    }
    setGridState({ columns, rows: newRows, cells: newCells });
  };

  const deleteRow = () => {
    if (!bounds) return;
    const newRows = [...rows];
    const newCells = cells.map(r => [...r]);
    unmergeCellsInRange(0, rows.length - 1, 0, columns.length - 1, newCells);

    newRows.splice(bounds.minR, bounds.maxR - bounds.minR + 1);
    newCells.splice(bounds.minR, bounds.maxR - bounds.minR + 1);
    setGridState({ columns, rows: newRows, cells: newCells });
    setSelection(null);
  };

  const addColumn = () => {
    const cIdx = bounds ? bounds.maxC + 1 : columns.length;
    const newCols = [...columns];
    newCols.splice(cIdx, 0, "New Slot");
    
    const newCells = cells.map((row) => {
      const newRow = [...row];
      newRow.splice(cIdx, 0, { course: "", teacher: "", room: "", status: "NORMAL", reason: "", textLabel: "", rowSpan: 1, colSpan: 1, hidden: false });
      return newRow;
    });

    for(let r=0; r < rows.length; r++) {
      for(let c=0; c < cIdx; c++) {
         const cell = newCells[r][c];
         if (!cell.hidden && cell.colSpan > cIdx - c) {
             newCells[r][c] = { ...cell, colSpan: cell.colSpan + 1 };
             newCells[r][cIdx] = { hidden: true, mergeParent: {r, c} };
         }
      }
    }
    setGridState({ columns: newCols, rows, cells: newCells });
  };

  const deleteColumn = () => {
    if (!bounds) return;
    const newCols = [...columns];
    const newCells = cells.map(r => [...r]);
    unmergeCellsInRange(0, rows.length - 1, 0, columns.length - 1, newCells);

    const deleteCount = bounds.maxC - bounds.minC + 1;
    newCols.splice(bounds.minC, deleteCount);
    newCells.forEach(row => row.splice(bounds.minC, deleteCount));
    
    setGridState({ columns: newCols, rows, cells: newCells });
    setSelection(null);
  };

  const updateHeader = (type, index, key, value) => {
    if (type === 'col') {
      const newCols = [...columns];
      newCols[index] = value;
      setGridState(prev => ({ ...prev, columns: newCols }));
    } else {
      const newRows = [...rows];
      newRows[index] = { ...newRows[index], [key]: value };
      setGridState(prev => ({ ...prev, rows: newRows }));
    }
  };

  const saveCell = (updatedCell) => {
    const newCells = cells.map(r => [...r]);
    newCells[cellEditor.r][cellEditor.c] = { ...newCells[cellEditor.r][cellEditor.c], ...updatedCell };
    setGridState(prev => ({ ...prev, cells: newCells }));
    setCellEditor(null);
  };

  const clearSelectedCells = () => {
    if(!bounds) return;
    const newCells = cells.map(r => [...r]);
    for(let r = bounds.minR; r <= bounds.maxR; r++) {
       for(let c = bounds.minC; c <= bounds.maxC; c++) {
          if (!newCells[r][c].hidden) {
             newCells[r][c] = { ...newCells[r][c], course: "", teacher: "", room: "", textLabel: "", status: "NORMAL" };
          }
       }
    }
    setGridState(prev => ({ ...prev, cells: newCells }));
  }

  const renderCellEditor = () => {
    if (!cellEditor) return null;
    const { cell } = cellEditor;

    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.65)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
      }}>
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
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b" }}>Course / Title (e.g. BREAK, ICE 1101)</label>
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
     for(let r=bounds.minR; r<=bounds.maxR; r++) {
         for(let c=bounds.minC; c<=bounds.maxC; c++) {
             if (!cells[r]?.[c]?.hidden && (cells[r]?.[c]?.rowSpan > 1 || cells[r]?.[c]?.colSpan > 1)) return true;
         }
     }
     return false;
  })();

  const thStyle = { padding: "0.5rem 0.4rem", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.15)", whiteSpace: "nowrap" };
  const tdHeaderStyle = { padding: "0.4rem", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #e2e8f0", textAlign: "center" };
  const tbBtnStyle = { display: "flex", alignItems: "center", gap: "0.3rem", background: "#fff", border: "1px solid #cbd5e1", padding: "0.35rem 0.6rem", borderRadius: "6px", fontSize: "0.78rem", cursor: "pointer", color: "#334155" };

  return (
    <div style={{ userSelect: isDragging ? "none" : "auto" }}>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem", background: "#f8fafc", padding: "0.75rem", borderRadius: "10px", border: "1px solid #e2e8f0", alignItems: "center" }}>
        <div style={{ fontWeight: "600", color: "#475569", marginRight: "0.5rem", fontSize: "0.85rem" }}>Grid Tools:</div>
        <button onClick={handleMerge} disabled={!canMerge} style={{ ...tbBtnStyle, opacity: canMerge ? 1 : 0.5 }} title="Merge Selected Cells"><Merge size={14} /> Merge</button>
        <button onClick={handleUnmerge} disabled={!canUnmerge} style={{ ...tbBtnStyle, opacity: canUnmerge ? 1 : 0.5 }} title="Unmerge Cells"><SplitSquareHorizontal size={14} /> Unmerge</button>
        <div style={{ width: "1px", height: "20px", background: "#cbd5e1", margin: "0 0.25rem" }} />
        <button onClick={addRow} style={tbBtnStyle}><ArrowDown size={14} /> Add Row</button>
        <button onClick={deleteRow} disabled={!bounds} style={{ ...tbBtnStyle, color: bounds ? "#ef4444" : "inherit", opacity: bounds ? 1 : 0.5 }}><Trash2 size={14} /> Del Row</button>
        <button onClick={addColumn} style={tbBtnStyle}><ArrowRight size={14} /> Add Col</button>
        <button onClick={deleteColumn} disabled={!bounds} style={{ ...tbBtnStyle, color: bounds ? "#ef4444" : "inherit", opacity: bounds ? 1 : 0.5 }}><Trash2 size={14} /> Del Col</button>
        <div style={{ width: "1px", height: "20px", background: "#cbd5e1", margin: "0 0.25rem" }} />
        <button onClick={clearSelectedCells} disabled={!bounds} style={{ ...tbBtnStyle, opacity: bounds ? 1 : 0.5 }}><X size={14} /> Clear Cell</button>

        <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", cursor: "pointer", background: multiSelectMode ? "#dbeafe" : "#fff", padding: "0.3rem 0.6rem", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
          <input type="checkbox" checked={multiSelectMode} onChange={e => setMultiSelectMode(e.target.checked)} /> Hold Selection (Mobile)
        </label>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #cbd5e1", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", background: "white" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", minWidth: "900px" }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
              <th style={{ ...thStyle, width: "60px" }}>Day</th>
              <th style={{ ...thStyle, width: "60px" }}>Year</th>
              <th style={{ ...thStyle, width: "100px" }}>Semester</th>
              {columns.map((col, cIdx) => (
                <th key={`th-${cIdx}`} style={thStyle}>
                  <EditableText value={col} onChange={val => updateHeader('col', cIdx, null, val)} placeholder="Slot Name" style={{ color: "white", fontWeight: "700" }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={`r-${rIdx}`} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ ...tdHeaderStyle, background: "#f8fafc", color: "#1e40af", fontWeight: "700" }}>
                   <EditableText value={row.day} onChange={val => updateHeader('row', rIdx, 'day', val)} placeholder="Day" />
                </td>
                <td style={{ ...tdHeaderStyle, background: "#f8fafc", color: "#475569", fontWeight: "600" }}>
                   <EditableText value={row.year} onChange={val => updateHeader('row', rIdx, 'year', val)} placeholder="Year" />
                </td>
                <td style={{ ...tdHeaderStyle, background: "#f8fafc", color: "#475569" }}>
                   <EditableText value={row.sem} onChange={val => updateHeader('row', rIdx, 'sem', val)} placeholder="Semester" />
                </td>
                {cells[rIdx] && cells[rIdx].map((cell, cIdx) => {
                  if (cell.hidden) return null;
                  const selected = isSelected(rIdx, cIdx);
                  return (
                    <td
                      key={`c-${cIdx}`}
                      rowSpan={cell.rowSpan || 1}
                      colSpan={cell.colSpan || 1}
                      onMouseDown={(e) => handleMouseDown(rIdx, cIdx, e)}
                      onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                      onDoubleClick={() => setCellEditor({ r: rIdx, c: cIdx, cell })}
                      style={{
                        padding: "0.4rem", border: "1px solid #cbd5e1", textAlign: "center", verticalAlign: "middle", cursor: "cell", position: "relative",
                        background: selected ? "#e0f2fe" : cell.status === "CANCELLED" ? "#fef2f2" : cell.course ? "#f0fdf4" : "white",
                        boxShadow: selected ? "inset 0 0 0 2px #3b82f6" : "none",
                        minWidth: "100px", transition: "background 0.1s"
                      }}
                    >
                      {cell.status === "CANCELLED" ? (
                        <div>
                          <div style={{ color: "#ef4444", fontWeight: 700, fontSize: "0.68rem" }}>CANCELLED</div>
                          {cell.reason && <div style={{ fontSize: "0.6rem", color: "#b91c1c", marginTop: "0.1rem" }}>{cell.reason}</div>}
                        </div>
                      ) : cell.course ? (
                        <div style={{ lineHeight: 1.3, whiteSpace: "pre-wrap" }}>
                          <div style={{ fontWeight: 700, color: cell.course.includes("BREAK") ? "#dc2626" : "#0c4a6e", fontSize: "0.75rem", letterSpacing: cell.course.length <= 5 ? "0.1em" : "normal" }}>
                              {cell.course}
                          </div>
                          {cell.teacher && <div style={{ color: "#16a34a", fontSize: "0.65rem", marginTop: "2px" }}>[{cell.teacher}]</div>}
                          {cell.room && <div style={{ color: "#64748b", fontSize: "0.6rem" }}>({cell.room})</div>}
                        </div>
                      ) : (
                        <div style={{ color: selected ? "#93c5fd" : "transparent" }}>+</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderCellEditor()}
    </div>
  );
};

 

export default RoutineGrid;