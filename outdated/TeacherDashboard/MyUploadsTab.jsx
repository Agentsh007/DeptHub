import { FaFolder, FaTrash } from "react-icons/fa";
import { getFileIcon } from "./getFileIcon";
import s from './teacherDashboardStyles'
const MyUploadsTab = ({
  groupedDocs,
  batchNames,
  openBatchFolder,
  setOpenBatchFolder,
  deleteDoc,
}) => {
  return (
    <div style={s.outerCard}>
      {!openBatchFolder ? (
        batchNames.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center" }}>
            No uploads found.
          </p>
        ) : (
          <div className="teacher-folder-grid">
            {batchNames.map((name) => (
              <div
                key={name}
                onClick={() => setOpenBatchFolder(name)}
                style={{ ...s.folderCard, cursor: "pointer" }}
              >
                <div style={{ color: "#f59e0b", marginBottom: "0.5rem" }}>
                  <FaFolder size={40} />
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    color: "#ea580c",
                  }}
                >
                  {name}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    marginTop: "0.25rem",
                  }}
                >
                  {groupedDocs[name].length} file(s)
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          <button
            onClick={() => setOpenBatchFolder(null)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "none",
              border: "none",
              color: "#ea580c",
              fontWeight: "600",
              fontSize: "0.95rem",
              cursor: "pointer",
              marginBottom: "1.25rem",
              padding: 0,
            }}
          >
            ← Back
          </button>
          <h3
            style={{
              fontWeight: "700",
              color: "#1e293b",
              fontSize: "1.1rem",
              marginBottom: "1.25rem",
            }}
          >
            {openBatchFolder}
          </h3>
          {(groupedDocs[openBatchFolder] || []).length === 0 ? (
            <p
              style={{
                color: "#94a3b8",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              No files in this batch.
            </p>
          ) : (
            <div className="teacher-folder-grid">
              {groupedDocs[openBatchFolder].map((doc) => (
                <div
                  key={doc._id}
                  style={{ ...s.folderCard, position: "relative" }}
                >
                  <button
                    onClick={() => deleteDoc(doc._id)}
                    style={{
                      ...s.deleteBtn,
                      position: "absolute",
                      top: "0.4rem",
                      right: "0.4rem",
                    }}
                  >
                    <FaTrash size={10} />
                  </button>
                  <a
                    href={doc.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div style={{ marginBottom: "0.5rem" }}>
                      {getFileIcon(doc.original_filename)}
                    </div>
                    <div
                      style={{
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        color: "#ea580c",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {doc.original_filename}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyUploadsTab;
