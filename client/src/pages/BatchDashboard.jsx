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
        style={{ maxWidth: "1100px", padding: "0.75rem" }}
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
            <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", maxWidth: "700px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <div style={{ width: "56px", height: "56px", background: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem auto", color: "#2563eb" }}>
                  <FaUser size={22} />
                </div>
                <h2 style={{ fontSize: "1.25rem", color: "var(--text-main)", marginBottom: "0.25rem" }}>{user.name}</h2>
                <span className="badge badge-primary">Batch Profile</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <label style={{ color: "var(--text-dim)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem", display: "block", fontWeight: "600" }}>Batch Name</label>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)" }}>{user.name}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <label style={{ color: "var(--text-dim)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem", display: "block", fontWeight: "600" }}>Account Type</label>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)" }}>Student Access</div>
                </div>
              </div>
              <div style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.78rem" }}>To update batch details, please contact the Chairman.</div>
            </div>
          )}

          {activeTab === "folders" && (
            <div>
              <p style={{ color: "var(--text-dim)", marginBottom: "0.75rem", fontSize: "0.82rem" }}>
                Browse resources by Teacher.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem" }}>
                {teachers.length === 0 ? (
                  <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>No resources found yet.</p>
                ) : (
                  teachers.map((teacher) => (
                    <Link key={teacher._id} to={`/batch/teacher/${teacher._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="interactive-card" style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", textAlign: "center", cursor: "pointer", border: "1px solid #e2e8f0" }}>
                        <div style={{ background: "#fef3c7", width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem auto" }}>
                          <FaFolder size={20} color="#d97706" />
                        </div>
                        <div style={{ fontWeight: "600", fontSize: "0.82rem", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
              <h3 style={{ fontSize: "0.95rem", color: "var(--text-main)", marginBottom: "0.75rem", fontWeight: "600" }}>Class Updates</h3>
              {announcements.filter((a) => a.type === "ANNOUNCEMENT").length === 0 ? (
                <p style={{ color: "var(--text-dim)", textAlign: "center", fontSize: "0.85rem" }}>No class updates published yet.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {announcements.filter((a) => a.type === "ANNOUNCEMENT").map((update) => (
                    <div key={update._id} style={{ background: "white", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#1e293b", marginBottom: "0.25rem" }}>{update.title}</h4>
                          <p style={{ color: "#475569", marginBottom: "0.35rem", fontSize: "0.82rem", lineHeight: "1.5" }}>{update.content}</p>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                            {new Date(update.created_at).toLocaleDateString()}
                            {update.author?.full_name && <> · {update.author.full_name}</>}
                          </div>
                        </div>
                        {update.file_url && (
                          <a href={update.file_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.35rem", height: "28px", fontSize: "0.72rem", padding: "0 0.6rem" }}>
                            <FaFilePdf size={11} /> View
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "routine" && (
            <div>
              <h3 style={{ fontSize: "0.95rem", color: "var(--text-main)", marginBottom: "0.75rem", fontWeight: "600" }}>Class Routines</h3>
              {announcements.filter((a) => a.type === "ROUTINE").length === 0 ? (
                <p style={{ color: "var(--text-dim)", textAlign: "center", fontSize: "0.85rem" }}>No routines published yet.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {announcements.filter((a) => a.type === "ROUTINE").map((routine) => (
                    <div key={routine._id} style={{ background: "white", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#1e293b", marginBottom: "0.25rem" }}>{routine.title}</h4>
                          <p style={{ color: "#475569", marginBottom: "0.25rem", fontSize: "0.82rem" }}>{routine.content}</p>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{new Date(routine.created_at).toLocaleDateString()}</div>
                        </div>
                        {routine.file_url && (
                          <a href={routine.file_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.35rem", height: "28px", fontSize: "0.72rem", padding: "0 0.6rem" }}>
                            <FaFilePdf size={11} /> View
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "feedback" && (
            <div style={{ maxWidth: "700px", margin: "0 auto", width: "100%" }}>
              <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ textAlign: "center", marginBottom: "0.75rem", fontSize: "0.95rem", color: "var(--text-main)", fontWeight: "600" }}>Contact Head Authority</h3>

                {sentMsg && (
                  <div style={{ background: sentMsg.includes("Failed") ? "#fef2f2" : "#f0fdf4", color: sentMsg.includes("Failed") ? "var(--error)" : "var(--success)", padding: "0.5rem 0.75rem", borderRadius: "8px", marginBottom: "0.75rem", textAlign: "center", fontWeight: "500", fontSize: "0.82rem" }}>{sentMsg}</div>
                )}

                <form onSubmit={sendFeedback}>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <textarea
                      rows="4"
                      placeholder="Write your message here..."
                      value={feedbackMsg}
                      onChange={(e) => setFeedbackMsg(e.target.value)}
                      required
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", resize: "vertical", minHeight: "100px", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                      onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(234,88,12,0.1)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                    ></textarea>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }} onClick={() => setIsAnonymous(!isAnonymous)}>
                      <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: `2px solid ${isAnonymous ? "var(--primary)" : "#cbd5e1"}`, background: isAnonymous ? "var(--primary)" : "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                        {isAnonymous && <FaPaperPlane size={7} color="white" />}
                      </div>
                      <span style={{ fontSize: "0.82rem", fontWeight: "500", color: "var(--text-main)", userSelect: "none" }}>Send Anonymously</span>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", width: "100%", fontSize: "0.85rem", height: "36px" }}>
                    <FaPaperPlane size={12} /> Send Feedback
                  </button>
                </form>
              </div>

              <div style={{ marginTop: "1.25rem" }}>
                <h4 style={{ marginBottom: "0.75rem", color: "var(--text-dim)", fontSize: "0.85rem", fontWeight: "600" }}>Previous Feedback</h4>

                {myFeedback.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-dim)", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
                    <FaPaperPlane size={20} style={{ opacity: 0.2, marginBottom: "0.5rem" }} />
                    <p style={{ fontSize: "0.82rem", margin: 0 }}>No feedback sent yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {myFeedback.map((f) => (
                      <div key={f._id} style={{ background: "white", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: "500" }}>
                              {new Date(f.sent_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                            {f.is_anonymous && (
                              <span style={{ fontSize: "0.65rem", background: "#f1f5f9", color: "var(--text-dim)", padding: "1px 6px", borderRadius: "4px" }}>Anonymous</span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteFeedback(f._id)}
                            style={{ background: "#fef2f2", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "600" }}
                          >
                            Delete
                          </button>
                        </div>
                        <p style={{ margin: 0, color: "var(--text-main)", lineHeight: "1.5", whiteSpace: "pre-wrap", fontSize: "0.82rem" }}>{f.message_content}</p>
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
