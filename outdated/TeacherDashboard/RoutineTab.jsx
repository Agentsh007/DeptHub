import React from "react";
import { FaCloudUploadAlt, FaPaperclip, FaTrash } from "react-icons/fa";
import { s } from "./teacherDashboardStyles";

const RoutineTab = ({
  file,
  setFile,
  loading,
  handleRoutineUpload,
  routines,
  peerReviewRoutines,
  pendingRoutines,
  publishedRoutines,
  feedbackList,
  peerFeedbackText,
  setPeerFeedbackText,
  peerFeedbackSending,
  peerFeedbackSent,
  submitPeerFeedback,
  deleteFeedback,
  deleteRoutine,
  sendToChairman,
  user,
}) => {
  return (
    <>
      {/* Upload Routine */}
      <div style={s.outerCard}>
        <h2 style={s.sectionTitle}>Routine</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div style={{ marginBottom: "1.25rem" }}>
            <textarea
              name="msg"
              id="routineMsg"
              placeholder="Routine Details / Message..."
              rows="3"
              style={s.textarea}
              required
            ></textarea>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={s.label}>Select Document</label>
            <div
              onClick={() => document.getElementById("routineFile").click()}
              style={s.uploadZone}
            >
              <div style={{ color: "#ea580c", marginBottom: "0.75rem" }}>
                <FaCloudUploadAlt size={48} />
              </div>
              {file ? (
                <div style={{ fontWeight: "600", color: "#1e293b" }}>
                  {file.name}
                </div>
              ) : (
                <div style={{ color: "#1e293b", fontWeight: "600" }}>
                  Click to browse file
                </div>
              )}
            </div>
            <input
              id="routineFile"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: "none" }}
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
          </div>
          <div className="teacher-routine-btns">
            <button
              type="button"
              onClick={() => handleRoutineUpload("PENDING_FEEDBACK")}
              style={s.declineBtn}
              disabled={loading}
            >
              Request Peer Feedback
            </button>
            <button
              type="button"
              onClick={() => handleRoutineUpload("PENDING_APPROVAL")}
              style={s.publishBtn}
              disabled={loading}
            >
              Send for Approval
            </button>
          </div>
        </form>
      </div>

      {/* PEER REVIEW SECTION */}
      {peerReviewRoutines.length > 0 && (
        <div style={s.outerCard}>
          <h2 style={s.sectionTitle}>
            👥 Peer Review Requests
            <span
              style={{
                marginLeft: "0.75rem",
                background: "#fef3c7",
                color: "#b45309",
                fontSize: "0.75rem",
                fontWeight: "700",
                padding: "0.2rem 0.6rem",
                borderRadius: "999px",
              }}
            >
              {peerReviewRoutines.length} pending
            </span>
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.875rem",
              marginBottom: "1.25rem",
            }}
          >
            Your colleagues have requested feedback on their routines before
            sending to the Chairman.
          </p>
          {peerReviewRoutines.map((r) => (
            <div
              key={r._id}
              style={{ ...s.noticeCard, borderLeft: "4px solid #f59e0b" }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <h4
                    style={{
                      fontWeight: "700",
                      color: "#1e293b",
                      margin: 0,
                    }}
                  >
                    {r.title}
                  </h4>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    by {r.author?.full_name} ·{" "}
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.content && (
                  <p
                    style={{
                      color: "#475569",
                      fontSize: "0.9rem",
                      margin: "0.5rem 0",
                    }}
                  >
                    {r.content}
                  </p>
                )}
                {r.file_url && (
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={s.attachBtn}
                  >
                    <FaPaperclip /> View Routine Document
                  </a>
                )}
              </div>

              {/* Feedback already given */}
              {feedbackList.filter((f) => f.target_announcement === r._id)
                .length > 0 && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Feedback so far:
                  </div>
                  {feedbackList
                    .filter((f) => f.target_announcement === r._id)
                    .map((f) => (
                      <div
                        key={f._id}
                        style={{
                          fontSize: "0.85rem",
                          color: "#334155",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <strong>
                          {f.from_user?.full_name || "A colleague"}:
                        </strong>{" "}
                        {f.message_content}
                      </div>
                    ))}
                </div>
              )}

              {/* Feedback input */}
              {peerFeedbackSent[r._id] ? (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    background: "#dcfce7",
                    borderRadius: "8px",
                    color: "#166534",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  ✓ Your feedback was submitted successfully.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "flex-end",
                  }}
                >
                  <textarea
                    rows="2"
                    placeholder="Write your feedback for this routine..."
                    value={peerFeedbackText[r._id] || ""}
                    onChange={(e) =>
                      setPeerFeedbackText((prev) => ({
                        ...prev,
                        [r._id]: e.target.value,
                      }))
                    }
                    style={{
                      ...s.textarea,
                      flex: 1,
                      marginBottom: 0,
                      resize: "vertical",
                      minHeight: "60px",
                    }}
                  />
                  <button
                    onClick={() => submitPeerFeedback(r._id)}
                    disabled={
                      peerFeedbackSending[r._id] ||
                      !peerFeedbackText[r._id]?.trim()
                    }
                    style={{
                      ...s.publishBtn,
                      padding: "0.6rem 1.25rem",
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                      opacity: !peerFeedbackText[r._id]?.trim() ? 0.5 : 1,
                    }}
                  >
                    {peerFeedbackSending[r._id] ? "Sending..." : "✉ Submit"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pending Routine for Approval */}
      {pendingRoutines.length > 0 && (
        <div style={s.outerCard}>
          <h2 style={s.sectionTitle}>⏳ Routine for Approval</h2>
          {pendingRoutines.map((r) => (
            <div key={r._id} style={s.noticeCard}>
              <div className="chairman-card-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4
                    style={{
                      fontWeight: "700",
                      color: "#1e293b",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {r.title}
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "normal",
                        marginLeft: "0.5rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        background:
                          r.status === "PENDING_FEEDBACK"
                            ? "#fef3c7"
                            : "#fed7aa",
                        color:
                          r.status === "PENDING_FEEDBACK"
                            ? "#b45309"
                            : "#c2410c",
                      }}
                    >
                      {r.status.replace("_", " ")}
                    </span>
                  </h4>
                  {r.content && (
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "0.9rem",
                        margin: "0 0 0.5rem",
                      }}
                    >
                      {r.content}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {r.file_url && (
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={s.attachBtn}
                      >
                        <FaPaperclip /> View Attached Document
                      </a>
                    )}
                    {r.status === "PENDING_FEEDBACK" && (
                      <button
                        onClick={() => sendToChairman(r._id)}
                        style={{
                          ...s.publishBtn,
                          padding: "0.4rem 1rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        Send to Chairman
                      </button>
                    )}
                  </div>

                  {/* Show feedback */}
                  {feedbackList.filter(
                    (f) => f.target_announcement === r._id
                  ).length > 0 && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.75rem",
                        background: "#f0f9ff",
                        borderRadius: "8px",
                        borderLeft: "3px solid #0ea5e9",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          color: "#0369a1",
                          marginBottom: "0.4rem",
                        }}
                      >
                        Peer Feedback:
                      </div>
                      {feedbackList
                        .filter((f) => f.target_announcement === r._id)
                        .map((f) => (
                          <div
                            key={f._id}
                            style={{
                              fontSize: "0.85rem",
                              color: "#334155",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "0.3rem",
                            }}
                          >
                            <div>
                              <strong>
                                {f.from_user?.full_name || "Anonymous"}:
                              </strong>{" "}
                              {f.message_content}
                            </div>
                            <button
                              onClick={() => deleteFeedback(f._id)}
                              style={s.deleteBtn}
                            >
                              <FaTrash size={11} />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteRoutine(r._id)}
                  style={s.deleteBtn}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Published Routines */}
      <div style={s.outerCard}>
        <h2 style={s.sectionTitle}>Published Routine</h2>
        {publishedRoutines.length === 0 ? (
          <p
            style={{
              color: "#94a3b8",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            No published routines yet.
          </p>
        ) : (
          publishedRoutines.map((r) => (
            <div key={r._id} style={s.noticeCard}>
              <h4
                style={{
                  fontWeight: "700",
                  color: "#1e293b",
                  marginBottom: "0.3rem",
                }}
              >
                {r.title}{" "}
                {r.author?._id !== user.id && (
                  <span
                    style={{
                      fontWeight: "normal",
                      color: "#64748b",
                      fontSize: "0.85rem",
                    }}
                  >
                    — by {r.author?.full_name}
                  </span>
                )}
              </h4>
              {r.content && (
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.9rem",
                    margin: "0 0 0.5rem",
                  }}
                >
                  {r.content}
                </p>
              )}
              {r.file_url && (
                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.attachBtn}
                >
                  <FaPaperclip /> View Attached Document
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default RoutineTab;