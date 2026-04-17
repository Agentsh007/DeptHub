import React from "react";
import { s } from "./teacherDashboardStyles";

const ProfileTab = ({
  user,
  editMode,
  setEditMode,
  editData,
  setEditData,
  updateProfile,
}) => {
  return (
    <div style={s.outerCard}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2 style={{ ...s.sectionTitle, marginBottom: "0.25rem" }}>
            Teacher Profile
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
            Manage your account details.
          </p>
        </div>
        {!editMode && (
          <button
            onClick={() => {
              setEditData({
                full_name: user.name,
                email: user.email,
                department: user.department || "",
              });
              setEditMode(true);
            }}
            style={s.declineBtn}
          >
            Edit Profile
          </button>
        )}
      </div>

      {editMode ? (
        <form onSubmit={updateProfile}>
          <div
            className="chairman-profile-grid"
            style={{ marginBottom: "1.5rem" }}
          >
            <div>
              <label style={s.label}>Full Name</label>
              <input
                type="text"
                value={editData.full_name}
                onChange={(e) =>
                  setEditData({ ...editData, full_name: e.target.value })
                }
                style={s.input}
              />
            </div>
            <div>
              <label style={s.label}>Email Address</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                style={s.input}
              />
            </div>
            <div>
              <label style={s.label}>Department</label>
              <input
                type="text"
                value={editData.department}
                onChange={(e) =>
                  setEditData({ ...editData, department: e.target.value })
                }
                style={s.input}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" style={s.publishBtn}>
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              style={s.declineBtn}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="chairman-profile-grid">
          <div style={s.profileCard}>
            <label style={s.profileLabel}>Full Name</label>
            <div style={s.profileValue}>{user.name}</div>
          </div>
          <div style={s.profileCard}>
            <label style={s.profileLabel}>Email Address</label>
            <div style={s.profileValue}>{user.email}</div>
          </div>
          <div style={s.profileCard}>
            <label style={s.profileLabel}>Role</label>
            <div style={s.profileValue}>{user.role}</div>
          </div>
          <div style={s.profileCard}>
            <label style={s.profileLabel}>Department</label>
            <div style={s.profileValue}>{user.department || "ICE"}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab; 