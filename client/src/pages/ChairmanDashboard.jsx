import React, { useState, useEffect, useContext } from "react";
import axios from "../utils/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { Loader, Toast, ConfirmModal } from "../components/UI";
import { Layout } from "../components/Layout";
import {
  FaTrash,
  FaCheck,
  FaTimes,
  FaPaperclip,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const ChairmanDashboard = () => {
  const { user, loadUser, loading: authLoading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notices");

  // Data State
  const [notices, setNotices] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // Derived state
  const [pendingNotices, setPendingNotices] = useState([]);
  const [publishedNotices, setPublishedNotices] = useState([]);
  const [pendingRoutines, setPendingRoutines] = useState([]);
  const [publishedRoutines, setPublishedRoutines] = useState([]);

  // UI State
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDanger: false,
  });
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
  }, [activeTab]);

  const fetchContent = async () => {
    try {
      const res = await axios.get("/announcements");
      const allItems = res.data;
      const allNotices = allItems.filter((i) => i.type === "NOTICE");
      setNotices(allNotices);
      setPendingNotices(
        allNotices.filter(
          (n) => n.status === "PENDING" || n.status === "PENDING_APPROVAL",
        ),
      );
      setPublishedNotices(
        allNotices.filter((n) => n.status === "APPROVED" && !n.target_batch),
      );
      const allRoutines = allItems.filter((i) => i.type === "ROUTINE");
      setRoutines(allRoutines);
      setPendingRoutines(
        allRoutines.filter(
          (r) => r.status === "PENDING" || r.status === "PENDING_APPROVAL",
        ),
      );
      setPublishedRoutines(allRoutines.filter((r) => r.status === "APPROVED"));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await axios.get("/feedback");
      setFeedback(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id, status, type, feedback = "") => {
    try {
      await axios.put(`/announcements/${id}/status`, { status, feedback });
      showToast(
        `${type} ${status === "APPROVED" ? "Published" : "Declined"}`,
        "success",
      );
      fetchContent();
    } catch (err) {
      console.error(err);
      showToast("Action failed", "error");
    }
  };

  const deleteItem = (id, endpoint = "announcements") => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Item?",
      message: "Are you sure you want to delete this item?",
      isDanger: true,
      onConfirm: async () => {
        try {
          await axios.delete(`/${endpoint}/${id}`);
          showToast("Deleted successfully", "success");
          if (endpoint === "announcements") fetchContent();
          else fetchFeedback();
        } catch (err) {
          showToast("Delete failed", "error");
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (authLoading) return <Loader />;
  if (!user || user.role !== "CHAIRMAN") return null;

  /* ─── Shared Inline Styles ─── */
  const styles = {
    wrapper: {
      maxWidth: "900px",
      margin: "0 auto",
      padding: "1rem 1rem 4rem",
    },
    outerCard: {
      background: "#fff",
      borderRadius: "18px",
      border: "1px solid #ffe0cc",
      padding: "2rem 2rem 2.5rem",
      marginBottom: "2rem",
    },
    sectionTitle: {
      fontFamily: "'Georgia', serif",
      fontStyle: "italic",
      fontSize: "1.35rem",
      color: "#ea580c",
      fontWeight: "600",
      marginBottom: "1.5rem",
    },
    noticeCard: {
      background: "#fff",
      borderRadius: "14px",
      border: "1px solid #f1f5f9",
      padding: "1.25rem 1.5rem",
      marginBottom: "1.25rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    },
    badge: (type) => ({
      display: "inline-block",
      fontSize: "0.7rem",
      padding: "0.2rem 0.7rem",
      borderRadius: "20px",
      fontWeight: "600",
      border: "1px solid",
      background: type === "everyone" ? "#fff7ed" : "#f0fdf4",
      color: type === "everyone" ? "#ea580c" : "#16a34a",
      borderColor: type === "everyone" ? "#fed7aa" : "#bbf7d0",
    }),
    attachBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 1.25rem",
      background: "linear-gradient(135deg, #fef3c7 0%, #ffedd5 100%)",
      color: "#b45309",
      borderRadius: "8px",
      textDecoration: "none",
      fontSize: "0.85rem",
      fontWeight: "600",
      border: "1px solid #fcd34d",
      marginTop: "0.75rem",
    },
    publishBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.4rem",
      padding: "0.45rem 1.2rem",
      background: "#ea580c",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      fontSize: "0.85rem",
      cursor: "pointer",
    },
    declineBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.4rem",
      padding: "0.45rem 1.2rem",
      background: "#fff",
      color: "#1e293b",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontWeight: "500",
      fontSize: "0.85rem",
      cursor: "pointer",
    },
    deleteBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "32px",
      height: "32px",
      background: "transparent",
      color: "#ef4444",
      border: "none",
      borderRadius: "50%",
      cursor: "pointer",
      fontSize: "0.9rem",
    },
    readMoreBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.4rem",
      padding: "0.45rem 1.2rem",
      background: "#ea580c",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      fontSize: "0.85rem",
      cursor: "pointer",
    },
    feedbackToggleBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 1.5rem",
      background: "linear-gradient(135deg, #fef3c7 0%, #ffedd5 100%)",
      color: "#b45309",
      border: "1px solid #fcd34d",
      borderRadius: "8px",
      fontWeight: "600",
      fontSize: "0.85rem",
      cursor: "pointer",
      margin: "0.75rem 0",
    },
    profileCard: {
      background: "#f8fafc",
      padding: "1.5rem",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
    },
    profileLabel: {
      display: "block",
      fontSize: "0.8rem",
      color: "#94a3b8",
      marginBottom: "0.4rem",
      fontWeight: "500",
    },
    profileValue: {
      fontWeight: "700",
      color: "#1e293b",
      fontSize: "1rem",
    },
    editProfileBtn: {
      padding: "0.5rem 1.25rem",
      background: "#fff",
      color: "#1e293b",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontWeight: "500",
      fontSize: "0.85rem",
      cursor: "pointer",
    },
  };

  return (
    <Layout>
      <div style={styles.wrapper}>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
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
            {/* Pending Notices */}
            <div style={styles.outerCard}>
              <h2 style={styles.sectionTitle}>
                Pending Notices
                {pendingNotices.length > 0 && (
                  <span style={{ color: "#ef4444", fontSize: "0.9rem" }}>
                    ●
                  </span>
                )}
              </h2>

              {pendingNotices.length === 0 ? (
                <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                  No pending notices.
                </p>
              ) : (
                pendingNotices.map((item) => (
                  <div key={item._id} style={styles.noticeCard}>
                    <div className="chairman-card-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "0.4rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: "700",
                              color: "#1e293b",
                              margin: 0,
                            }}
                          >
                            {item.title}
                          </h4>
                          <span
                            style={styles.badge(
                              item.target_audience ? "audience" : "global",
                            )}
                          >
                            {item.target_audience
                              ? item.target_audience
                              : "Everyone"}
                          </span>
                        </div>
                        <p
                          style={{
                            color: "#475569",
                            margin: "0 0 0.4rem",
                            fontSize: "0.9rem",
                            lineHeight: "1.5",
                          }}
                        >
                          {item.content}
                        </p>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                          by: {item.author?.full_name} on{" "}
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        {item.file_url && (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.attachBtn}
                          >
                            <FaPaperclip /> View Attached Document
                          </a>
                        )}
                      </div>
                      <div className="chairman-action-btns">
                        <button
                          onClick={() =>
                            handleStatusUpdate(item._id, "APPROVED", "Notice")
                          }
                          style={styles.publishBtn}
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => {
                            const fb = prompt("Reason for rejection?");
                            if (fb !== null)
                              handleStatusUpdate(
                                item._id,
                                "REJECTED",
                                "Notice",
                                fb,
                              );
                          }}
                          style={styles.declineBtn}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Published Notices */}
            <div style={styles.outerCard}>
              <h2 style={styles.sectionTitle}>Published Notices</h2>
              {publishedNotices.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No published global notices.</p>
              ) : (
                publishedNotices.map((item) => (
                  <div key={item._id} style={styles.noticeCard}>
                    <div className="chairman-card-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: "700",
                            color: "#1e293b",
                            marginBottom: "0.3rem",
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
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                          To Everyone
                        </div>
                        {item.file_url && (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.attachBtn}
                          >
                            <FaPaperclip /> View Attached Document
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => deleteItem(item._id)}
                        style={styles.deleteBtn}
                      >
                        <FaTrash />
                      </button>
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
            {/* Pending Routines */}
            <div style={styles.outerCard}>
              <h2 style={styles.sectionTitle}>
                Pending Routine
                {pendingRoutines.length > 0 && (
                  <span style={{ color: "#ef4444", fontSize: "0.9rem" }}>
                    ●
                  </span>
                )}
              </h2>

              {pendingRoutines.length === 0 ? (
                <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                  No pending routines.
                </p>
              ) : (
                pendingRoutines.map((item) => (
                  <div key={item._id} style={styles.noticeCard}>
                    <div className="chairman-card-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: "700",
                            color: "#1e293b",
                            margin: "0 0 0.3rem",
                          }}
                        >
                          {item.title}
                        </h4>
                        <p
                          style={{
                            color: "#475569",
                            fontSize: "0.9rem",
                            margin: "0 0 0.4rem",
                          }}
                        >
                          {item.content}
                        </p>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#94a3b8",
                            marginBottom: "0.5rem",
                          }}
                        >
                          by: {item.author?.full_name} on{" "}
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        {item.file_url && (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.attachBtn}
                          >
                            <FaPaperclip /> View Attached Document
                          </a>
                        )}

                        {/* Feedback from Faculty toggle */}
                        {item.routine_feedbacks &&
                          item.routine_feedbacks.length > 0 && (
                            <>
                              <button
                                onClick={() =>
                                  setExpandedRoutineFeedback((prev) => ({
                                    ...prev,
                                    [item._id]: !prev[item._id],
                                  }))
                                }
                                style={styles.feedbackToggleBtn}
                              >
                                Feedback from Faculty{" "}
                                {expandedRoutineFeedback[item._id] ? (
                                  <FaChevronUp />
                                ) : (
                                  <FaChevronDown />
                                )}
                              </button>
                              {expandedRoutineFeedback[item._id] && (
                                <div
                                  style={{
                                    marginTop: "0.5rem",
                                    padding: "1rem",
                                    background: "#f8fafc",
                                    borderRadius: "10px",
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  {item.routine_feedbacks.map((fb, idx) => (
                                    <div
                                      key={idx}
                                      style={{
                                        marginBottom:
                                          idx <
                                          item.routine_feedbacks.length - 1
                                            ? "1rem"
                                            : 0,
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontWeight: "600",
                                          color: "#1e293b",
                                          fontSize: "0.9rem",
                                        }}
                                      >
                                        {fb.from_user?.full_name || "Faculty"}
                                      </div>
                                      <p
                                        style={{
                                          color: "#475569",
                                          fontSize: "0.85rem",
                                          margin: "0.25rem 0 0",
                                          lineHeight: "1.5",
                                        }}
                                      >
                                        {fb.message}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                      </div>
                      <div className="chairman-action-btns">
                        <button
                          onClick={() =>
                            handleStatusUpdate(item._id, "APPROVED", "Routine")
                          }
                          style={styles.publishBtn}
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => {
                            const fb = prompt("Reason for rejection?");
                            if (fb !== null)
                              handleStatusUpdate(
                                item._id,
                                "REJECTED",
                                "Routine",
                                fb,
                              );
                          }}
                          style={styles.declineBtn}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Published Routines */}
            <div style={styles.outerCard}>
              <h2 style={styles.sectionTitle}>Published Routine</h2>
              {publishedRoutines.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No published routines.</p>
              ) : (
                publishedRoutines.map((item) => (
                  <div key={item._id} style={styles.noticeCard}>
                    <div className="chairman-card-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: "700",
                            color: "#1e293b",
                            marginBottom: "0.3rem",
                          }}
                        >
                          {item.title}
                        </h4>
                        {item.file_url && (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.attachBtn}
                          >
                            <FaPaperclip /> View Attached Document
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => deleteItem(item._id)}
                        style={styles.deleteBtn}
                      >
                        <FaTrash />
                      </button>
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
            <h2
              style={{
                ...styles.sectionTitle,
                textAlign: "center",
                fontSize: "1.5rem",
              }}
            >
              Feedbacks
            </h2>
            {feedback.length === 0 ? (
              <p style={{ textAlign: "center", color: "#94a3b8" }}>
                No registered feedback.
              </p>
            ) : (
              feedback.map((item) => (
                <div key={item._id} style={styles.noticeCard}>
                  <div className="chairman-card-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: "700",
                          color: "#1e293b",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {item.is_anonymous
                          ? "Anonymous"
                          : item.from_batch?.batch_name || "Unknown Batch"}
                      </h4>
                      <p
                        style={{
                          color: "#475569",
                          fontSize: "0.9rem",
                          margin: 0,
                          lineHeight: "1.5",
                        }}
                      >
                        {expandedFeedback[item._id]
                          ? item.message_content
                          : item.message_content?.slice(0, 120) +
                            (item.message_content?.length > 120 ? "..." : "")}
                      </p>
                      {expandedFeedback[item._id] && (
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#94a3b8",
                            marginTop: "0.5rem",
                          }}
                        >
                          {new Date(item.sent_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() =>
                          setExpandedFeedback((prev) => ({
                            ...prev,
                            [item._id]: !prev[item._id],
                          }))
                        }
                        style={styles.readMoreBtn}
                      >
                        {expandedFeedback[item._id] ? "Close" : "Read More"}
                      </button>
                      <button
                        onClick={() => deleteItem(item._id, "feedback")}
                        style={styles.deleteBtn}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═══════ PROFILE TAB ═══════ */}
        {activeTab === "profile" && (
          <div style={styles.outerCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "2rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <h2 style={{ ...styles.sectionTitle, marginBottom: "0.25rem" }}>
                  Chairman Profile
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
                  Manage your account details.
                </p>
              </div>
              <button style={styles.editProfileBtn}>Edit Profile</button>
            </div>

            <div className="chairman-profile-grid">
              <div style={styles.profileCard}>
                <label style={styles.profileLabel}>Full Name</label>
                <div style={styles.profileValue}>{user.name}</div>
              </div>
              <div style={styles.profileCard}>
                <label style={styles.profileLabel}>Email Address</label>
                <div style={styles.profileValue}>{user.email}</div>
              </div>
              <div style={styles.profileCard}>
                <label style={styles.profileLabel}>Role</label>
                <div style={styles.profileValue}>CHAIRMAN</div>
              </div>
              <div style={styles.profileCard}>
                <label style={styles.profileLabel}>Department</label>
                <div style={styles.profileValue}>
                  {user.department || "ICE"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChairmanDashboard;
