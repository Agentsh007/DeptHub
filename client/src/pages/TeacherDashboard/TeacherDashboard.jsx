import React, { useState, useEffect, useContext } from "react";
import axios from "../../utils/axiosConfig";
import { AuthContext } from "../../context/AuthContext";
import { Layout } from "../../components/Layout";
import { Loader, ConfirmModal } from "../../components/UI";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCloudUploadAlt,
  FaFilePdf,
  FaTrash,
  FaFolder,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileArchive,
  FaFileCode,
  FaFileVideo,
  FaFileAudio,
  FaFileAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheck,
  FaPaperclip,
} from "react-icons/fa";
import NoticeDetail from "../../components/NoticeDetail";
import Notice from "../../components/Notice";
import s from "../../utils/teacherDashboard";
import RoutineGrid from "./RoutineGrid";
import { Edit2, Paperclip, Save, Trash2, Trash
  
 } from "lucide-react";

// ── Common ICE/CSE course code suggestions ──
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

const TIME_SLOT_LABELS = [
  "09:05-10:00", "10:05-11:00", "11:05-12:00",
  "01:00-02:00", "02:05-03:00", "03:05-04:00",
];

const YEAR_GROUPS = [
  { year: "1st", semesters: ["1st Sem (2024)"] },
  { year: "2nd", semesters: ["2nd Sem (2025)"] },
  { year: "3rd", semesters: ["3rd Sem (2026)"] },
  { year: "4th", semesters: ["Old (2025)", "Even (2024)"] },
  { year: "MSc", semesters: ["1st Sem"] },
];
const ALL_SEMESTERS = YEAR_GROUPS.flatMap(g => g.semesters.map(s => ({ year: g.year, semester: s })));
// Index→yearSpan: 0 means "skip year cell (part of rowSpan above)"
const YEAR_SPAN_MAP = { 0: 1, 1: 1, 2: 1, 3: 2, 4: 0, 5: 1 };

const getFileIcon = (filename) => {
  if (!filename) return <FaFileAlt size={36} />;
  const ext = filename.split(".").pop().toLowerCase();
  if (["pdf"].includes(ext)) return <FaFilePdf size={36} color="#ef4444" />;
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext))
    return <FaFileImage size={36} color="#3b82f6" />;
  if (["doc", "docx"].includes(ext)) return <FaFileWord size={36} color="#2563eb" />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <FaFileExcel size={36} color="#16a34a" />;
  if (["ppt", "pptx"].includes(ext)) return <FaFilePowerpoint size={36} color="#d97706" />;
  if (["zip", "rar", "7z", "tar"].includes(ext)) return <FaFileArchive size={36} color="#9333ea" />;
  if (["mp4", "mkv", "avi", "mov"].includes(ext)) return <FaFileVideo size={36} color="#be123c" />;
  if (["mp3", "wav", "ogg"].includes(ext)) return <FaFileAudio size={36} color="#db2777" />;
  if (["js", "jsx", "ts", "tsx", "html", "css", "json", "py", "java", "c", "cpp"].includes(ext))
    return <FaFileCode size={36} color="#4b5563" />;
  return <FaFileAlt size={36} color="#64748b" />;
};

// ── Status badge ──
const StatusBadge = ({ status }) => {
  const map = {
    PENDING_FEEDBACK: { bg: "#fef3c7", color: "#b45309", label: "Peer Review" },
    PENDING_APPROVAL: { bg: "#fed7aa", color: "#c2410c", label: "Awaiting Approval" },
    APPROVED: { bg: "#dcfce7", color: "#16a34a", label: "Approved" },
    REJECTED: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
  };
  const st = map[status] || { bg: "#f1f5f9", color: "#64748b", label: status };
  return (
    <span style={{
      background: st.bg, color: st.color,
      fontSize: "0.72rem", fontWeight: "700",
      padding: "0.2rem 0.6rem", borderRadius: "999px",
    }}>
      {st.label}
    </span>
  );
};

const TeacherDashboard = () => {
  const { user, loadUser, loading: authLoading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("announcement");
  const [batches, setBatches] = useState([]);
  const [myDocs, setMyDocs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ full_name: "", email: "", department: "" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null, isDanger: false });
  const closeConfirmModal = () => setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeAudience, setNoticeAudience] = useState("");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [openBatchFolder, setOpenBatchFolder] = useState(null);

  // ── Routine Builder State ──
  const [timetableData, setTimetableData] = useState([]);
   
  const [cellEditor, setCellEditor] = useState(null);

  const [gridState, setGridState] = useState({ columns: [], rows: [], cells: [] });
  const [previousRoutines, setPreviousRoutines] = useState([]);
  const [editingRoutineId, setEditingRoutineId] = useState(null);
  const [allTeachers, setAllTeachers] = useState([]); 
  const [routineSubmitting, setRoutineSubmitting] = useState(false);
  const [routineMsg, setRoutineMsg] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
  }, [location.search]);
 

  const convertLegacyToGrid = (legacyData) => {
    if (!legacyData || legacyData.length === 0) return createEmptyGrid();
    if (legacyData.columns && legacyData.rows && legacyData.cells) return legacyData;

    const columns = [...TIME_SLOT_LABELS.slice(0, 3), "BREAK", ...TIME_SLOT_LABELS.slice(3)];
    const rows = [];
    const cells = [];

    legacyData.forEach(dayRow => {
      dayRow.semesterRows.forEach(semRow => {
        rows.push({ id: crypto.randomUUID(), day: dayRow.day, year: semRow.year || '', sem: semRow.semester || '' });
        const rowCells = [];
        semRow.slots.forEach((slot, idx) => {
          if (idx === 3) rowCells.push({ course: "", rowSpan: 1, colSpan: 1, hidden: false });
          rowCells.push({ ...slot, rowSpan: 1, colSpan: 1, hidden: false });
        });
        if (rowCells.length < columns.length) rowCells.splice(3, 0, { course: "", rowSpan: 1, colSpan: 1, hidden: false });
        cells.push(rowCells);
      });
    });

    if (cells.length > 0) {
      cells[0][3] = { course: "BREAK", rowSpan: cells.length, colSpan: 1, hidden: false };
      for (let r = 1; r < cells.length; r++) cells[r][3] = { hidden: true, mergeParent: { r: 0, c: 3 } };
    }
    return { columns, rows, cells };
  };

  const createEmptyGrid = () => {
    const columns = [...TIME_SLOT_LABELS.slice(0, 3), "BREAK", ...TIME_SLOT_LABELS.slice(3)];
    const rows = [];
    const cells = [];
    const days = ["SUN", "MON", "TUE", "WED", "THU"];

    days.forEach(day => {
      YEAR_GROUPS.forEach(yg => {
        yg.semesters.forEach(sem => {
          rows.push({ id: crypto.randomUUID(), day, year: yg.year, sem });
          cells.push(columns.map(() => ({ course: "", teacher: "", room: "", status: "NORMAL", reason: "", rowSpan: 1, colSpan: 1, hidden: false })));
        });
      });
    });

    if (cells.length > 0) {
      cells[0][3] = { course: "B\nR\nE\nA\nK", rowSpan: cells.length, colSpan: 1, hidden: false };
      for (let r = 1; r < cells.length; r++) cells[r][3] = { hidden: true, mergeParent: { r: 0, c: 3 } };
    }
    return { columns, rows, cells };
  };

  const initializeGrid = () => setGridState(createEmptyGrid());

  useEffect(() => {
    if (activeTab === "new-upload" || activeTab === "announcement") fetchBatches();
    if (activeTab === "my-uploads") fetchMyDocs();
    if (activeTab === "notices") fetchNotices();
    if (activeTab === "routine") {
      initializeGrid();
      fetchPreviousRoutines();
      fetchAllTeachers();
    }
  }, [activeTab]);
 
  const days = ["SUN", "MON", "TUE", "WED", "THU"];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
    else navigate("?tab=announcement", { replace: true });
  }, [location.search, navigate]);

  const fetchBatches = async () => {
    try {
      const res = await axios.get("/batches");
      setBatches(res.data);
      if (res.data.length > 0 && !selectedBatch) setSelectedBatch(res.data[0]._id);
    } catch (err) { console.error(err); }
  };

  const fetchMyDocs = async () => {
    try {
      const res = await axios.get("/documents/my-uploads");
      setMyDocs(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchNotices = async () => {
    try {
      const res = await axios.get("/announcements");
      setNotices(res.data.filter((n) => n.type === "NOTICE"));
    } catch (err) { console.error(err); }
  };

  // ✅ NEW: Fetch all teachers for cell editor dropdown
  const fetchAllTeachers = async () => {
    try {
      const res = await axios.get("/auth/teachers");
      setAllTeachers(res.data);
    } catch (err) { console.error("Could not load teachers", err); }
  };

  const fetchPreviousRoutines = async () => {
    try {
      const res = await axios.get("/announcements");
      const routines = res.data.filter(
        (a) => a.type === "ROUTINE" && a.author?._id === user.id
      );
      setPreviousRoutines(routines);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeTab === "new-upload" || activeTab === "announcement") fetchBatches();
    if (activeTab === "my-uploads") fetchMyDocs();
    if (activeTab === "notices") fetchNotices();
    if (activeTab === "routine") {
      initializeTimetable();
      fetchPreviousRoutines();
      fetchAllTeachers(); // ✅ NEW
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const initializeTimetable = () => {
    const data = days.map((day) => ({
      day,
      semesterRows: ALL_SEMESTERS.map(({ year, semester }) => ({
        year,
        semester,
        slots: Array(6).fill().map(() => ({
          course: "", teacher: "", room: "", status: "NORMAL", reason: "",
        })),
      })),
    }));
    setTimetableData(data);
  };

  const openCellEditor = (dayIndex, semIndex, slotIndex) => {
    const slot = timetableData[dayIndex].semesterRows[semIndex].slots[slotIndex];
    setCellEditor({ dayIndex, semIndex, slotIndex, slot: { ...slot } });
  };

  const saveCell = (updatedSlot) => {
    setTimetableData((prev) => {
      const newData = prev.map((d, di) => {
        if (di !== cellEditor.dayIndex) return d;
        return {
          ...d,
          semesterRows: d.semesterRows.map((sr, si) => {
            if (si !== cellEditor.semIndex) return sr;
            return {
              ...sr,
              slots: sr.slots.map((sl, sli) =>
                sli === cellEditor.slotIndex ? updatedSlot : sl
              ),
            };
          }),
        };
      });
      return newData;
    });
    setCellEditor(null);
  };

  const clearCell = () => {
    saveCell({ course: "", teacher: "", room: "", status: "NORMAL", reason: "" });
  };

  const submitRoutine = async () => {
    setRoutineSubmitting(true);
    setRoutineMsg(null);
    try {
      await axios.post("/announcements/routine-builder", {
        title: `Weekly Routine – ${new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}`,
        timetable: timetableData,
        routineId: editingRoutineId,
      });
      setRoutineMsg({
        text: editingRoutineId
          ? "✅ Routine updated! PDF regenerated and sent for review."
          : "✅ Routine created! PDF generated and sent for peer review.",
        type: "success",
      });
      initializeTimetable();
      setEditingRoutineId(null);
      fetchPreviousRoutines();
    } catch (err) {
      setRoutineMsg({ text: "❌ Failed to save routine. Please try again.", type: "error" });
      console.error(err);
    } finally {
      setRoutineSubmitting(false);
    }
  };

  const handleEditRoutine = (routine) => {
    setEditingRoutineId(routine._id);
    setRoutineMsg(null);
    if (Array.isArray(routine.timetable) && routine.timetable.length > 0) {
      setTimetableData(routine.timetable);
    } else {
      initializeTimetable();
    }
    // Scroll to grid
    setTimeout(() => {
      document.getElementById("routine-grid")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const cancelEditing = () => {
    setEditingRoutineId(null);
    setRoutineMsg(null);
    initializeTimetable();
  };

  const deleteRoutine = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Routine?",
      message: "This will permanently delete this routine and its PDF.",
      isDanger: true,
      onConfirm: async () => {
        try {
          await axios.delete(`/announcements/${id}`);
          fetchPreviousRoutines();
          if (editingRoutineId === id) cancelEditing();
        } catch { alert("Delete failed"); }
        finally { closeConfirmModal(); }
      },
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_batch_id", selectedBatch);
    setLoading(true); setMsg("");
    try {
      await axios.post(`/documents/upload?target_batch_id=${selectedBatch}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg("File Uploaded Successfully");
      setFile(null);
    } catch { setMsg("Upload Failed"); }
    finally { setLoading(false); }
  };

  const handleClassUpdate = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      const message = e.target.message.value;
      const title = e.target.title_display?.value || "Announcement";
      await axios.post("/announcements", {
        title, content: message,
        type: "ANNOUNCEMENT",
        target_batch: selectedBatch,
        target_audience: "Student",
      });
      setMsg("Announcement Sent Successfully");
      e.target.reset();
    } catch { setMsg("Failed to send"); }
    finally { setLoading(false); }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      const formData = new FormData();
      formData.append("title", e.target.noticeTitle.value);
      formData.append("content", e.target.noticeContent.value);
      formData.append("type", "NOTICE");
      formData.append("target_audience", noticeAudience);
      if (e.target.noticeFile.files[0]) formData.append("file", e.target.noticeFile.files[0]);
      await axios.post("/announcements", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Notice sent for approval!");
      e.target.reset();
      setNoticeAudience("Everyone");
      setShowNoticeForm(false);
      fetchNotices();
    } catch { alert("Failed to submit notice"); }
    finally { setLoading(false); }
  };
  // const deleteNotice = async (id) => {
  //   try {
  //     axios.delete(`/announcements/${id}`)
  //     fetchNotices()
  //   } catch {
  //     alert("Failed to delete notice")
  //   }
  // }
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put("/auth/profile", editData);
      if (res.data.success) {
        alert("Profile Updated.");
        setEditMode(false);
        await loadUser();
      }
    } catch { alert("Update failed"); }
  };

  const deleteDoc = (id) => {
    setConfirmModal({
      isOpen: true, title: "Delete File?", message: "Permanently delete this file?", isDanger: true,
      onConfirm: async () => {
        try {
          await axios.delete(`/documents/${id}`);
          fetchMyDocs();
        } catch { alert("Delete failed"); }
        finally { closeConfirmModal(); }
      },
    });
  };

  const groupedDocs = myDocs.reduce((acc, doc) => {
    const batchName = doc.target_batch?.batch_name || "General";
    if (!acc[batchName]) acc[batchName] = [];
    acc[batchName].push(doc);
    return acc;
  }, {});
  const batchNames = Object.keys(groupedDocs);

 
  const inputStyle = {
    width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px",
    border: "1.5px solid #e2e8f0", fontSize: "0.85rem",
    outline: "none", boxSizing: "border-box", height: "38px",
  };
  const labelStyle = {
    display: "block", fontSize: "0.75rem", fontWeight: "600",
    color: "#64748b", marginBottom: "0.25rem",
  };

  // ==================== RETURN JSX ====================
  if (authLoading) return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Loader />
    </div>
  );
  if (!user) return null;

  return (
    <Layout>
      <div style={s.wrapper}>
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          isDanger={confirmModal.isDanger}
        />

        {/* ═══════ ANNOUNCEMENTS TAB ═══════ */}
        {activeTab === "announcement" && (
          <div style={s.outerCard}>
            <h2 style={s.sectionTitle}>Target Batch</h2>
            <form onSubmit={handleClassUpdate}>
              <div style={{ marginBottom: "1.25rem" }}>
                <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={s.input}>
                  {batches.map((b) => <option key={b._id} value={b._id}>{b.batch_name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <input name="title_display" placeholder="Title/Subject" style={s.input} />
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <textarea name="message" placeholder="Message..." rows="4" style={s.textarea} required />
              </div>
              {msg && (
                <div style={{
                  textAlign: "center", padding: "0.75rem",
                  background: msg.includes("Success") ? "#dcfce7" : "#fee2e2",
                  borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem",
                }}>{msg}</div>
              )}
              <button type="submit" style={s.submitBtn} disabled={loading}>Send to Announcement</button>
            </form>
          </div>
        )}

        {/* ═══════ NEW UPLOAD TAB ═══════ */}
        {activeTab === "new-upload" && (
          <div style={s.outerCard}>
            <h2 style={s.sectionTitle}>Target Batch</h2>
            {msg && (
              <div style={{
                textAlign: "center", padding: "0.75rem",
                background: msg.includes("Success") ? "#dcfce7" : "#fee2e2",
                color: msg.includes("Success") ? "#166534" : "#991b1b",
                borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem",
              }}>{msg}</div>
            )}
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: "1.25rem" }}>
                <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={s.input}>
                  {batches.map((b) => <option key={b._id} value={b._id}>{b.batch_name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={s.label}>Select Document</label>
                <div onClick={() => document.getElementById("resFile").click()} style={s.uploadZone}>
                  <div style={{ color: "#ea580c", marginBottom: "0.75rem" }}><FaCloudUploadAlt size={48} /></div>
                  {file
                    ? <div style={{ fontWeight: "600", color: "#1e293b" }}>{file.name}</div>
                    : <div style={{ color: "#1e293b", fontWeight: "600" }}>Click to browse file</div>
                  }
                </div>
                <input id="resFile" type="file" onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
              </div>
              <button type="submit" style={s.submitBtn} disabled={loading}>Upload Resource</button>
            </form>
          </div>
        )}

        {/* ═══════ MY UPLOADS TAB ═══════ */}
        {activeTab === "my-uploads" && (
          <div style={s.outerCard}>
            {!openBatchFolder ? (
              batchNames.length === 0 ? (
                <p style={{ color: "#94a3b8", textAlign: "center" }}>No uploads found.</p>
              ) : (
                <div className="teacher-folder-grid">
                  {batchNames.map((name) => (
                    <div key={name} onClick={() => setOpenBatchFolder(name)} style={{ ...s.folderCard, cursor: "pointer" }}>
                      <div style={{ color: "#f59e0b", marginBottom: "0.5rem" }}><FaFolder size={40} /></div>
                      <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#ea580c" }}>{name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                        {groupedDocs[name].length} file(s)
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <>
                <button onClick={() => setOpenBatchFolder(null)} style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  background: "none", border: "none", color: "#ea580c",
                  fontWeight: "600", fontSize: "0.95rem", cursor: "pointer", marginBottom: "1.25rem", padding: 0,
                }}>← Back</button>
                <h3 style={{ fontWeight: "700", color: "#1e293b", fontSize: "1.1rem", marginBottom: "1.25rem" }}>
                  {openBatchFolder}
                </h3>
                {(groupedDocs[openBatchFolder] || []).length === 0 ? (
                  <p style={{ color: "#94a3b8", textAlign: "center", fontStyle: "italic" }}>No files in this batch.</p>
                ) : (
                  <div className="teacher-folder-grid">
                    {groupedDocs[openBatchFolder].map((doc) => (
                      <div key={doc._id} style={{ ...s.folderCard, position: "relative" }}>
                        <button onClick={() => deleteDoc(doc._id)} style={{ ...s.deleteBtn, position: "absolute", top: "0.4rem", right: "0.4rem" }}>
                          <FaTrash size={10} />
                        </button>
                        <a href={doc.file_path} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                          <div style={{ marginBottom: "0.5rem" }}>{getFileIcon(doc.original_filename)}</div>
                          <div style={{ fontWeight: "600", fontSize: "0.85rem", color: "#ea580c", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {doc.original_filename}
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════ NOTICES TAB ═══════ */}
        {activeTab === "notices" && (
          <Notice
            showNoticeForm={showNoticeForm} setShowNoticeForm={setShowNoticeForm}
            notices={notices} openNotice={(n) => setSelectedNotice(n)}
            handleNoticeSubmit={handleNoticeSubmit} user={user} loading={loading}
            noticeAudience={noticeAudience} setNoticeAudience={setNoticeAudience}
            fetchNotices={fetchNotices}
          />
        )}

        {/* ═══════ ROUTINE BUILDER TAB ═══════ */}
        {activeTab === "routine" && (
          <div style={s.outerCard}>
            <h2 style={s.sectionTitle}>📅 Routine Builder</h2>
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#1e293b", marginBottom: "1rem" }}>Your Previous Routines</h3>
              {previousRoutines.length === 0 ? (
                <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.9rem" }}>No routines yet. Create your first one below.</p>
              ) : (
                previousRoutines.map((r) => (
                  <div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: editingRoutineId === r._id ? "#eff6ff" : "#f8fafc", border: editingRoutineId === r._id ? "1.5px solid #3b82f6" : "1px solid #e2e8f0", padding: "1rem 1.5rem", borderRadius: "12px", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div>
                      <div style={{ fontWeight: "700", color: "#1e293b", marginBottom: "0.25rem" }}>
                        {r.title}
                        {editingRoutineId === r._id && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#3b82f6", fontWeight: "600" }}>[Currently Editing]</span>}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {new Date(r.created_at).toLocaleDateString()}
                        <StatusBadge status={r.status} />
                      </div>
                      {r.feedback && <div style={{ fontSize: "0.8rem", color: "#b45309", marginTop: "0.25rem", fontStyle: "italic" }}>Feedback: {r.feedback}</div>}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {r.file_url && <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.9rem", background: "#fff7ed", color: "#b45309", border: "1px solid #fed7aa", borderRadius: "7px", fontSize: "0.8rem", fontWeight: "600", textDecoration: "none" }}><Paperclip size={11} /> View PDF</a>}
                      <button onClick={() => handleEditRoutine(r)} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "#eff6ff", color: "#2563eb", padding: "0.4rem 0.9rem", borderRadius: "7px", border: "1px solid #bfdbfe", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}><Edit2 size={11} /> Edit</button>
                      <button onClick={() => deleteRoutine(r._id)} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "#fef2f2", color: "#ef4444", padding: "0.4rem 0.9rem", borderRadius: "7px", border: "1px solid #fecaca", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}><Trash2 size={11} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div id="routine-grid">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                  {editingRoutineId ? "✏️ Editing Routine" : "➕ Create New Routine"}
                </h3>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", background: "#f8fafc", padding: "0.35rem 0.8rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  💡 Click & Drag to select multiple cells • Double Click to edit content
                </div>
              </div>

              {routineMsg && <div style={{ padding: "0.85rem 1.25rem", borderRadius: "10px", marginBottom: "1rem", background: routineMsg.type === "success" ? "#dcfce7" : "#fee2e2", color: routineMsg.type === "success" ? "#166534" : "#991b1b", fontWeight: "500", fontSize: "0.9rem" }}>{routineMsg.text}</div>}

              {/* INTEGRATED ROUTINE GRID MODULE */}
              <RoutineGrid gridState={gridState} setGridState={setGridState} allTeachers={allTeachers} />

            </div>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1.5rem", flexWrap: "wrap" }}>
              {editingRoutineId && <button onClick={cancelEditing} style={{ padding: "0 1.25rem", borderRadius: "8px", fontWeight: "600", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", cursor: "pointer", fontSize: "0.82rem", height: "36px", display: "flex", alignItems: "center", gap: "0.35rem" }}><X size={12} /> Cancel</button>}
              <button onClick={submitRoutine} disabled={routineSubmitting} style={{ padding: "0 1.5rem", borderRadius: "8px", fontWeight: "700", background: routineSubmitting ? "#86efac" : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", color: "white", border: "none", cursor: routineSubmitting ? "default" : "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.35rem", boxShadow: "0 2px 6px rgba(22,163,74,0.25)", height: "36px" }}><Save size={13} /> {routineSubmitting ? "Generating PDF..." : editingRoutineId ? "Update Routine" : "Submit Routine"}</button>
            </div>
          </div>
        )}

        {/* ═══════ PROFILE TAB ═══════ */}
        {activeTab === "profile" && (
          <div style={s.outerCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ ...s.sectionTitle, marginBottom: "0.25rem" }}>Teacher Profile</h2>
                <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>Manage your account details.</p>
              </div>
              {!editMode && (
                <button onClick={() => { setEditData({ full_name: user.name, email: user.email, department: user.department || "" }); setEditMode(true); }} style={s.declineBtn}>
                  Edit Profile
                </button>
              )}
            </div>
            {editMode ? (
              <form onSubmit={updateProfile}>
                <div className="chairman-profile-grid" style={{ marginBottom: "1.5rem" }}>
                  <div>
                    <label style={s.label}>Full Name</label>
                    <input type="text" value={editData.full_name} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })} style={s.input} />
                  </div>
                  <div>
                    <label style={s.label}>Email Address</label>
                    <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} style={s.input} />
                  </div>
                  <div>
                    <label style={s.label}>Department</label>
                    <input type="text" value={editData.department} onChange={(e) => setEditData({ ...editData, department: e.target.value })} style={s.input} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button type="submit" style={s.publishBtn}>Save Changes</button>
                  <button type="button" onClick={() => setEditMode(false)} style={s.declineBtn}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="chairman-profile-grid">
                {[["Full Name", user.name], ["Email Address", user.email], ["Role", user.role], ["Department", user.department || "ICE"]].map(([label, val]) => (
                  <div key={label} style={s.profileCard}>
                    <label style={s.profileLabel}>{label}</label>
                    <div style={s.profileValue}>{val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>


      {/* Notice Detail Popup */}
      {selectedNotice && <NoticeDetail selectedNotice={selectedNotice} closeNotice={() => setSelectedNotice(null)} />}
    </Layout>
  );
};

const thStyle = {
  padding: "0.45rem 0.35rem",
  textAlign: "center",
  fontWeight: "700",
  color: "white",
  fontSize: "0.7rem",
  borderRight: "1px solid rgba(255,255,255,0.12)",
  whiteSpace: "nowrap",
};

export default TeacherDashboard;