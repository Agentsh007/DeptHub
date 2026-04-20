import React from 'react'
import { FaFilePdf, FaTimes } from 'react-icons/fa'

const NoticeDetail = ({ selectedNotice, closeNotice, userRole }) => {
  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(15, 23, 42, 0.65)", display: "flex",
        alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "1rem",
      }}
      onClick={closeNotice}
    >
      <div
        style={{
          background: "white", borderRadius: "14px", width: "100%",
          maxWidth: "580px", maxHeight: "88vh", overflow: "hidden",
          boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
          animation: "slideInUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", lineHeight: "1.3" }}>
            {selectedNotice.title}
          </h2>
          <button onClick={closeNotice} style={{ background: "#f1f5f9", border: "none", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", flexShrink: 0 }}>
            <FaTimes size={12} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.25rem", overflowY: "auto", maxHeight: "calc(88vh - 140px)" }}>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", color: "#64748b", fontSize: "0.78rem", flexWrap: "wrap" }}>
            <div>By: <strong style={{ color: "#1e293b" }}>{selectedNotice.author?.name || "Admin"}</strong></div>
            <div>
              {new Date(selectedNotice.created_at).toLocaleDateString("en-US", {
                weekday: "short", year: "numeric", month: "short", day: "numeric",
              })}
            </div>
          </div>

          <div style={{ fontSize: "0.88rem", lineHeight: "1.7", color: "#334155", whiteSpace: "pre-wrap" }}>
            {selectedNotice.content || "No additional content provided for this notice."}
          </div>

          {/* File Section */}
          {selectedNotice.file_url && (
            <div style={{ marginTop: "1.25rem", padding: "1rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <FaFilePdf color="#ef4444" size={18} />
                <span style={{ fontWeight: "600", fontSize: "0.82rem" }}>Attached File</span>
              </div>
              <a
                href={selectedNotice.file_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.35rem",
                  background: "#2563eb", color: "white", padding: "0 1rem",
                  borderRadius: "6px", textDecoration: "none", fontWeight: "600",
                  fontSize: "0.78rem", height: "32px",
                }}
              >
                View / Download
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #e2e8f0", textAlign: "right", background: "#f8fafc", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button
            onClick={closeNotice}
            style={{
              padding: "0 1.25rem", background: "#f1f5f9", color: "#475569",
              border: "1px solid #e2e8f0", borderRadius: "6px",
              cursor: "pointer", fontWeight: "600", fontSize: "0.78rem", height: "32px",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoticeDetail
