import React, { useState, useEffect, useContext } from "react";
import axios from "../utils/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { Link, useSearchParams } from "react-router-dom";
import Notice from "../components/Notice";
import {
  FaFolder,
  FaPaperPlane,
  FaBell,
  FaBullhorn,
  FaFilePdf,
  FaImage,
  FaUser,
} from "react-icons/fa";

import { Layout } from "../components/Layout";
import { ConfirmModal } from "../components/UI";
import NoticeDetail from "../components/NoticeDetail";

const BatchDashboard = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "folders"; // folders(default), notices, feedback

  const [teachers, setTeachers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [myFeedback, setMyFeedback] = useState([]);
  const [sentMsg, setSentMsg] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDanger: false,
  });
  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

  const [selectedNotice, setSelectedNotice] = useState(null);

  const openNotice = (notice) => {
    setSelectedNotice(notice);
  };

  const closeNotice = () => {
    setSelectedNotice(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teachersRes = await axios.get(
          `/documents/batch/${user.id}/teachers`,
        );
        setTeachers(teachersRes.data);

        const annRes = await axios.get("/announcements");
        setAnnouncements(annRes.data);

        const feedRes = await axios.get("/feedback");
        setMyFeedback(feedRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user.id]);

  const sendFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/feedback", {
        message_content: feedbackMsg,
        is_anonymous: isAnonymous,
      });
      setSentMsg("Feedback Sent to Head Authority!");
      setFeedbackMsg("");
      setIsAnonymous(false);

      // Refresh feedback list
      const feedRes = await axios.get("/feedback");
      setMyFeedback(feedRes.data);

      setTimeout(() => setSentMsg(""), 3000);
    } catch (err) {
      setSentMsg("Failed to send");
    }
  };

  const deleteFeedback = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Feedback?",
      message: "Are you sure you want to delete this feedback message?",
      isDanger: true,
      onConfirm: async () => {
        try {
          await axios.delete(`/feedback/${id}`);
          const feedRes = await axios.get("/feedback");
          setMyFeedback(feedRes.data);
        } catch (err) {
          console.error(err);
        } finally {
          closeConfirmModal();
        }
      },
    });
  };

  return (
    <Layout>
      <div
        className="container"
        style={{ maxWidth: "1000px", padding: "2rem 1rem" }}
      >
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          isDanger={confirmModal.isDanger}
        />
        <div className="glass-panel fade-in" style={{ minHeight: "400px" }}>
          {activeTab === "profile" && (
            <div
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "20px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "1px solid #e2e8f0",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#eff6ff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem auto",
                    color: "#2563eb",
                  }}
                >
                  <FaUser size={32} />
                </div>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    color: "var(--text-main)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {user.name}
                </h2>
                <span
                  className="badge badge-primary"
                  style={{ padding: "0.4rem 1rem", fontSize: "1rem" }}
                >
                  Batch Profile
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <label
                    style={{
                      color: "var(--text-dim)",
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      marginBottom: "0.5rem",
                      display: "block",
                    }}
                  >
                    Batch Name
                  </label>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "600",
                      color: "var(--text-main)",
                    }}
                  >
                    {user.name}
                  </div>
                </div>
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <label
                    style={{
                      color: "var(--text-dim)",
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      marginBottom: "0.5rem",
                      display: "block",
                    }}
                  >
                    Account Type
                  </label>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "600",
                      color: "var(--text-main)",
                    }}
                  >
                    Student Access
                  </div>
                </div>
              </div>

              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-dim)",
                  fontSize: "0.9rem",
                }}
              >
                To update batch details, please contact the Chairman.
              </div>
            </div>
          )}

          {activeTab === "folders" && (
            <div>
              <p
                style={{
                  color: "var(--text-dim)",
                  marginBottom: "1.5rem",
                  fontSize: "0.9rem",
                }}
              >
                Browse resources by Teacher. Folders appear only when content is
                uploaded.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "1rem",
                }}
              >
                {teachers.length === 0 ? (
                  <p style={{ color: "var(--text-dim)" }}>
                    No resources found yet.
                  </p>
                ) : (
                  teachers.map((teacher) => (
                    <Link
                      key={teacher._id}
                      to={`/batch/teacher/${teacher._id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        className="interactive-card"
                        style={{
                          background: "#f8fafc",
                          padding: "1.5rem",
                          borderRadius: "16px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            background: "#fef3c7",
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1rem auto",
                          }}
                        >
                          <FaFolder size={28} color="#d97706" />
                        </div>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "0.95rem",
                            color: "var(--text-main)",
                          }}
                        >
                          {teacher.full_name}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
          {activeTab === "notices" && (
            <Notice
              mode="student"
              notices={announcements}
              openNotice={openNotice}
            />
          )}
          {activeTab === "updates" && (
            <div>
              <h3
                style={{
                  fontSize: "1.2rem",
                  color: "var(--text-main)",
                  marginBottom: "1.5rem",
                  fontWeight: "600",
                }}
              >
                Class Updates
              </h3>
              {announcements.filter((a) => a.type === "ANNOUNCEMENT").length ===
              0 ? (
                <p style={{ color: "var(--text-dim)", textAlign: "center" }}>
                  No class updates published yet.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "1.5rem" }}>
                  {announcements
                    .filter((a) => a.type === "ANNOUNCEMENT")
                    .map((update) => (
                      <div
                        key={update._id}
                        style={{
                          background: "white",
                          padding: "1.5rem",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "1rem",
                          }}
                        >
                          <div>
                            <h4
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: "700",
                                color: "#1e293b",
                                marginBottom: "0.5rem",
                              }}
                            >
                              {update.title}
                            </h4>
                            <p
                              style={{ color: "#475569", marginBottom: "1rem" }}
                            >
                              {update.content}
                            </p>
                            <div
                              style={{ fontSize: "0.85rem", color: "#94a3b8" }}
                            >
                              Posted on:{" "}
                              {new Date(
                                update.created_at,
                              ).toLocaleDateString()}
                            </div>
                            {update.author && update.author.full_name && (
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#64748b",
                                  marginTop: "0.25rem",
                                }}
                              >
                                By {update.author.full_name}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              alignItems: "center",
                            }}
                          >
                            {update.file_url && (
                              <a
                                href={update.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FaFilePdf /> View Attachment
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "routine" && (
            <div>
              <h3
                style={{
                  fontSize: "1.2rem",
                  color: "var(--text-main)",
                  marginBottom: "1.5rem",
                  fontWeight: "600",
                }}
              >
                Class Routines
              </h3>
              {announcements.filter((a) => a.type === "ROUTINE").length ===
              0 ? (
                <p style={{ color: "var(--text-dim)", textAlign: "center" }}>
                  No routines published yet.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "1.5rem" }}>
                  {announcements
                    .filter((a) => a.type === "ROUTINE")
                    .map((routine) => (
                      <div
                        key={routine._id}
                        style={{
                          background: "white",
                          padding: "1.5rem",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "1rem",
                          }}
                        >
                          <div>
                            <h4
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: "700",
                                color: "#1e293b",
                                marginBottom: "0.5rem",
                              }}
                            >
                              {routine.title}
                            </h4>
                            <p
                              style={{ color: "#475569", marginBottom: "1rem" }}
                            >
                              {routine.content}
                            </p>
                            <div
                              style={{ fontSize: "0.85rem", color: "#94a3b8" }}
                            >
                              Posted on:{" "}
                              {new Date(
                                routine.created_at,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              alignItems: "center",
                            }}
                          >
                            {routine.file_url && (
                              <a
                                href={routine.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FaFilePdf /> View Routine
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "feedback" && (
            <div style={{ maxWidth: "700px", margin: "0 auto", width: "100%" }}>
              <div
                className="feedback-card"
                style={{
                  background: "var(--bg-card)",
                  padding: "2rem",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-soft)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <h3
                  style={{
                    textAlign: "center",
                    marginBottom: "2rem",
                    fontSize: "1.5rem",
                    color: "var(--text-main)",
                  }}
                >
                  Contact Head Authority
                </h3>

                {sentMsg && (
                  <div
                    style={{
                      background: sentMsg.includes("Failed")
                        ? "#fef2f2"
                        : "#f0fdf4",
                      color: sentMsg.includes("Failed")
                        ? "var(--error)"
                        : "var(--success)",
                      padding: "1rem",
                      borderRadius: "var(--radius-md)",
                      marginBottom: "1.5rem",
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    {sentMsg}
                  </div>
                )}

                <form onSubmit={sendFeedback}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <textarea
                      rows="6"
                      placeholder="Write your message here... (e.g., Request for materials, Class scheduling issue)"
                      value={feedbackMsg}
                      onChange={(e) => setFeedbackMsg(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "1rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #cbd5e1",
                        resize: "vertical",
                        minHeight: "150px",
                        fontSize: "1rem",
                        fontFamily: "inherit",
                        outline: "none",
                        transition: "all 0.2s",
                        background: "var(--bg-main)",
                        color: "var(--text-main)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--primary)";
                        e.target.style.boxShadow =
                          "0 0 0 3px var(--primary-fade)";
                        e.target.style.background = "white";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#cbd5e1";
                        e.target.style.boxShadow = "none";
                        e.target.style.background = "#f8fafc";
                      }}
                    ></textarea>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                      }}
                      onClick={() => setIsAnonymous(!isAnonymous)}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "4px",
                          border: `2px solid ${isAnonymous ? "var(--primary)" : "#cbd5e1"}`,
                          background: isAnonymous ? "var(--primary)" : "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                        }}
                      >
                        {isAnonymous && (
                          <FaPaperPlane
                            size={10}
                            color="white"
                            style={{ transform: "rotate(0deg)" }}
                          />
                        )}
                        {/* Using PaperPlane icon specifically or Check/Tick */}
                      </div>
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          color: "var(--text-main)",
                          userSelect: "none",
                        }}
                      >
                        Send Anonymously
                      </span>
                    </div>

                    {/* You can add a character count or other info here if needed */}
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.75rem",
                      width: "100%",
                      fontSize: "1.1rem",
                      padding: "1rem",
                    }}
                  >
                    <FaPaperPlane /> Send Feedback
                  </button>
                </form>
              </div>

              <div style={{ marginTop: "3rem" }}>
                <h4
                  style={{
                    textAlign: "center",
                    marginBottom: "1.5rem",
                    color: "var(--text-dim)",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                  }}
                >
                  Previous Feedback History
                </h4>

                {myFeedback.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "var(--text-dim)",
                      background: "rgba(255,255,255,0.5)",
                      borderRadius: "16px",
                      border: "1px dashed #cbd5e1",
                    }}
                  >
                    <FaPaperPlane
                      size={32}
                      style={{ opacity: 0.2, marginBottom: "1rem" }}
                    />
                    <p>No feedback sent yet.</p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {myFeedback.map((f) => (
                      <div
                        key={f._id}
                        className="history-card"
                        style={{
                          background: "white",
                          padding: "1.5rem",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "1rem",
                            borderBottom: "1px solid #f1f5f9",
                            paddingBottom: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.25rem",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.85rem",
                                color: "var(--text-dim)",
                                fontWeight: "500",
                              }}
                            >
                              {new Date(f.sent_at).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                            {f.is_anonymous && (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  background: "#f1f5f9",
                                  color: "var(--text-dim)",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  width: "fit-content",
                                }}
                              >
                                Anonymous
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteFeedback(f._id)}
                            style={{
                              background: "#fef2f2",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "0.4rem 0.8rem",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.background = "#fee2e2")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background = "#fef2f2")
                            }
                          >
                            Delete
                          </button>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            color: "var(--text-main)",
                            lineHeight: "1.6",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {f.message_content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {selectedNotice && (
          <NoticeDetail
            selectedNotice={selectedNotice}
            closeNotice={closeNotice}
          />
        )}
      </div>
    </Layout>
  );
};

export default BatchDashboard;
