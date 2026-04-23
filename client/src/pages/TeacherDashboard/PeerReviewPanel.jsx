import React, { useState } from "react";
import { Paperclip, Send, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, MessageSquare, User } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// PeerReviewPanel
//
// Props:
//   peerRoutines   – array of PENDING_FEEDBACK routines by OTHER teachers
//   currentUserId  – logged-in teacher's user id (to hide own feedback delete)
//   feedbacksMap   – { [routineId]: Feedback[] }  pre-fetched feedback per routine
//   onSubmitFeedback(routineId, message, isAnonymous) – async handler
//   onDeleteFeedback(feedbackId, routineId)          – async handler
// ─────────────────────────────────────────────────────────────────────────────

const PeerReviewPanel = ({
  peerRoutines = [],
  currentUserId,
  feedbacksMap = {},
  onSubmitFeedback,
  onDeleteFeedback,
}) => {
  // Per-routine UI state: { [routineId]: { expanded, text, anonymous, submitting } }
  const [routineState, setRoutineState] = useState({});

  const getState = (id) =>
    routineState[id] || { expanded: false, text: "", anonymous: false, submitting: false };

  const patchState = (id, patch) =>
    setRoutineState((prev) => ({ ...prev, [id]: { ...getState(id), ...patch } }));

  const handleSubmit = async (routineId) => {
    const st = getState(routineId);
    if (!st.text.trim()) return;
    patchState(routineId, { submitting: true });
    try {
      await onSubmitFeedback(routineId, st.text.trim(), st.anonymous);
      patchState(routineId, { text: "", submitting: false });
    } catch {
      patchState(routineId, { submitting: false });
    }
  };

  if (peerRoutines.length === 0) {
    return (
      <div style={{
        background: "#f8fafc", borderRadius: "12px",
        border: "1.5px dashed #cbd5e1",
        padding: "2.5rem 1.5rem", textAlign: "center",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎉</div>
        <p style={{ color: "#64748b", fontWeight: "600", fontSize: "0.95rem", margin: 0 }}>
          No routines waiting for peer review.
        </p>
        <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginTop: "0.35rem" }}>
          When a colleague submits a routine, it will appear here for you to review.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Info banner */}
      <div style={{
        background: "#eff6ff", border: "1px solid #bfdbfe",
        borderRadius: "10px", padding: "0.75rem 1rem",
        fontSize: "0.8rem", color: "#1d4ed8", display: "flex", gap: "0.5rem",
      }}>
        <MessageSquare size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
        <span>
          Review your colleagues' routines before they're submitted to the Chairman.
          Your feedback helps improve scheduling quality.
        </span>
      </div>

      {peerRoutines.map((routine) => {
        const st = getState(routine._id);
        const feedbacks = feedbacksMap[routine._id] || [];
        const myFeedback = feedbacks.find(
          (f) => f.from_user?._id === currentUserId || f.from_user === currentUserId
        );

        return (
          <div
            key={routine._id}
            style={{
              background: "white", border: "1px solid #e2e8f0",
              borderRadius: "12px", overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {/* ── Header row ── */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: "0.75rem",
              padding: "1rem 1.25rem",
              background: st.expanded ? "#f8fafc" : "white",
              borderBottom: st.expanded ? "1px solid #e2e8f0" : "none",
            }}>
              <div style={{ flex: 1, minWidth: "180px" }}>
                {/* Title */}
                <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.92rem", marginBottom: "0.25rem" }}>
                  {routine.title}
                </div>
                {/* Meta */}
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#64748b" }}>
                    <User size={11} /> {routine.author?.full_name || "Unknown Teacher"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {new Date(routine.created_at).toLocaleDateString("en-US", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </span>
                  {feedbacks.length > 0 && (
                    <span style={{
                      fontSize: "0.7rem", fontWeight: "700",
                      background: "#fef3c7", color: "#b45309",
                      border: "1px solid #fde68a",
                      padding: "0.1rem 0.45rem", borderRadius: "999px",
                    }}>
                      {feedbacks.length} feedback{feedbacks.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {myFeedback && (
                    <span style={{
                      fontSize: "0.7rem", fontWeight: "700",
                      background: "#dcfce7", color: "#16a34a",
                      border: "1px solid #86efac",
                      padding: "0.1rem 0.45rem", borderRadius: "999px",
                    }}>
                      ✓ You reviewed
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                {routine.file_url && (
                  <a
                    href={routine.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.3rem",
                      padding: "0.4rem 0.85rem", background: "#fff7ed",
                      color: "#c2410c", border: "1px solid #fed7aa",
                      borderRadius: "7px", fontSize: "0.78rem", fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    <Paperclip size={11} /> View PDF
                  </a>
                )}
                <button
                  onClick={() => patchState(routine._id, { expanded: !st.expanded })}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.3rem",
                    padding: "0.4rem 0.85rem",
                    background: st.expanded ? "#eff6ff" : "#f8fafc",
                    color: st.expanded ? "#2563eb" : "#475569",
                    border: `1px solid ${st.expanded ? "#bfdbfe" : "#e2e8f0"}`,
                    borderRadius: "7px", fontSize: "0.78rem", fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {st.expanded ? <><ChevronUp size={12} /> Collapse</> : <><ChevronDown size={12} /> Give Feedback</>}
                </button>
              </div>
            </div>

            {/* ── Expanded: feedback thread + form ── */}
            {st.expanded && (
              <div style={{ padding: "1rem 1.25rem" }}>

                {/* Existing feedback thread */}
                {feedbacks.length > 0 && (
                  <div style={{ marginBottom: "1.25rem" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Feedback from colleagues
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {feedbacks.map((fb) => {
                        const isOwn = fb.from_user?._id === currentUserId || fb.from_user === currentUserId;
                        const senderName = fb.is_anonymous
                          ? "Anonymous"
                          : fb.from_user?.full_name || "Unknown";

                        return (
                          <div
                            key={fb._id}
                            style={{
                              display: "flex", gap: "0.75rem",
                              padding: "0.75rem 1rem",
                              background: isOwn ? "#eff6ff" : "#f8fafc",
                              border: `1px solid ${isOwn ? "#bfdbfe" : "#e2e8f0"}`,
                              borderRadius: "8px",
                            }}
                          >
                            {/* Avatar */}
                            <div style={{
                              width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                              background: isOwn ? "#dbeafe" : "#e2e8f0",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.7rem", fontWeight: "700",
                              color: isOwn ? "#1d4ed8" : "#64748b",
                            }}>
                              {fb.is_anonymous ? "?" : (senderName[0] || "T")}
                            </div>
                            {/* Content */}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: isOwn ? "#1d4ed8" : "#334155" }}>
                                  {senderName} {isOwn && <span style={{ fontWeight: "400", color: "#64748b" }}>(you)</span>}
                                </span>
                                <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                                  {new Date(fb.sent_at).toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
                                </span>
                              </div>
                              <p style={{ fontSize: "0.82rem", color: "#334155", margin: 0, lineHeight: "1.5" }}>
                                {fb.message_content}
                              </p>
                            </div>
                            {/* Delete (own feedback only) */}
                            {isOwn && (
                              <button
                                onClick={() => onDeleteFeedback(fb._id, routine._id)}
                                style={{
                                  background: "none", border: "none", cursor: "pointer",
                                  color: "#94a3b8", padding: "0.1rem", alignSelf: "flex-start",
                                }}
                                title="Delete your feedback"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Feedback form ── */}
                <div style={{
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: "10px", padding: "1rem",
                }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#475569", marginBottom: "0.6rem" }}>
                    {myFeedback ? "Update your feedback" : "Leave feedback"}
                  </div>
                  <textarea
                    rows={3}
                    value={st.text}
                    onChange={(e) => patchState(routine._id, { text: e.target.value })}
                    placeholder="Write your review, suggestions, or concerns about this routine..."
                    style={{
                      width: "100%", padding: "0.65rem 0.85rem",
                      border: "1.5px solid #e2e8f0", borderRadius: "8px",
                      fontSize: "0.82rem", resize: "vertical", outline: "none",
                      boxSizing: "border-box", fontFamily: "inherit", lineHeight: "1.5",
                      minHeight: "80px", color: "#1e293b",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.6rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    {/* Anonymous toggle */}
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.78rem", color: "#64748b", userSelect: "none" }}>
                      <input
                        type="checkbox"
                        checked={st.anonymous}
                        onChange={(e) => patchState(routine._id, { anonymous: e.target.checked })}
                        style={{ accentColor: "#3b82f6" }}
                      />
                      {st.anonymous ? <><EyeOff size={12} /> Post anonymously</> : <><Eye size={12} /> Post with my name</>}
                    </label>

                    {/* Submit */}
                    <button
                      onClick={() => handleSubmit(routine._id)}
                      disabled={st.submitting || !st.text.trim()}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "0.35rem",
                        padding: "0.45rem 1.1rem", borderRadius: "7px", fontWeight: "700",
                        background: !st.text.trim() || st.submitting
                          ? "#e2e8f0"
                          : "linear-gradient(135deg, #3b82f6, #2563eb)",
                        color: !st.text.trim() || st.submitting ? "#94a3b8" : "white",
                        border: "none", cursor: !st.text.trim() || st.submitting ? "default" : "pointer",
                        fontSize: "0.8rem",
                        boxShadow: st.text.trim() && !st.submitting ? "0 2px 6px rgba(59,130,246,0.25)" : "none",
                      }}
                    >
                      <Send size={12} />
                      {st.submitting ? "Sending..." : "Submit Feedback"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PeerReviewPanel;