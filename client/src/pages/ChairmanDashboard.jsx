import React, { useState, useEffect, useContext } from "react";
import axios from "../utils/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { Loader, Toast, ConfirmModal } from "../components/UI";
import { Layout } from "../components/Layout";
import { FaTrash, FaCheck, FaTimes, FaPaperclip, FaChevronDown, FaChevronUp, FaEye, FaSync } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

// ── Small helper components ──
const Badge = ({ text, bg, color }) => (
  <span style={{
    display: "inline-block", fontSize: "0.7rem", padding: "0.2rem 0.7rem",
    borderRadius: "20px", fontWeight: "600", background: bg, color,
  }}>{text}</span>
);

const ClassCard = ({ entry, isCancelled }) => (
  <div style={{
    background: "white", borderRadius: "10px", padding: "0.9rem 1.1rem",
    marginBottom: "0.6rem",
    borderLeft: `4px solid ${isCancelled ? "#ef4444" : "#3b82f6"}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "flex-start",
  }}>
    <div style={{ flex: "1 1 180px" }}>
      <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#1e293b" }}>
        {entry.course || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No course set</span>}
        {isCancelled && (
          <span style={{ marginLeft: "0.5rem", color: "#ef4444", fontWeight: "800", fontSize: "0.78rem" }}>
            CANCELLED
          </span>
        )}
      </div>
      {entry.reason && (
        <div style={{ fontSize: "0.78rem", color: "#b91c1c", marginTop: "0.15rem" }}>
          Reason: {entry.reason}
        </div>
      )}
    </div>
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Badge text={entry.timeSlot} bg="#eff6ff" color="#1d4ed8" />
      {entry.year && <Badge text={`${entry.year} Year`} bg="#faf5ff" color="#7c3aed" />}
      <Badge text={entry.semester} bg="#f0fdf4" color="#16a34a" />
      {entry.teacher && <Badge text={`[${entry.teacher}]`} bg="#fef3c7" color="#b45309" />}
      {entry.room && <Badge text={`Room ${entry.room}`} bg="#f8fafc" color="#475569" />}
    </div>
    <div style={{ fontSize: "0.72rem", color: "#94a3b8", width: "100%" }}>
      From routine: <em>{entry.routineTitle}</em> by {entry.routineAuthor}
    </div>
  </div>
);

const ChairmanDashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notices");

  // Data State
  const [notices, setNotices] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [supervision, setSupervision] = useState(null); // { today, classes, cancelled, totalRoutines }
  const [supervisionLoading, setSupervisionLoading] = useState(false);
  const [supervisionSubTab, setSupervisionSubTab] = useState("classes"); // "classes" | "cancelled"

  // Derived state
  const [pendingNotices, setPendingNotices] = useState([]);
  const [publishedNotices, setPublishedNotices] = useState([]);
  const [pendingRoutines, setPendingRoutines] = useState([]);
  const [publishedRoutines, setPublishedRoutines] = useState([]);

  // UI State
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null, isDanger: false });
  const [loading, setLoading] = useState(false);
  const [expandedFeedback, setExpandedFeedback] = useState({});
  const [expandedRoutineFeedback, setExpandedRoutineFeedback] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
    else navigate("?tab=notices", { replace: true });
  }, [location.search, navigate]);

  useEffect(() => {
    if (activeTab === "notices" || activeTab === "routine") fetchContent();
    if (activeTab === "feedback") fetchFeedback();
    if (activeTab === "supervision") fetchSupervision();
  }, [activeTab]);

  const fetchContent = async () => {
    try {
      const res = await axios.get("/announcements");
      const allItems = res.data;
      const allNotices = allItems.filter((i) => i.type === "NOTICE");
      setNotices(allNotices);
      setPendingNotices(allNotices.filter((n) => n.status === "PENDING" || n.status === "PENDING_APPROVAL"));
      setPublishedNotices(allNotices.filter((n) => n.status === "APPROVED" && !n.target_batch));
      const allRoutines = allItems.filter((i) => i.type === "ROUTINE");
      setRoutines(allRoutines);
      setPendingRoutines(allRoutines.filter((r) => r.status === "PENDING" || r.status === "PENDING_APPROVAL"));
      setPublishedRoutines(allRoutines.filter((r) => r.status === "APPROVED"));
    } catch (err) { console.error(err); }
  };

  const fetchFeedback = async () => {
    try {
      const res = await axios.get("/feedback");
      setFeedback(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSupervision = async () => {
    setSupervisionLoading(true);
    try {
      const res = await axios.get("/announcements/supervision/today");
      setSupervision(res.data);
    } catch (err) {
      console.error(err);
      showToast("Could not load supervision data", "error");
    } finally {
      setSupervisionLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, type, feedback = "") => {
    try {
      await axios.put(`/announcements/${id}/status`, { status, feedback });
      showToast(`${type} ${status === "APPROVED" ? "Published" : "Declined"}`, "success");
      fetchContent();
    } catch (err) {
      console.error(err);
      showToast("Action failed", "error");
    }
  };

  const deleteItem = (id, endpoint = "announcements") => {
    setConfirmModal({
      isOpen: true, title: "Delete Item?", message: "Are you sure you want to delete this item?", isDanger: true,
      onConfirm: async () => {
        try {
          await axios.delete(`/${endpoint}/${id}`);
          showToast("Deleted successfully", "success");
          if (endpoint === "announcements") fetchContent();
          else fetchFeedback();
        } catch { showToast("Delete failed", "error"); }
        finally { setConfirmModal((prev) => ({ ...prev, isOpen: false })); }
      },
    });
  };

  if (authLoading) return <Loader />;
  if (!user || user.role !== "CHAIRMAN") return null;

  /* ─── Compact Styles ─── */
  const styles = {
    wrapper: { maxWidth: "1100px", margin: "0 auto", padding: "0.75rem 0.75rem 3rem" },
    outerCard: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1rem 1.25rem 1.25rem", marginBottom: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
    sectionTitle: { fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: "0.95rem", color: "#ea580c", fontWeight: "600", marginBottom: "0.75rem" },
    noticeCard: { background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "0.85rem 1rem", marginBottom: "0.5rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" },
    badge: (type) => ({ display: "inline-block", fontSize: "0.68rem", padding: "0.15rem 0.5rem", borderRadius: "999px", fontWeight: "600", border: "1px solid", background: type === "everyone" ? "#fff7ed" : "#f0fdf4", color: type === "everyone" ? "#ea580c" : "#16a34a", borderColor: type === "everyone" ? "#fed7aa" : "#bbf7d0" }),
    attachBtn: { display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.85rem", background: "linear-gradient(135deg, #fef3c7 0%, #ffedd5 100%)", color: "#b45309", borderRadius: "6px", textDecoration: "none", fontSize: "0.78rem", fontWeight: "600", border: "1px solid #fcd34d", marginTop: "0.5rem" },
    publishBtn: { display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0 0.85rem", background: "#ea580c", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "0.78rem", cursor: "pointer", height: "32px", transition: "all 0.15s" },
    declineBtn: { display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0 0.85rem", background: "#fff", color: "#1e293b", border: "1px solid #cbd5e1", borderRadius: "6px", fontWeight: "500", fontSize: "0.78rem", cursor: "pointer", height: "32px", transition: "all 0.15s" },
    deleteBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", background: "transparent", color: "#ef4444", border: "none", borderRadius: "50%", cursor: "pointer", fontSize: "0.78rem" },
    readMoreBtn: { display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0 0.85rem", background: "#ea580c", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "0.78rem", cursor: "pointer", height: "32px" },
    feedbackToggleBtn: { display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0 1rem", background: "linear-gradient(135deg, #fef3c7 0%, #ffedd5 100%)", color: "#b45309", border: "1px solid #fcd34d", borderRadius: "6px", fontWeight: "600", fontSize: "0.78rem", cursor: "pointer", margin: "0.5rem 0", height: "32px" },
    profileCard: { background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" },
    profileLabel: { display: "block", fontSize: "0.7rem", color: "#94a3b8", marginBottom: "0.25rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" },
    profileValue: { fontWeight: "700", color: "#1e293b", fontSize: "0.95rem" },
  };

  const subTabStyle = (active) => ({
    padding: "0 1rem", borderRadius: "8px", height: "32px",
    fontWeight: "600", fontSize: "0.78rem", cursor: "pointer", border: "none",
    display: "inline-flex", alignItems: "center", gap: "0.3rem",
    background: active ? "#0f172a" : "#f1f5f9",
    color: active ? "white" : "#64748b",
    transition: "all 0.15s",
  });

  return (
    <Layout>
      <div style={styles.wrapper}>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          isDanger={confirmModal.isDanger}
        />

        {/* ═══════ NOTICES TAB ═══════ */}
        {activeTab === "notices" && (
          <>
            <div style={styles.outerCard}>
              <h2 style={styles.sectionTitle}>
                Pending Notices
                {pendingNotices.length > 0 && <span style={{ color: "#ef4444", fontSize: "0.9rem" }}>●</span>}
              </h2>
              {pendingNotices.length === 0 ? (
                <p style={{ color: "#94a3b8", fontStyle: "italic" }}>No pending notices.</p>
              ) : (
                pendingNotices.map((item) => (
                  <div key={item._id} style={styles.noticeCard}>
                    <div className="chairman-card-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                          <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>{item.title}</h4>
                          <span style={styles.badge(item.target_audience ? "audience" : "global")}>
                            {item.target_audience || "Everyone"}
                          </span>
                        </div>
                        <p style={{ color: "#475569", margin: "0 0 0.4rem", fontSize: "0.9rem", lineHeight: "1.5" }}>{item.content}</p>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                          by: {item.author?.full_name} on {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        {item.file_url && <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={styles.attachBtn}><FaPaperclip /> View Attached Document</a>}
                      </div>
                      <div className="chairman-action-btns">
                        <button onClick={() => handleStatusUpdate(item._id, "APPROVED", "Notice")} style={styles.publishBtn}>Publish</button>
                        <button onClick={() => { const fb = prompt("Reason for rejection?"); if (fb !== null) handleStatusUpdate(item._id, "REJECTED", "Notice", fb); }} style={styles.declineBtn}>Decline</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={styles.outerCard}>
              <h2 style={styles.sectionTitle}>Published Notices</h2>
              {publishedNotices.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No published global notices.</p>
              ) : (
                publishedNotices.map((item) => (
                  <div key={item._id} style={styles.noticeCard}>
                    <div className="chairman-card-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", marginBottom: "0.3rem" }}>{item.title}</h4>
                        <p style={{ color: "#475569", fontSize: "0.9rem", margin: "0 0 0.4rem", lineHeight: "1.5" }}>{item.content}</p>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>To Everyone</div>
                        {item.file_url && <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={styles.attachBtn}><FaPaperclip /> View Attached Document</a>}
                      </div>
                      <button onClick={() => deleteItem(item._id)} style={styles.deleteBtn}><FaTrash /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ═══════ ROUTINE TAB ═══════ */}
        {activeTab === "routine" && (
          <>
            <div style={styles.outerCard}>
              <h2 style={styles.sectionTitle}>
                Pending Routine
                {pendingRoutines.length > 0 && <span style={{ color: "#ef4444", fontSize: "0.9rem" }}>●</span>}
              </h2>
              {pendingRoutines.length === 0 ? (
                <p style={{ color: "#94a3b8", fontStyle: "italic" }}>No pending routines.</p>
              ) : (
                pendingRoutines.map((item) => (
                  <div key={item._id} style={styles.noticeCard}>
                    <div className="chairman-card-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: "0 0 0.3rem" }}>{item.title}</h4>
                        <p style={{ color: "#475569", fontSize: "0.9rem", margin: "0 0 0.4rem" }}>{item.content}</p>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                          by: {item.author?.full_name} on {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        {item.file_url && <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={styles.attachBtn}><FaPaperclip /> View PDF Routine</a>}
                      </div>
                      <div className="chairman-action-btns">
                        <button onClick={() => handleStatusUpdate(item._id, "APPROVED", "Routine")} style={styles.publishBtn}>Publish</button>
                        <button onClick={() => { const fb = prompt("Reason for rejection?"); if (fb !== null) handleStatusUpdate(item._id, "REJECTED", "Routine", fb); }} style={styles.declineBtn}>Decline</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={styles.outerCard}>
              <h2 style={styles.sectionTitle}>Published Routine</h2>
              {publishedRoutines.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No published routines.</p>
              ) : (
                publishedRoutines.map((item) => (
                  <div key={item._id} style={styles.noticeCard}>
                    <div className="chairman-card-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", marginBottom: "0.3rem" }}>{item.title}</h4>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                          by: {item.author?.full_name} · {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        {item.file_url && <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={styles.attachBtn}><FaPaperclip /> View Attached Document</a>}
                      </div>
                      <button onClick={() => deleteItem(item._id)} style={styles.deleteBtn}><FaTrash /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ═══════ FEEDBACK TAB ═══════ */}
        {activeTab === "feedback" && (
          <div style={styles.outerCard}>
            <h2 style={{ ...styles.sectionTitle, textAlign: "center", fontSize: "1.5rem" }}>Feedbacks</h2>
            {feedback.length === 0 ? (
              <p style={{ textAlign: "center", color: "#94a3b8" }}>No registered feedback.</p>
            ) : (
              feedback.map((item) => (
                <div key={item._id} style={styles.noticeCard}>
                  <div className="chairman-card-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", marginBottom: "0.25rem" }}>
                        {item.is_anonymous ? "Anonymous" : item.from_batch?.batch_name || "Unknown Batch"}
                      </h4>
                      <p style={{ color: "#475569", fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>
                        {expandedFeedback[item._id]
                          ? item.message_content
                          : item.message_content?.slice(0, 120) + (item.message_content?.length > 120 ? "..." : "")}
                      </p>
                      {expandedFeedback[item._id] && (
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                          {new Date(item.sent_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button onClick={() => setExpandedFeedback((prev) => ({ ...prev, [item._id]: !prev[item._id] }))} style={styles.readMoreBtn}>
                        {expandedFeedback[item._id] ? "Close" : "Read More"}
                      </button>
                      <button onClick={() => deleteItem(item._id, "feedback")} style={styles.deleteBtn}><FaTrash /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═══════ SUPERVISION TAB ═══════ */}
        {activeTab === "supervision" && (
          <div style={styles.outerCard}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ ...styles.sectionTitle, marginBottom: "0.25rem" }}>
                  🔍 Supervision Panel
                </h2>
                {supervision && (
                  <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
                    Today is <strong>{supervision.today}</strong> · Based on{" "}
                    <strong>{supervision.totalRoutines}</strong> approved routine(s)
                  </p>
                )}
              </div>
              <button
                onClick={fetchSupervision}
                disabled={supervisionLoading}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.5rem 1.25rem", background: "#f1f5f9", color: "#475569",
                  border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer",
                  fontWeight: "600", fontSize: "0.85rem",
                }}
              >
                <FaSync style={{ animation: supervisionLoading ? "spin 1s linear infinite" : "none" }} />
                Refresh
              </button>
            </div>

            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <button onClick={() => setSupervisionSubTab("classes")} style={subTabStyle(supervisionSubTab === "classes")}>
                📚 Today's Classes
                {supervision && (
                  <span style={{ marginLeft: "0.4rem", background: "rgba(255,255,255,0.3)", padding: "0.1rem 0.4rem", borderRadius: "999px", fontSize: "0.7rem" }}>
                    {supervision.classes.length}
                  </span>
                )}
              </button>
              <button onClick={() => setSupervisionSubTab("cancelled")} style={subTabStyle(supervisionSubTab === "cancelled")}>
                🚫 Cancelled / Labs
                {supervision?.cancelled.length > 0 && (
                  <span style={{ marginLeft: "0.4rem", background: "#ef4444", color: "white", padding: "0.1rem 0.4rem", borderRadius: "999px", fontSize: "0.7rem" }}>
                    {supervision.cancelled.length}
                  </span>
                )}
              </button>
            </div>

            {supervisionLoading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                <Loader />
                <p style={{ marginTop: "1rem" }}>Loading today's schedule...</p>
              </div>
            ) : !supervision ? (
              <p style={{ color: "#94a3b8", textAlign: "center", fontStyle: "italic" }}>
                Click Refresh to load today's supervision data.
              </p>
            ) : supervisionSubTab === "classes" ? (
              <>
                {supervision.classes.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
                    <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                      No classes scheduled for {supervision.today}.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Group by time slot */}
                    {[...new Set(supervision.classes.map((c) => c.timeSlot))].map((slot) => {
                      const slotClasses = supervision.classes.filter((c) => c.timeSlot === slot);
                      return (
                        <div key={slot} style={{ marginBottom: "1.5rem" }}>
                          <div style={{
                            padding: "0.45rem 1rem", background: "#eff6ff",
                            borderRadius: "8px", fontWeight: "700", color: "#1d4ed8",
                            fontSize: "0.85rem", marginBottom: "0.6rem",
                            display: "inline-block",
                          }}>
                            🕐 {slot}
                          </div>
                          {slotClasses.map((entry, i) => (
                            <ClassCard key={i} entry={entry} isCancelled={false} />
                          ))}
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            ) : (
              /* Cancelled sub-tab */
              <>
                {supervision.cancelled.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✅</div>
                    <p style={{ color: "#16a34a", fontWeight: "600" }}>
                      No cancellations today!
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{
                      padding: "0.75rem 1rem", background: "#fff7ed", border: "1px solid #fed7aa",
                      borderRadius: "10px", marginBottom: "1rem", fontSize: "0.875rem", color: "#b45309",
                    }}>
                      ⚠️ <strong>{supervision.cancelled.length}</strong> class(es) cancelled today.
                    </div>
                    {supervision.cancelled.map((entry, i) => (
                      <ClassCard key={i} entry={entry} isCancelled={true} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════ PROFILE TAB ═══════ */}
        {activeTab === "profile" && (
          <div style={styles.outerCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ ...styles.sectionTitle, marginBottom: "0.25rem" }}>Chairman Profile</h2>
                <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>Manage your account details.</p>
              </div>
            </div>
            <div className="chairman-profile-grid">
              {[["Full Name", user.name], ["Email Address", user.email], ["Role", "CHAIRMAN"], ["Department", user.department || "ICE"]].map(([label, val]) => (
                <div key={label} style={styles.profileCard}>
                  <label style={styles.profileLabel}>{label}</label>
                  <div style={styles.profileValue}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChairmanDashboard;