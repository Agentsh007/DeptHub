import { FaCloudUploadAlt } from "react-icons/fa";
import s from './teacherDashboardStyles'
const UploadZone = ({ id, file, onFileSelect }) => (
  <div
    onClick={() => document.getElementById(id).click()}
    style={s.uploadZone}
  >
    <div style={{ color: "#ea580c", marginBottom: "0.75rem" }}>
      <FaCloudUploadAlt size={48} />
    </div>
    {file ? (
      <div style={{ fontWeight: "600", color: "#1e293b" }}>{file.name}</div>
    ) : (
      <div style={{ color: "#1e293b", fontWeight: "600" }}>
        Click to browse file
      </div>
    )}
    <input
      id={id}
      type="file"
      onChange={onFileSelect}
      style={{ display: "none" }}
    />
  </div>
);

export default UploadZone;