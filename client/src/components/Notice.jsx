// import React from 'react'
// import s from "../utils/teacherDashboard";
// import axios from "../utils/axiosConfig";
// const Notice = ({ showNoticeForm, setShowNoticeForm , notices, openNotice, handleNoticeSubmit, user, loading, noticeAudience, setNoticeAudience, fetchNotices}) => {
//   return (
//     <>
//                 {!showNoticeForm ? (
//                   <>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         marginBottom: "1.5rem",
//                         flexWrap: "wrap",
//                         gap: "1rem",
//                       }}
//                     >
//                       <h2 style={{ ...s.sectionTitle, marginBottom: 0 }}>
//                         Latest Notices
//                       </h2>
//                       <button
//                         onClick={() => setShowNoticeForm(true)}
//                         style={s.publishBtn}
//                       >
//                         Create Notice
//                       </button>
//                     </div>

//                     <div
//                       style={{
//                         ...s.outerCard,
//                         padding: "0",
//                         overflow: "hidden",
//                         borderRadius: "12px",
//                       }}
//                     >
//                       <div style={{ overflowX: "auto" }}>
//                         <table
//                           style={{
//                             width: "100%",
//                             borderCollapse: "collapse",
//                             minWidth: "700px",
//                           }}
//                         >
//                           <thead>
//                             <tr
//                               style={{
//                                 borderBottom: "2px solid #e2e8f0",
//                                 background: "#f8fafc",
//                               }}
//                             >
//                               <th
//                                 style={{
//                                   padding: "1.2rem 1.5rem",
//                                   textAlign: "left",
//                                   fontSize: "0.8rem",
//                                   color: "#64748b",
//                                   fontWeight: "600",
//                                   textTransform: "uppercase",
//                                 }}
//                               >
//                                 NO
//                               </th>
//                               <th
//                                 style={{
//                                   padding: "1.2rem 1rem",
//                                   textAlign: "left",
//                                   fontSize: "0.8rem",
//                                   color: "#64748b",
//                                   fontWeight: "600",
//                                   textTransform: "uppercase",
//                                 }}
//                               >
//                                 TITLE
//                               </th>
//                               <th
//                                 style={{
//                                   padding: "1.2rem 1rem",
//                                   textAlign: "left",
//                                   fontSize: "0.8rem",
//                                   color: "#64748b",
//                                   fontWeight: "600",
//                                   textTransform: "uppercase",
//                                 }}
//                               >
//                                 AUTHOR
//                               </th>
//                               <th
//                                 style={{
//                                   padding: "1.2rem 1rem",
//                                   textAlign: "center",
//                                   fontSize: "0.8rem",
//                                   color: "#64748b",
//                                   fontWeight: "600",
//                                   textTransform: "uppercase",
//                                 }}
//                               >
//                                 DATE
//                               </th>
//                               <th
//                                 style={{
//                                   padding: "1.2rem 1rem",
//                                   textAlign: "center",
//                                   fontSize: "0.8rem",
//                                   color: "#64748b",
//                                   fontWeight: "600",
//                                   textTransform: "uppercase",
//                                 }}
//                               >
//                                 FILES
//                               </th>
//                               <th
//                                 style={{
//                                   padding: "1.2rem 1.5rem",
//                                   textAlign: "center",
//                                   fontSize: "0.8rem",
//                                   color: "#64748b",
//                                   fontWeight: "600",
//                                   textTransform: "uppercase",
//                                 }}
//                               >
//                                 ACTION
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {notices
//                               .filter(
//                                 (n) =>
//                                   n.status === "APPROVED" &&
//                                   n.target_audience !== "Student",
//                               )
//                               .map((notice, index) => (
//                                 <tr
//                                   key={notice._id}
//                                   onClick={() => {
//                                     openNotice(notice);
//                                     // console.log(notice);
//                                   }} // ← Add this
//                                   style={{
//                                     borderBottom: "1px solid #f8fafc",
//                                     cursor: "pointer",
//                                     transition: "background 0.2s",
//                                   }}
//                                   onMouseOver={(e) =>
//                                     (e.currentTarget.style.backgroundColor =
//                                       "#f8fafc")
//                                   }
//                                   onMouseOut={(e) =>
//                                     (e.currentTarget.style.backgroundColor = "")
//                                   }
//                                 >
//                                   <td
//                                     style={{
//                                       padding: "1.1rem 1.5rem",
//                                       color: "#64748b",
//                                       fontSize: "0.9rem",
//                                     }}
//                                   >
//                                     {index + 1}
//                                   </td>
//                                   <td
//                                     style={{
//                                       padding: "1.1rem 1rem",
//                                       fontWeight: "500",
//                                       color: "#1e293b",
//                                       fontSize: "0.95rem",
//                                     }}
//                                   >
//                                     {notice.title}
//                                   </td>
//                                   <td
//                                     style={{
//                                       padding: "1.1rem 1rem",
//                                       color: "#64748b",
//                                       fontSize: "0.9rem",
//                                     }}
//                                   >
//                                     {notice.author?.name || "Admin"}
//                                   </td>
//                                   <td
//                                     style={{
//                                       padding: "1.1rem 1rem",
//                                       textAlign: "center",
//                                       color: "#64748b",
//                                       fontSize: "0.85rem",
//                                     }}
//                                   >
//                                     {new Date(
//                                       notice.created_at,
//                                     ).toLocaleDateString()}
//                                   </td>
//                                   <td
//                                     style={{
//                                       padding: "1.1rem 1rem",
//                                       textAlign: "center",
//                                     }}
//                                   >
//                                     {notice.file_url ? (
//                                       <FaFilePdf color="#ef4444" size={20} />
//                                     ) : (
//                                       "—"
//                                     )}
//                                   </td>
//                                   <td
//                                     style={{
//                                       padding: "1.1rem 1.5rem",
//                                       textAlign: "center",
//                                     }}
//                                   >
//                                     <span
//                                       style={{
//                                         color: "#3b82f6",
//                                         fontWeight: "500",
//                                       }}
//                                     >
//                                       View
//                                     </span>
//                                   </td>
//                                 </tr>
//                               ))}
//                             {notices.filter((n) => n.status === "APPROVED")
//                               .length === 0 && (
//                               <tr>
//                                 <td
//                                   colSpan="6"
//                                   style={{
//                                     padding: "3rem",
//                                     textAlign: "center",
//                                     color: "#94a3b8",
//                                   }}
//                                 >
//                                   No notices found.
//                                 </td>
//                               </tr>
//                             )}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div style={s.outerCard}>
//                       <h2 style={s.sectionTitle}>📣 Post New Notice</h2>
//                       <form onSubmit={handleNoticeSubmit}>
//                         <div style={{ marginBottom: "1.25rem" }}>
//                           <input
//                             name="noticeTitle"
//                             placeholder="Notice Title (e.g. Holi Holiday)"
//                             style={s.input}
//                             required
//                           />
//                         </div>
//                         <div style={{ marginBottom: "1.25rem" }}>
//                           <textarea
//                             name="noticeContent"
//                             placeholder="Notice Details"
//                             rows="4"
//                             style={s.textarea}
//                             required
//                           ></textarea>
//                         </div>
//                         <div style={{ marginBottom: "1.25rem" }}>
//                           <label style={s.label}>
//                             Attach Document (PDF/Image - Optional)
//                           </label>
//                           <input
//                             name="noticeFile"
//                             type="file"
//                             accept=".pdf,.jpg,.png,.jpeg"
//                             style={{ fontSize: "0.9rem" }}
//                           />
//                         </div>
//                         <div style={{ marginBottom: "1.25rem" }}>
//                           <label style={s.label}>Select Audience</label>
//                           <select
//                             name="audience"
//                             style={s.input}
//                             value={noticeAudience}
//                             onChange={(e) => setNoticeAudience(e.target.value)}
//                           >
//                             <option value="Everyone">Everyone</option>
//                             <option value="Teacher">Teacher Only</option>
//                             <option value="Student">Student Only</option>
//                           </select>
//                         </div>
//                         <div
//                           style={{
//                             display: "flex",
//                             gap: "0.75rem",
//                             justifyContent: "center",
//                             flexWrap: "wrap",
//                           }}
//                         >
//                           <button
//                             type="submit"
//                             style={{ ...s.submitBtn, margin: 0 }}
//                             disabled={loading}
//                           >
//                             Send for Approval
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setShowNoticeForm(false)}
//                             style={{ ...s.declineBtn, padding: "0.85rem 2rem" }}
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       </form>
//                     </div>
//                     <div style={s.outerCard}>
//                       <h2 style={s.sectionTitle}>⏳ Pending Notice</h2>
//                       {notices.filter(
//                         (n) =>
//                           (n.status === "PENDING" ||
//                             n.status === "PENDING_APPROVAL") &&
//                           n.author?._id === user.id,
//                       ).length === 0 ? (
//                         <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
//                           No pending notices.
//                         </p>
//                       ) : (
//                         notices
//                           .filter(
//                             (n) =>
//                               (n.status === "PENDING" ||
//                                 n.status === "PENDING_APPROVAL") &&
//                               n.author?._id === user.id,
//                           )
//                           .map((item) => (
//                             <div key={item._id} style={s.noticeCard}>
//                               <div className="chairman-card-row">
//                                 <div style={{ flex: 1, minWidth: 0 }}>
//                                   <h4
//                                     style={{
//                                       fontSize: "1.05rem",
//                                       fontWeight: "700",
//                                       color: "#1e293b",
//                                       marginBottom: "0.25rem",
//                                     }}
//                                   >
//                                     {item.title}
//                                   </h4>
//                                   <p
//                                     style={{
//                                       color: "#475569",
//                                       fontSize: "0.9rem",
//                                       margin: "0 0 0.4rem",
//                                       lineHeight: "1.5",
//                                     }}
//                                   >
//                                     {item.content}
//                                   </p>
//                                   {item.file_url && (
//                                     <a
//                                       href={item.file_url}
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       style={s.attachBtn}
//                                     >
//                                       <FaPaperclip /> View Attached Document
//                                     </a>
//                                   )}
//                                 </div>
//                                 <button
//                                   onClick={() => {
//                                     if (
//                                       window.confirm("Delete this pending notice?")
//                                     ) {
//                                       axios
//                                         .delete(`/announcements/${item._id}`)
//                                         .then(() => fetchNotices());
//                                     }
//                                   }}
//                                   style={s.deleteBtn}
//                                 >
//                                   <FaTrash />
//                                 </button>
//                               </div>
//                             </div>
//                           ))
//                       )}
//                     </div>
//                   </>
//                 )}
//               </>
//   )
// }

// export default Notice

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
  // ─── Self-contained styles (no external `s` import dependency) ────────────
  const st = {
    outerCard: {
      background: "#ffffff",
      borderRadius: "16px",
      padding: "1.75rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
      marginBottom: "1.5rem",
    },
    sectionTitle: {
      fontSize: "1.3rem",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "1.25rem",
    },
    publishBtn: {
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "0.7rem 1.5rem",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "0.95rem",
    },
    submitBtn: {
      background: "#16a34a",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "0.85rem 2rem",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "0.95rem",
      margin: 0,
    },
    declineBtn: {
      background: "#f1f5f9",
      color: "#475569",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "0.85rem 2rem",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "0.95rem",
    },
    input: {
      width: "100%",
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontSize: "0.95rem",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    textarea: {
      width: "100%",
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontSize: "0.95rem",
      outline: "none",
      resize: "vertical",
      fontFamily: "inherit",
      boxSizing: "border-box",
    },
    label: {
      display: "block",
      fontWeight: "600",
      color: "#475569",
      marginBottom: "0.4rem",
      fontSize: "0.9rem",
    },
    noticeCard: {
      background: "#f8fafc",
      borderRadius: "12px",
      padding: "1.25rem 1.5rem",
      marginBottom: "1rem",
      border: "1px solid #e2e8f0",
    },
    attachBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.4rem",
      color: "#2563eb",
      textDecoration: "none",
      fontSize: "0.9rem",
      fontWeight: "500",
    },
    deleteBtn: {
      background: "#fef2f2",
      color: "#ef4444",
      border: "none",
      borderRadius: "8px",
      padding: "0.5rem 0.75rem",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
  };

  // ─── Filter helpers ────────────────────────────────────────────────────────
  // BUG FIX: original Notice.jsx checked notices.filter(...APPROVED).length === 0
  // against all APPROVED notices, not the narrowed display list — wrong empty state.
  // Fixed: derive approvedNotices first, then check its length.

  const approvedNotices =
    mode === "teacher"
      ? notices.filter(
          (n) => n.status === "APPROVED" && n.target_audience !== "Student",
        )
      : notices.filter(
          // Students see notices explicitly targeting them that are approved.
          // Added status === "APPROVED" guard (missing in original BatchDashboard).
          (n) =>
            n.status === "APPROVED" &&
            (n.type === "NOTICE" || n.type === "ANNOUNCEMENT") &&
            n.target_audience === "Student",
        );

  // Pending notices authored by the current teacher (only used in teacher mode)
  const pendingNotices = notices.filter(
    (n) =>
      (n.status === "PENDING" || n.status === "PENDING_APPROVAL") &&
      n.author?._id === user?.id,
  );

  // ─── File-type helpers (shared by both modes) ─────────────────────────────
  const fileType = (url) => {
    if (!url) return null;
    if (url.toLowerCase().endsWith(".pdf")) return "pdf";
    if (/\.(jpeg|jpg|gif|png|webp)$/i.test(url)) return "img";
    return "file";
  };

  const FileIcon = ({ url, size = 20 }) => {
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
    // ── Notice list view ────────────────────────────────────────────────────
    if (!showNoticeForm) {
      return (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <h2 style={{ ...st.sectionTitle, marginBottom: 0 }}>
              Latest Notices
            </h2>
            <button
              onClick={() => setShowNoticeForm(true)}
              style={st.publishBtn}
            >
              Create Notice
            </button>
          </div>

          <div
            style={{
              ...st.outerCard,
              padding: "0",
              overflow: "hidden",
              borderRadius: "12px",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "700px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid #e2e8f0",
                      background: "#f8fafc",
                    }}
                  >
                    {[
                      { label: "NO", align: "left", pad: "1.2rem 1.5rem" },
                      { label: "TITLE", align: "left", pad: "1.2rem 1rem" },
                      { label: "AUTHOR", align: "left", pad: "1.2rem 1rem" },
                      { label: "DATE", align: "center", pad: "1.2rem 1rem" },
                      { label: "FILES", align: "center", pad: "1.2rem 1rem" },
                      {
                        label: "ACTION",
                        align: "center",
                        pad: "1.2rem 1.5rem",
                      },
                    ].map(({ label, align, pad }) => (
                      <th
                        key={label}
                        style={{
                          padding: pad,
                          textAlign: align,
                          fontSize: "0.8rem",
                          color: "#64748b",
                          fontWeight: "600",
                          textTransform: "uppercase",
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* BUG FIX: was checking notices.filter(APPROVED).length === 0
                      which is the wrong list — now correctly checks approvedNotices */}
                  {approvedNotices.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          padding: "3rem",
                          textAlign: "center",
                          color: "#94a3b8",
                        }}
                      >
                        No notices found.
                      </td>
                    </tr>
                  ) : (
                    approvedNotices.map((notice, index) => (
                      <tr
                        key={notice._id}
                        onClick={() => openNotice(notice)}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f8fafc")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "")
                        }
                      >
                        <td
                          style={{
                            padding: "1.1rem 1.5rem",
                            color: "#64748b",
                            fontSize: "0.9rem",
                          }}
                        >
                          {index + 1}
                        </td>
                        <td
                          style={{
                            padding: "1.1rem 1rem",
                            fontWeight: "500",
                            color: "#1e293b",
                            fontSize: "0.95rem",
                          }}
                        >
                          {notice.title}
                        </td>
                        <td
                          style={{
                            padding: "1.1rem 1rem",
                            color: "#64748b",
                            fontSize: "0.9rem",
                          }}
                        >
                          {notice.author?.name || "Admin"}
                        </td>
                        <td
                          style={{
                            padding: "1.1rem 1rem",
                            textAlign: "center",
                            color: "#64748b",
                            fontSize: "0.85rem",
                          }}
                        >
                          {new Date(notice.created_at).toLocaleDateString()}
                        </td>
                        <td
                          style={{
                            padding: "1.1rem 1rem",
                            textAlign: "center",
                          }}
                        >
                          {notice.file_url ? (
                            // BUG FIX: original had bare <FaFilePdf /> here with no
                            // import. Now using FileIcon helper + stopPropagation so
                            // clicking file link doesn't also trigger openNotice.
                            <a
                              href={notice.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                textDecoration: "none",
                                fontSize: "0.82rem",
                                color: "#475569",
                              }}
                            >
                              <FileIcon url={notice.file_url} />
                              <span>{fileLabel(notice.file_url)}</span>
                            </a>
                          ) : (
                            <span style={{ color: "#cbd5e1" }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "1.1rem 1.5rem",
                            textAlign: "center",
                          }}
                        >
                          <span
                            style={{
                              background: "#eff6ff",
                              color: "#2563eb",
                              padding: "0.3rem 0.9rem",
                              borderRadius: "20px",
                              fontSize: "0.82rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
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
            <div style={{ marginBottom: "1.25rem" }}>
              <input
                name="noticeTitle"
                placeholder="Notice Title (e.g. Holi Holiday)"
                style={st.input}
                required
              />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <textarea
                name="noticeContent"
                placeholder="Notice Details"
                rows="4"
                style={st.textarea}
                required
              />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={st.label}>
                Attach Document (PDF/Image - Optional)
              </label>
              <input
                name="noticeFile"
                type="file"
                accept=".pdf,.jpg,.png,.jpeg"
                style={{ fontSize: "0.9rem" }}
              />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={st.label}>Select Audience</label>
              <select
                name="audience"
                style={st.input}
                value={noticeAudience}
                onChange={(e) => setNoticeAudience(e.target.value)}
              >
                <option value="Everyone">Everyone</option>
                <option value="Teacher">Teacher Only</option>
                <option value="Student">Student Only</option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button type="submit" style={st.submitBtn} disabled={loading}>
                {loading ? "Sending…" : "Send for Approval"}
              </button>
              <button
                type="button"
                onClick={() => setShowNoticeForm(false)}
                style={st.declineBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div style={st.outerCard}>
          <h2 style={st.sectionTitle}>⏳ Pending Notices</h2>
          {pendingNotices.length === 0 ? (
            <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
              No pending notices.
            </p>
          ) : (
            pendingNotices.map((item) => (
              <div key={item._id} style={st.noticeCard}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: "700",
                        color: "#1e293b",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {item.title}
                    </h4>
                    <p
                      style={{
                        color: "#475569",
                        fontSize: "0.9rem",
                        margin: "0 0 0.4rem",
                        lineHeight: "1.5",
                      }}
                    >
                      {item.content}
                    </p>
                    {item.file_url && (
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={st.attachBtn}
                      >
                        {/* BUG FIX: FaPaperclip was used but not imported in original */}
                        <FaPaperclip /> View Attached Document
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this pending notice?")) {
                        axios
                          .delete(`/announcements/${item._id}`)
                          .then(() => fetchNotices())
                          .catch((err) => console.error("Delete failed:", err));
                      }
                    }}
                    style={st.deleteBtn}
                    title="Delete notice"
                  >
                    {/* BUG FIX: FaTrash was used but not imported in original */}
                    <FaTrash />
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
        <p
          style={{
            color: "var(--text-dim, #64748b)",
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
          No new notices.
        </p>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: "50px", textAlign: "center" }}>No</th>
                <th>Title</th>
                <th style={{ width: "80px", textAlign: "center" }}>Files</th>
                <th style={{ width: "120px" }}>Date</th>
                <th style={{ width: "100px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedNotices.map((ann, index) => (
                <tr key={ann._id} style={{ cursor: "pointer" }} onClick={() => openNotice(ann)}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td
                    style={{
                      fontWeight: "500",
                      color: "var(--text-main)",
                    }}
                  >
                    <FaBullhorn
                      style={{ marginRight: "0.5rem", color: "#f97316" }}
                    />
                    {ann.title}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {ann.file_url ? (
                      // BUG FIX: original BatchDashboard had no stopPropagation on
                      // file links, so clicking the icon also triggered openNotice.
                      <a
                        href={ann.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-icon"
                        title="Download File"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileIcon url={ann.file_url} />
                        <span>{fileLabel(ann.file_url)}</span>
                      </a>
                    ) : (
                      <span style={{ color: "#cbd5e1" }}>-</span>
                    )}
                  </td>
                  <td>{new Date(ann.created_at).toLocaleDateString()}</td>
                  <td
                    style={{
                      padding: "1.1rem 1.5rem",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        background: "#eff6ff",
                        color: "#2563eb",
                        padding: "0.3rem 0.9rem",
                        borderRadius: "20px",
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
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
