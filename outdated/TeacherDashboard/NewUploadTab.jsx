import BatchSelector from "./BatchSelector";
import UploadZone from "./UploadZone";
import s from './teacherDashboardStyles'
const NewUploadTab = ({
  batches,
  selectedBatch,
  setSelectedBatch,
  file,
  setFile,
  handleUpload,
  msg,
  loading,
}) => (
  <div style={s.outerCard}>
    <h2 style={s.sectionTitle}>Target Batch</h2>
    {msg && (
      <div
        style={{
          textAlign: "center",
          padding: "0.75rem",
          background: msg.includes("Success") ? "#dcfce7" : "#fee2e2",
          color: msg.includes("Success") ? "#166534" : "#991b1b",
          borderRadius: "8px",
          marginBottom: "1rem",
          fontSize: "0.9rem",
        }}
      >
        {msg}
      </div>
    )}
    <form onSubmit={handleUpload}>
      <div style={{ marginBottom: "1.25rem" }}>
        <BatchSelector
          batches={batches}
          selectedBatch={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={s.label}>Select Document</label>
        <UploadZone
          id="resFile"
          file={file}
          onFileSelect={(e) => setFile(e.target.files[0])}
        />
      </div>
      <button type="submit" style={s.submitBtn} disabled={loading}>
        Upload Resource
      </button>
    </form>
  </div>
);

export default NewUploadTab;