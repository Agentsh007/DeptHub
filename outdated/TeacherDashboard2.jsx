import React, { useState, useEffect, useContext } from "react";
import axios from "../utils/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Loader, ConfirmModal } from "../components/UI";
import { useLocation, useNavigate } from "react-router-dom";
import { s } from "../components/TeacherDashboard/teacherDashboardStyles";
// import { getFileIcon } from "../components/TeacherDashboard/getFileIcon"; // only needed if used directly

import AnnouncementTab from "../components/TeacherDashboard/AnnouncementTab";
import NewUploadTab from "../components/TeacherDashboard/NewUploadTab";
import MyUploadsTab from "../components/TeacherDashboard/MyUploadsTab";
import NoticesTab from "../components/TeacherDashboard/NoticesTab";
import RoutineTab from "../components/TeacherDashboard/RoutineTab"; // ← create similarly
import ProfileTab from "../components/TeacherDashboard/ProfileTab"; // ← create similarly
import NoticeDetailModal from "../components/TeacherDashboard/NoticeDetailModal";

const TeacherDashboard = () => {
  const { user, loadUser, loading: authLoading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("new-upload");
  const [batches, setBatches] = useState([]);
  const [myDocs, setMyDocs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Peer feedback states
  const [peerFeedbackText, setPeerFeedbackText] = useState({});
  const [peerFeedbackSending, setPeerFeedbackSending] = useState({});
  const [peerFeedbackSent, setPeerFeedbackSent] = useState({});
  const [feedbackList, setFeedbackList] = useState([]);

  // Profile
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    full_name: "",
    email: "",
    department: "",
  });

  // Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDanger: false,
  });

  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

  // Notices
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeAudience, setNoticeAudience] = useState("Everyone");
  const [selectedNotice, setSelectedNotice] = useState(null);

    const openNotice = (notice) => setSelectedNotice(notice);
  const closeNotice = () => setSelectedNotice(null);
  // My Uploads
  const [openBatchFolder, setOpenBatchFolder] = useState(null);

  // ─── URL Tab Sync ───
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
    else navigate("?tab=announcement", { replace: true });
  }, [location.search, navigate]);

  // ─── Fetch Functions (unchanged) ───
  const fetchBatches = async () => {
    try {
      const res = await axios.get("/batches");
      setBatches(res.data);
      if (res.data.length > 0 && !selectedBatch)
        setSelectedBatch(res.data[0]._id);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchMyDocs = async () => {
    try {
      const res = await axios.get("/documents/my-uploads");
      setMyDocs(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchNotices = async () => {
    try {
      const res = await axios.get("/announcements");
      setNotices(res.data.filter((n) => n.type === "NOTICE"));
    } catch (err) {
      console.error(err);
    }
  };
  const fetchRoutines = async () => {
     try {
      const res = await axios.get("/announcements");
      const allRoutines = res.data.filter((n) => n.type === "ROUTINE");
      setRoutines(allRoutines);

      // Fetch feedback for ALL PENDING_FEEDBACK routines (own + peers)
      const needsFeedback = allRoutines.filter(
        (r) => r.status === "PENDING_FEEDBACK",
      );
      if (needsFeedback.length > 0) {
        let allFeedback = [];
        for (let r of needsFeedback) {
          try {
            const fbRes = await axios.get(
              `/feedback?target_announcement_id=${r._id}`,
            );
            allFeedback = [...allFeedback, ...fbRes.data];
          } catch (e) {
            console.error(e);
          }
        }
        setFeedbackList(allFeedback);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "new-upload" || activeTab === "announcement")
      fetchBatches();
    if (activeTab === "my-uploads") fetchMyDocs();
    if (activeTab === "notices") fetchNotices();
    if (activeTab === "routine") fetchRoutines();
  }, [activeTab]);

  // ─── All handlers (handleUpload, handleRoutineUpload, etc.) ───
  // Copy ALL your handler functions exactly as they were (I kept them 100% unchanged)

  const handleUpload = async (e) => {
     e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_batch_id", selectedBatch);
    setLoading(true);
    setMsg("");
    try {
      await axios.post(
        `/documents/upload?target_batch_id=${selectedBatch}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setMsg("File Uploaded Successfully");
      setFile(null);
    } catch {
      setMsg("Upload Failed");
    } finally {
      setLoading(false);
    }
  };
  const handleRoutineUpload = async (status) => {
    if (!file) {
      alert("Please select a file.");
      return;
    }
    const msg = document.getElementById("routineMsg").value;
    if (!msg) {
      alert("Please enter routine details.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", "Routine");
    formData.append("content", msg);
    formData.append("type", "ROUTINE");
    formData.append("status", status);

    setLoading(true);
    try {
      await axios.post("/announcements", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Routine submitted successfully!");
      setFile(null);
      document.getElementById("routineMsg").value = "";
      document.getElementById("routineFile").value = "";
      fetchRoutines();
    } catch {
      alert("Failed to send routine");
    } finally {
      setLoading(false);
    }
  };
  const sendToChairman = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to send this routine to the Chairman for final approval?",
      )
    )
      return;
    try {
      await axios.put(`/announcements/${id}/status`, {
        status: "PENDING_APPROVAL",
      });
      alert("Routine sent to Chairman for approval!");
      fetchRoutines();
    } catch (err) {
      console.error(err);
      alert("Failed to send for approval");
    }
  };
  const handleClassUpdate = async (e) => {
     e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const message = e.target.message.value;
      const title = e.target.title_display?.value || "Announcement";
      await axios.post("/announcements", {
        title,
        content: message,
        type: "ANNOUNCEMENT",
        target_batch: selectedBatch,
      });
      setMsg("Announcement Sent Successfully");
      e.target.reset();
    } catch {
      setMsg("Failed to send");
    } finally {
      setLoading(false);
    }
  };
  const handleNoticeSubmit = async (e) => {
   e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const formData = new FormData();
      formData.append("title", e.target.noticeTitle.value);
      formData.append("content", e.target.noticeContent.value);
      formData.append("type", "NOTICE");
      formData.append("target_audience", noticeAudience);
      if (e.target.noticeFile.files[0])
        formData.append("file", e.target.noticeFile.files[0]);
      await axios.post("/announcements", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Notice sent for approval!");
      e.target.reset();
      setNoticeAudience("Everyone");
      setShowNoticeForm(false);
      fetchNotices();
    } catch {
      alert("Failed to submit notice");
    } finally {
      setLoading(false);
    }
  };
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put("/auth/profile", editData);
      if (res.data.success) {
        alert("Profile Updated.");
        setEditMode(false);
        await loadUser();
      }
    } catch {
      alert("Update failed");
    }
  };
  const submitPeerFeedback = async (routineId) => {
    const text = peerFeedbackText[routineId]?.trim();
    if (!text) return alert("Please write your feedback first.");

    setPeerFeedbackSending((prev) => ({ ...prev, [routineId]: true }));
    try {
      await axios.post("/feedback", {
        message_content: text,
        target_announcement: routineId,
      });
      // Mark as sent and clear the input
      setPeerFeedbackSent((prev) => ({ ...prev, [routineId]: true }));
      setPeerFeedbackText((prev) => ({ ...prev, [routineId]: "" }));
      fetchRoutines(); // refresh to show updated feedback count
    } catch {
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setPeerFeedbackSending((prev) => ({ ...prev, [routineId]: false }));
    }
  };
  const deleteFeedback = async (id) => {
   if (!window.confirm("Delete this feedback?")) return;
    try {
      await axios.delete(`/feedback/${id}`);
      fetchRoutines();
    } catch {
      alert("Failed");
    }
  };
  const deleteRoutine = async (id) => {
    if (!window.confirm("Delete this routine?")) return;
    try {
      await axios.delete(`/announcements/${id}`);
      fetchRoutines();
    } catch {
      alert("Failed");
    }
  };
  const deleteDoc = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete File?",
      message: "Permanently delete this file?",
      isDanger: true,
      onConfirm: async () => {
        try {
          await axios.delete(`/documents/${id}`);
          fetchMyDocs();
        } catch {
          alert("Delete failed");
        } finally {
          closeConfirmModal();
        }
      },
    });
  };
 



  if (authLoading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "100vh",
          alignItems: "center",
        }}
      >
        <Loader />
      </div>
    );
  if (!user) return null;

  // Grouped docs (same as original)
  const groupedDocs = myDocs.reduce((acc, doc) => {
    const batchName = doc.target_batch?.batch_name || "General";
    if (!acc[batchName]) acc[batchName] = [];
    acc[batchName].push(doc);
    return acc;
  }, {});
  const batchNames = Object.keys(groupedDocs);

  const pendingRoutines = routines.filter(
    (r) =>
      (r.status === "PENDING_APPROVAL" || r.status === "PENDING_FEEDBACK") &&
      r.author?._id === user.id,
  );
  const publishedRoutines = routines.filter((r) => r.status === "APPROVED");
  const peerReviewRoutines = routines.filter(
    (r) => r.status === "PENDING_FEEDBACK" && r.author?._id !== user.id,
  );

  return (
    <Layout>
      <div style={s.wrapper}>
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          isDanger={confirmModal.isDanger}
        />

        {activeTab === "announcement" && (
          <AnnouncementTab
            batches={batches}
            selectedBatch={selectedBatch}
            setSelectedBatch={setSelectedBatch}
            handleClassUpdate={handleClassUpdate}
            msg={msg}
            loading={loading}
          />
        )}

        {activeTab === "new-upload" && (
          <NewUploadTab
            batches={batches}
            selectedBatch={selectedBatch}
            setSelectedBatch={setSelectedBatch}
            file={file}
            setFile={setFile}
            handleUpload={handleUpload}
            msg={msg}
            loading={loading}
          />
        )}

        {activeTab === "my-uploads" && (
          <MyUploadsTab
            groupedDocs={groupedDocs}
            batchNames={batchNames}
            openBatchFolder={openBatchFolder}
            setOpenBatchFolder={setOpenBatchFolder}
            deleteDoc={deleteDoc}
          />
        )}

        {activeTab === "notices" && (
          <NoticesTab
            notices={notices}
            showNoticeForm={showNoticeForm}
            setShowNoticeForm={setShowNoticeForm}
            noticeAudience={noticeAudience}
            setNoticeAudience={setNoticeAudience}
            handleNoticeSubmit={handleNoticeSubmit}
            loading={loading}
            user={user}
            openNotice={openNotice}
            fetchNotices={fetchNotices}
          />
        )}

        {activeTab === "routine" && (
          <RoutineTab
            file={file}
            setFile={setFile}
            loading={loading}
            handleRoutineUpload={handleRoutineUpload}
            routines={routines}
            peerReviewRoutines={peerReviewRoutines}
            pendingRoutines={pendingRoutines}
            publishedRoutines={publishedRoutines}
            feedbackList={feedbackList}
            peerFeedbackText={peerFeedbackText}
            setPeerFeedbackText={setPeerFeedbackText}
            peerFeedbackSending={peerFeedbackSending}
            peerFeedbackSent={peerFeedbackSent}
            submitPeerFeedback={submitPeerFeedback}
            deleteFeedback={deleteFeedback}
            deleteRoutine={deleteRoutine}
            sendToChairman={sendToChairman}
            user={user}
          />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            user={user}
            editMode={editMode}
            setEditMode={setEditMode}
            editData={editData}
            setEditData={setEditData}
            updateProfile={updateProfile}
          />
        )}
        {selectedNotice && (
          <NoticeDetailModal notice={selectedNotice} onClose={closeNotice} />
        )}
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
