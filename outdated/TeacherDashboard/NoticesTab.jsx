import axios from "../../utils/axiosConfig";
import { FaTrash, FaPaperclip, FaFilePdf } from "react-icons/fa";
import s from "./teacherDashboardStyles";

const NoticesTab = ({
  notices,
  showNoticeForm,
  setShowNoticeForm,
  noticeAudience,
  setNoticeAudience,
  handleNoticeSubmit,
  loading,
  user,
  openNotice,
  fetchNotices,
}) => {
  return (
    <>
      {!showNoticeForm ? (
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
            <h2 style={{ ...s.sectionTitle, marginBottom: 0 }}>
              Latest Notices
            </h2>
            <button
              onClick={() => setShowNoticeForm(true)}
              style={s.publishBtn}
            >
              Create Notice
            </button>
          </div>
          <div
            style={{
              ...s.outerCard,
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
                    <th
                      style={{
                        padding: "1.2rem 1.5rem",
                        textAlign: "left",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      NO
                    </th>
                    <th
                      style={{
                        padding: "1.2rem 1rem",
                        textAlign: "left",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      TITLE
                    </th>
                    <th
                      style={{
                        padding: "1.2rem 1rem",
                        textAlign: "left",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      AUTHOR
                    </th>
                    <th
                      style={{
                        padding: "1.2rem 1rem",
                        textAlign: "center",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      DATE
                    </th>
                    <th
                      style={{
                        padding: "1.2rem 1rem",
                        textAlign: "center",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      FILES
                    </th>
                    <th
                      style={{
                        padding: "1.2rem 1.5rem",
                        textAlign: "center",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {notices
                    .filter((n) => n.status === "APPROVED")
                    .map((notice, index) => (
                      <tr
                        key={notice._id}
                        onClick={() => openNotice(notice)}
                        style={{
                          borderBottom: "1px solid #f8fafc",
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
                            <FaFilePdf color="#ef4444" size={20} />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td
                          style={{
                            padding: "1.1rem 1.5rem",
                            textAlign: "center",
                          }}
                        >
                          <span style={{ color: "#3b82f6", fontWeight: "500" }}>
                            View
                          </span>
                        </td>
                      </tr>
                    ))}
                  {notices.filter((n) => n.status === "APPROVED").length ===
                    0 && (
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
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={s.outerCard}>
            <h2 style={s.sectionTitle}>📣 Post New Notice</h2>
            <form onSubmit={handleNoticeSubmit}>
              <div style={{ marginBottom: "1.25rem" }}>
                <input
                  name="noticeTitle"
                  placeholder="Notice Title (e.g. Holi Holiday)"
                  style={s.input}
                  required
                />
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <textarea
                  name="noticeContent"
                  placeholder="Notice Details"
                  rows="4"
                  style={s.textarea}
                  required
                ></textarea>
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={s.label}>
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
                <label style={s.label}>Select Audience</label>
                <select
                  name="audience"
                  style={s.input}
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
                <button
                  type="submit"
                  style={{ ...s.submitBtn, margin: 0 }}
                  disabled={loading}
                >
                  Send for Approval
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoticeForm(false)}
                  style={{ ...s.declineBtn, padding: "0.85rem 2rem" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div style={s.outerCard}>
            <h2 style={s.sectionTitle}>⏳ Pending Notice</h2>
            {notices.filter(
              (n) =>
                (n.status === "PENDING" || n.status === "PENDING_APPROVAL") &&
                n.author?._id === user.id,
            ).length === 0 ? (
              <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                No pending notices.
              </p>
            ) : (
              notices
                .filter(
                  (n) =>
                    (n.status === "PENDING" ||
                      n.status === "PENDING_APPROVAL") &&
                    n.author?._id === user.id,
                )
                .map((item) => (
                  <div key={item._id} style={s.noticeCard}>
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
                            style={s.attachBtn}
                          >
                            <FaPaperclip /> View Attached Document
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this pending notice?")) {
                            axios
                              .delete(`/announcements/${item._id}`)
                              .then(() => fetchNotices());
                          }
                        }}
                        style={s.deleteBtn}
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
    </>
  );
};

export default NoticesTab;
