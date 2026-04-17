import { FaFilePdf } from "react-icons/fa";

const NoticeDetailModal = ({ notice, onClose }) => {
  if (!notice) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(15, 23, 42, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "92vh",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem 2rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.35rem",
              fontWeight: "700",
              color: "#1e293b",
            }}
          >
            {notice.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.75rem",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "2rem",
            overflowY: "auto",
            maxHeight: "calc(92vh - 180px)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              marginBottom: "2rem",
              color: "#64748b",
              fontSize: "0.92rem",
            }}
          >
            <div>
              By: <strong>{notice.author?.name || "Admin"}</strong>
            </div>
            <div>
              {new Date(notice.created_at).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
          <div
            style={{
              fontSize: "1.02rem",
              lineHeight: "1.85",
              color: "#334155",
              whiteSpace: "pre-wrap",
            }}
          >
            {notice.content ||
              "No additional content provided for this notice."}
          </div>

          {notice.file_url && (
            <div
              style={{
                marginTop: "2.5rem",
                padding: "1.75rem",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "1rem",
                }}
              >
                <FaFilePdf color="#ef4444" size={26} />
                <div>
                  <p style={{ margin: 0, fontWeight: "600" }}>
                    Attached PDF File
                  </p>
                </div>
              </div>
              <a
                href={notice.file_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#2563eb",
                  color: "white",
                  padding: "0.8rem 1.6rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                View / Download File
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1.25rem 2rem",
            borderTop: "1px solid #e2e8f0",
            textAlign: "right",
            background: "#f8fafc",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.7rem 2rem",
              background: "#64748b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailModal;
