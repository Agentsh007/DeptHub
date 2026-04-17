import BatchSelector from "./BatchSelector";
import s from './teacherDashboardStyles'
const AnnouncementTab = ({
  batches,
  selectedBatch,
  setSelectedBatch,
  handleClassUpdate,
  msg,
  loading,
}) => (
  <div style={s.outerCard}>
    <h2 style={s.sectionTitle}>Target Batch</h2>
    <form onSubmit={handleClassUpdate}>
      <div style={{ marginBottom: "1.25rem" }}>
        <BatchSelector
          batches={batches}
          selectedBatch={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: "1.25rem" }}>
        <input
          name="title_display"
          placeholder="Title/Subject"
          style={s.input}
        />
      </div>
      <div style={{ marginBottom: "1.25rem" }}>
        <textarea
          name="message"
          placeholder="Message..."
          rows="4"
          style={s.textarea}
          required
        ></textarea>
      </div>
      {msg && (
        <div
          style={{
            textAlign: "center",
            padding: "0.75rem",
            background: msg.includes("Success") ? "#dcfce7" : "#fee2e2",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          {msg}
        </div>
      )}
      <button type="submit" style={s.submitBtn} disabled={loading}>
        Send to Announcement
      </button>
    </form>
  </div>
);

export default AnnouncementTab;