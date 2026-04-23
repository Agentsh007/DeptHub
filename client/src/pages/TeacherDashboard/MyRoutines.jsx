import React, { useState } from "react";
import {
  Edit2, Paperclip, Trash2, Send, Clock,
  CheckCircle, XCircle, MessageSquare, ChevronDown, ChevronUp, User,
} from "lucide-react";

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
  PENDING_FEEDBACK: {
    bg: "#fef3c7", color: "#b45309", border: "#fde68a",
    label: "Peer Review", icon: <Clock size={11} />,
    description: "Awaiting feedback from a colleague before submission.",
  },
  PENDING_APPROVAL: {
    bg: "#fed7aa", color: "#c2410c", border: "#fdba74",
    label: "Awaiting Approval", icon: <Send size={11} />,
    description: "Sent to Chairman for final approval.",
  },
  APPROVED: {
    bg: "#dcfce7", color: "#16a34a", border: "#86efac",
    label: "Approved & Live", icon: <CheckCircle size={11} />,
    description: "This routine is approved and published.",
  },
  REJECTED: {
    bg: "#fee2e2", color: "#dc2626", border: "#fca5a5",
    label: "Rejected", icon: <XCircle size={11} />,
    description: "Rejected. Edit and resubmit.",
  },
};

const StatusBadge = ({ status }) => {
  const st = STATUS_MAP[status] || {
    bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", label: status, icon: null,
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      background: st.bg, color: st.color, border: `1px solid ${st.border}`,
      fontSize: "0.7rem", fontWeight: "700",
      padding: "0.2rem 0.6rem", borderRadius: "999px",
    }}>
      {st.icon} {st.label}
    </span>
  );
};

const StatusLegend = () => (
  <div style={{
    display: "flex", gap: "0.6rem", flexWrap: "wrap",
    background: "#f8fafc", borderRadius: "8px",
    padding: "0.6rem 0.85rem", border: "1px solid #e2e8f0", marginBottom: "1.25rem",
  }}>
    {Object.entries(STATUS_MAP).map(([key, val]) => (
      <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: val.color, fontWeight: "600" }}>
        {val.icon} {val.label}
      </span>
    ))}
  </div>
);

// ── Collapsible peer feedback thread (shown on own routines) ──────────────────
const FeedbackThread = ({ feedbacks = [] }) => {
  const [open, setOpen] = useState(false);
  if (feedbacks.length === 0) return null;

  return (
    <div style={{ marginTop: "0.75rem" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.35rem",
          background: "none", border: "none", cursor: "pointer",
          color: "#b45309", fontSize: "0.75rem", fontWeight: "700", padding: 0,
        }}
      >
        <MessageSquare size={12} />
        {feedbacks.length} peer feedback{feedbacks.length > 1 ? "s" : ""} received
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.6rem" }}>
          {feedbacks.map((fb) => {
            const senderName = fb.is_anonymous ? "Anonymous" : fb.from_user?.full_name || "Unknown";
            return (
              <div key={fb._id} style={{
                display: "flex", gap: "0.6rem",
                background: "#fffbeb", border: "1px solid #fde68a",
                borderRadius: "8px", padding: "0.65rem 0.85rem",
              }}>
                <div style={{
                  width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
                  background: "#fef3c7", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "0.68rem", fontWeight: "700", color: "#b45309",
                }}>
                  {fb.is_anonymous ? <User size={12} /> : (senderName[0] || "T")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "#92400e" }}>{senderName}</span>
                    <span style={{ fontSize: "0.68rem", color: "#a16207" }}>
                      {new Date(fb.sent_at).toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#78350f", margin: 0, lineHeight: "1.5" }}>
                    {fb.message_content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
// feedbacksMap: { [routineId]: Feedback[] }
const MyRoutines = ({
  routines = [],
  editingRoutineId,
  onEdit,
  onDelete,
  onSendForApproval,
  feedbacksMap = {},
}) => {
  const canEdit = (status) => status !== "PENDING_APPROVAL" && status !== "APPROVED";
  const canSendForApproval = (status) => status === "PENDING_FEEDBACK" || status === "REJECTED";

  if (routines.length === 0) {
    return (
      <div style={{
        background: "#f8fafc", borderRadius: "12px",
        border: "1.5px dashed #cbd5e1", padding: "2.5rem 1.5rem", textAlign: "center",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📋</div>
        <p style={{ color: "#64748b", fontWeight: "600", fontSize: "0.95rem", margin: 0 }}>
          No routines submitted yet.
        </p>
        <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginTop: "0.35rem" }}>
          Use the Routine Builder to create your first one.
        </p>
      </div>
    );
  }

  return (
    <div>
      <StatusLegend />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {routines.map((r) => {
          const isEditing = editingRoutineId === r._id;
          const st = STATUS_MAP[r.status] || {};
          const peerFeedbacks = feedbacksMap[r._id] || [];

          return (
            <div key={r._id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              background: isEditing ? "#eff6ff" : "white",
              border: isEditing ? "1.5px solid #3b82f6" : `1px solid ${st.border || "#e2e8f0"}`,
              padding: "1rem 1.25rem", borderRadius: "12px",
              flexWrap: "wrap", gap: "0.75rem",
              boxShadow: isEditing ? "0 0 0 3px rgba(59,130,246,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
              transition: "border 0.2s",
            }}>
              {/* Left: Info */}
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.92rem" }}>{r.title}</span>
                  {isEditing && (
                    <span style={{ fontSize: "0.7rem", color: "#2563eb", fontWeight: "600", background: "#dbeafe", padding: "0.1rem 0.5rem", borderRadius: "999px", border: "1px solid #bfdbfe" }}>
                      ✏️ Currently Editing
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                    {new Date(r.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <StatusBadge status={r.status} />
                </div>

                {st.description && (
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.1rem" }}>
                    {st.description}
                  </div>
                )}

                {/* Chairman rejection note (stored in Announcement.feedback) */}
                {r.feedback && (
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: "0.35rem",
                    marginTop: "0.5rem", background: "#fffbeb", border: "1px solid #fde68a",
                    borderRadius: "8px", padding: "0.45rem 0.7rem", fontSize: "0.78rem", color: "#92400e",
                  }}>
                    <MessageSquare size={12} style={{ marginTop: "2px", flexShrink: 0 }} />
                    <span><strong>Chairman note:</strong> {r.feedback}</span>
                  </div>
                )}

                {/* Peer feedback from Feedback collection */}
                <FeedbackThread feedbacks={peerFeedbacks} />
              </div>

              {/* Right: Actions */}
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
                {r.file_url && (
                  <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.85rem", background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", borderRadius: "7px", fontSize: "0.78rem", fontWeight: "600", textDecoration: "none" }}>
                    <Paperclip size={11} /> View PDF
                  </a>
                )}

                {canSendForApproval(r.status) && (
                  <button onClick={() => onSendForApproval(r._id)} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.85rem", background: "#f0fdf4", color: "#16a34a", border: "1px solid #86efac", borderRadius: "7px", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer" }} title="Send to Chairman for approval">
                    <Send size={11} /> Send for Approval
                  </button>
                )}

                {canEdit(r.status) && (
                  <button onClick={() => onEdit(r)} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.85rem", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "7px", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer" }}>
                    <Edit2 size={11} /> Edit
                  </button>
                )}

                <button onClick={() => onDelete(r._id)} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.7rem", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "7px", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer" }} title="Delete routine">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyRoutines;