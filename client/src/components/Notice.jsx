import React from "react";
import {
  FaPaperclip,
  FaTrash,
  FaFilePdf,
  FaImage,
  FaFolder,
  FaBullhorn,
} from "react-icons/fa";
import axios from "../utils/axiosConfig";

/**
 * Notice — Shared notice component for TeacherDashboard and BatchDashboard.
 *
 * Props:
 *   mode              "teacher" | "student"  (default: "teacher")
 *   notices           array  — pass `notices` from Teacher, `announcements` from Batch
 *   openNotice        fn(notice) — opens the NoticeDetail modal
 *
 * Teacher-only props (ignored in student mode):
 *   showNoticeForm    bool
 *   setShowNoticeForm fn
 *   handleNoticeSubmit fn(e)
 *   user              object { id, ... }
 *   loading           bool
 *   noticeAudience    string
 *   setNoticeAudience fn
 *   fetchNotices      fn  — refresh callback after delete
 */
const Notice = ({
  mode = "teacher",
  showNoticeForm,
  setShowNoticeForm,
  notices = [],
  openNotice,
  handleNoticeSubmit,
  user,
  loading,
  noticeAudience,
  setNoticeAudience,
  fetchNotices,
}) => {
  // ─── Compact styles ─────────────────────────────────────────────────────────
  const st = {
    outerCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "1rem 1.25rem 1.25rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      marginBottom: "0.75rem",
    },
    sectionTitle: {
      fontFamily: "'Georgia', serif",
      fontStyle: "italic",
      fontSize: "0.95rem",
      fontWeight: "600",
      color: "#ea580c",
      marginBottom: "0.75rem",
    },
    publishBtn: {
      background: "#ea580c",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "0 0.85rem",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "0.78rem",
      height: "32px",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.3rem",
    },
    submitBtn: {
      background: "#16a34a",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "0 1.25rem",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "0.82rem",
      margin: 0,
      height: "36px",
      display: "inline-flex",
      alignItems: "center",
    },
    declineBtn: {
      background: "#f1f5f9",
      color: "#475569",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      padding: "0 1.25rem",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "0.82rem",
      height: "36px",
      display: "inline-flex",
      alignItems: "center",
    },
    input: {
      width: "100%",
      padding: "0 0.75rem",
      borderRadius: "8px",
      border: "1.5px solid #e2e8f0",
      fontSize: "0.875rem",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
      height: "40px",
    },
    textarea: {
      width: "100%",
      padding: "0.55rem 0.75rem",
      borderRadius: "8px",
      border: "1.5px solid #e2e8f0",
      fontSize: "0.875rem",
      outline: "none",
      resize: "vertical",
      fontFamily: "inherit",
      boxSizing: "border-box",
    },
    label: {
      display: "block",
      fontWeight: "600",
      color: "#475569",
      marginBottom: "0.25rem",
      fontSize: "0.8rem",
    },
    noticeCard: {
      background: "#f8fafc",
      borderRadius: "10px",
      padding: "0.85rem 1rem",
      marginBottom: "0.5rem",
      border: "1px solid #e2e8f0",
    },
    attachBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.35rem",
      color: "#2563eb",
      textDecoration: "none",
      fontSize: "0.78rem",
      fontWeight: "500",
    },
    deleteBtn: {
      background: "#fef2f2",
      color: "#ef4444",
      border: "none",
      borderRadius: "6px",
      padding: "0.35rem 0.5rem",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
  };

  // ─── Filter helpers ────────────────────────────────────────────────────────
  const approvedNotices =
    mode === "teacher"
      ? notices.filter(
          (n) => n.status === "APPROVED" && n.target_audience !== "Student",
        )
      : notices.filter(
          (n) =>
            n.status === "APPROVED" &&
            (n.type === "NOTICE" || n.type === "ANNOUNCEMENT") &&
            n.target_audience === "Student",
        );

  const pendingNotices = notices.filter(
    (n) =>
      (n.status === "PENDING" || n.status === "PENDING_APPROVAL") &&
      n.author?._id === user?.id,
  );

  // ─── File-type helpers ─────────────────────────────────────────────────────
  const fileType = (url) => {
    if (!url) return null;
    if (url.toLowerCase().endsWith(".pdf")) return "pdf";
    if (/\.(jpeg|jpg|gif|png|webp)$/i.test(url)) return "img";
    return "file";
  };

  const FileIcon = ({ url, size = 16 }) => {
    const type = fileType(url);
    if (type === "pdf") return <FaFilePdf size={size} color="#ef4444" />;
    if (type === "img") return <FaImage size={size} color="#3b82f6" />;
    return <FaFolder size={size} color="#64748b" />;
  };

  const fileLabel = (url) => {
    const type = fileType(url);
    if (type === "pdf") return "PDF";
    if (type === "img") return "IMG";
    return "FILE";
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TEACHER MODE
  // ═══════════════════════════════════════════════════════════════════════════
  if (mode === "teacher") {
    if (!showNoticeForm) {
      return (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h2 style={{ ...st.sectionTitle, marginBottom: 0 }}>Latest Notices</h2>
            <button onClick={() => setShowNoticeForm(true)} style={st.publishBtn}>Create Notice</button>
          </div>

          <div style={{ ...st.outerCard, padding: "0", overflow: "hidden", borderRadius: "10px" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", background: "#f8fafc" }}>
                    {[
                      { label: "NO", align: "left", pad: "0.65rem 0.75rem" },
                      { label: "TITLE", align: "left", pad: "0.65rem 0.5rem" },
                      { label: "AUTHOR", align: "left", pad: "0.65rem 0.5rem" },
                      { label: "DATE", align: "center", pad: "0.65rem 0.5rem" },
                      { label: "FILES", align: "center", pad: "0.65rem 0.5rem" },
                      { label: "ACTION", align: "center", pad: "0.65rem 0.75rem" },
                    ].map(({ label, align, pad }) => (
                      <th key={label} style={{ padding: pad, textAlign: align, fontSize: "0.72rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {approvedNotices.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
                        No notices found.
                      </td>
                    </tr>
                  ) : (
                    approvedNotices.map((notice, index) => (
                      <tr
                        key={notice._id}
                        onClick={() => openNotice(notice)}
                        style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "")}
                      >
                        <td style={{ padding: "0.65rem 0.75rem", color: "#64748b" }}>{index + 1}</td>
                        <td style={{ padding: "0.65rem 0.5rem", fontWeight: "500", color: "#1e293b" }}>{notice.title}</td>
                        <td style={{ padding: "0.65rem 0.5rem", color: "#64748b" }}>{notice.author?.name || "Admin"}</td>
                        <td style={{ padding: "0.65rem 0.5rem", textAlign: "center", color: "#64748b" }}>
                          {new Date(notice.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "0.65rem 0.5rem", textAlign: "center" }}>
                          {notice.file_url ? (
                            <a href={notice.file_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: "3px", textDecoration: "none", fontSize: "0.78rem", color: "#475569" }}>
                              <FileIcon url={notice.file_url} />
                              <span>{fileLabel(notice.file_url)}</span>
                            </a>
                          ) : (
                            <span style={{ color: "#cbd5e1" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "0.65rem 0.75rem", textAlign: "center" }}>
                          <span style={{ background: "#eff6ff", color: "#2563eb", padding: "0.2rem 0.65rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: "600", whiteSpace: "nowrap" }}>
                            View
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    }

    // ── Create notice form + pending notices ─────────────────────────────────
    return (
      <>
        <div style={st.outerCard}>
          <h2 style={st.sectionTitle}>📣 Post New Notice</h2>
          <form onSubmit={handleNoticeSubmit}>
            <div style={{ marginBottom: "0.5rem" }}>
              <input name="noticeTitle" placeholder="Notice Title (e.g. Holi Holiday)" style={st.input} required />
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <textarea name="noticeContent" placeholder="Notice Details" rows="3" style={st.textarea} required />
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label style={st.label}>Attach Document (Optional)</label>
              <input name="noticeFile" type="file" accept=".pdf,.jpg,.png,.jpeg" style={{ fontSize: "0.82rem" }} />
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={st.label}>Select Audience</label>
              <select name="audience" style={st.input} value={noticeAudience} onChange={(e) => setNoticeAudience(e.target.value)}>
                <option value="Everyone">Everyone</option>
                <option value="Teacher">Teacher Only</option>
                <option value="Student">Student Only</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button type="submit" style={st.submitBtn} disabled={loading}>
                {loading ? "Sending…" : "Send for Approval"}
              </button>
              <button type="button" onClick={() => setShowNoticeForm(false)} style={st.declineBtn}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div style={st.outerCard}>
          <h2 style={st.sectionTitle}>⏳ Pending Notices</h2>
          {pendingNotices.length === 0 ? (
            <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.85rem" }}>
              No pending notices.
            </p>
          ) : (
            pendingNotices.map((item) => (
              <div key={item._id} style={st.noticeCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#1e293b", marginBottom: "0.15rem" }}>{item.title}</h4>
                    <p style={{ color: "#475569", fontSize: "0.82rem", margin: "0 0 0.25rem", lineHeight: "1.5" }}>{item.content}</p>
                    {item.file_url && (
                      <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={st.attachBtn}>
                        <FaPaperclip size={11} /> View Attached
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this pending notice?")) {
                        axios.delete(`/announcements/${item._id}`).then(() => fetchNotices()).catch((err) => console.error("Delete failed:", err));
                      }
                    }}
                    style={st.deleteBtn}
                    title="Delete notice"
                  >
                    <FaTrash size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STUDENT MODE  (BatchDashboard)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div>
      {approvedNotices.length === 0 ? (
        <p style={{ color: "#94a3b8", textAlign: "center", marginTop: "0.75rem", fontSize: "0.85rem" }}>
          No new notices.
        </p>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: "45px", textAlign: "center" }}>No</th>
                <th>Title</th>
                <th style={{ width: "70px", textAlign: "center" }}>Files</th>
                <th style={{ width: "100px" }}>Date</th>
                <th style={{ width: "80px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedNotices.map((ann, index) => (
                <tr key={ann._id} style={{ cursor: "pointer" }} onClick={() => openNotice(ann)}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td style={{ fontWeight: "500", color: "var(--text-main)" }}>
                    <FaBullhorn style={{ marginRight: "0.35rem", color: "#f97316" }} size={12} />
                    {ann.title}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {ann.file_url ? (
                      <a href={ann.file_url} target="_blank" rel="noopener noreferrer" className="file-icon" title="Download File" onClick={(e) => e.stopPropagation()}>
                        <FileIcon url={ann.file_url} />
                        <span>{fileLabel(ann.file_url)}</span>
                      </a>
                    ) : (
                      <span style={{ color: "#cbd5e1" }}>-</span>
                    )}
                  </td>
                  <td>{new Date(ann.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ background: "#eff6ff", color: "#2563eb", padding: "0.2rem 0.65rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: "600", whiteSpace: "nowrap" }}>
                      View
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Notice;
