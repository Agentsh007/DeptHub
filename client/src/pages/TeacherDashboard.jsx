import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Loader, ConfirmModal } from '../components/UI';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaFilePdf, FaTrash, FaFolder, FaPaperclip, FaFileImage, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFileCode, FaFileVideo, FaFileAudio, FaFileAlt } from 'react-icons/fa';

/* ─── Shared Inline Styles ─── */
const s = {
    wrapper: { maxWidth: '900px', margin: '0 auto', padding: '1rem 1rem 4rem' },
    outerCard: {
        background: '#fff', borderRadius: '18px', border: '1px solid #ffe0cc',
        padding: '2rem 2rem 2.5rem', marginBottom: '2rem',
    },
    sectionTitle: {
        fontFamily: "'Georgia', serif", fontStyle: 'italic', fontSize: '1.35rem',
        color: '#ea580c', fontWeight: '600', marginBottom: '1.5rem',
    },
    label: { display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' },
    input: {
        width: '100%', padding: '0.85rem 1rem', borderRadius: '10px',
        border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem',
        outline: 'none', boxSizing: 'border-box',
    },
    textarea: {
        width: '100%', padding: '0.85rem 1rem', borderRadius: '10px',
        border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem',
        resize: 'none', outline: 'none', boxSizing: 'border-box',
    },
    submitBtn: {
        display: 'block', width: '100%', maxWidth: '320px', margin: '1.5rem auto 0',
        padding: '0.85rem 2rem', background: '#ea580c', color: '#fff', border: 'none',
        borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
        textAlign: 'center',
    },
    uploadZone: {
        border: '2px dashed #fed7aa', background: '#fff7ed', borderRadius: '14px',
        padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
    },
    attachBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 1.25rem',
        background: 'linear-gradient(135deg, #fef3c7 0%, #ffedd5 100%)',
        color: '#b45309', borderRadius: '8px', textDecoration: 'none',
        fontSize: '0.85rem', fontWeight: '600', border: '1px solid #fcd34d',
        marginTop: '0.75rem',
    },
    batchBadge: (active) => ({
        display: 'inline-block', padding: '0.35rem 1.1rem', borderRadius: '8px',
        fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', border: 'none',
        background: active ? '#ea580c' : '#fff7ed', color: active ? '#fff' : '#ea580c',
        transition: 'all 0.2s',
    }),
    folderCard: {
        background: '#fff', borderRadius: '14px', border: '1px solid #f1f5f9',
        padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer', transition: 'all 0.2s',
    },
    deleteBtn: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '28px', height: '28px', background: 'transparent', color: '#ef4444',
        border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '0.8rem',
    },
    noticeCard: {
        background: '#fff', borderRadius: '14px', border: '1px solid #f1f5f9',
        padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    },
    publishBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.45rem 1.2rem', background: '#ea580c', color: '#fff', border: 'none',
        borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
    },
    declineBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.45rem 1.2rem', background: '#fff', color: '#1e293b',
        border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '500',
        fontSize: '0.85rem', cursor: 'pointer',
    },
    profileCard: {
        background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0',
    },
    profileLabel: { display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' },
    profileValue: { fontWeight: '700', color: '#1e293b', fontSize: '1rem' },
    feedbackToggle: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        padding: '0.6rem 1.5rem', background: '#fff', border: '1px solid #cbd5e1',
        borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
        margin: '0 auto',
    },
};

// Helper for file icons
const getFileIcon = (filename) => {
    if (!filename) return <FaFileAlt size={36} />;
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return <FaFilePdf size={36} color="#ef4444" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) return <FaFileImage size={36} color="#3b82f6" />;
    if (['doc', 'docx'].includes(ext)) return <FaFileWord size={36} color="#2563eb" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FaFileExcel size={36} color="#16a34a" />;
    if (['ppt', 'pptx'].includes(ext)) return <FaFilePowerpoint size={36} color="#d97706" />;
    if (['zip', 'rar', '7z', 'tar'].includes(ext)) return <FaFileArchive size={36} color="#9333ea" />;
    if (['mp4', 'mkv', 'avi', 'mov'].includes(ext)) return <FaFileVideo size={36} color="#be123c" />;
    if (['mp3', 'wav', 'ogg'].includes(ext)) return <FaFileAudio size={36} color="#db2777" />;
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(ext)) return <FaFileCode size={36} color="#4b5563" />;
    return <FaFileAlt size={36} color="#64748b" />;
};

const TeacherDashboard = () => {
    const { user, loadUser, loading: authLoading } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('new-upload');
    const [batches, setBatches] = useState([]);
    const [myDocs, setMyDocs] = useState([]);
    const [notices, setNotices] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    // Add these with your other state declarations
    const [peerFeedbackText, setPeerFeedbackText] = useState({}); // { [routineId]: 'text' }
    const [peerFeedbackSending, setPeerFeedbackSending] = useState({}); // { [routineId]: true/false }
    const [peerFeedbackSent, setPeerFeedbackSent] = useState({}); // { [routineId]: true }
    // Profile
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ full_name: '', email: '', department: '' });

    // Modal
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    // Feedback
    const [feedbackList, setFeedbackList] = useState([]);


    // Notices sub-view
    const [showNoticeForm, setShowNoticeForm] = useState(false);

    // My Uploads - open batch folder (null = show folder list)
    const [openBatchFolder, setOpenBatchFolder] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
        else navigate('?tab=announcement', { replace: true });
    }, [location.search, navigate]);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/batches');
            setBatches(res.data);
            if (res.data.length > 0 && !selectedBatch) setSelectedBatch(res.data[0]._id);
        } catch (err) { console.error(err); }
    };

    const fetchMyDocs = async () => {
        try { const res = await axios.get('/documents/my-uploads'); setMyDocs(res.data); }
        catch (err) { console.error(err); }
    };

    const fetchNotices = async () => {
        try { const res = await axios.get('/announcements'); setNotices(res.data.filter(n => n.type === 'NOTICE')); }
        catch (err) { console.error(err); }
    };

    const fetchRoutines = async () => {
        try {
            const res = await axios.get('/announcements');
            const allRoutines = res.data.filter(n => n.type === 'ROUTINE');
            setRoutines(allRoutines);

            // Fetch feedback for ALL PENDING_FEEDBACK routines (own + peers)
            const needsFeedback = allRoutines.filter(r => r.status === 'PENDING_FEEDBACK');
            if (needsFeedback.length > 0) {
                let allFeedback = [];
                for (let r of needsFeedback) {
                    try {
                        const fbRes = await axios.get(`/feedback?target_announcement_id=${r._id}`);
                        allFeedback = [...allFeedback, ...fbRes.data];
                    } catch (e) { console.error(e); }
                }
                setFeedbackList(allFeedback);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (activeTab === 'new-upload' || activeTab === 'announcement') fetchBatches();
        if (activeTab === 'my-uploads') fetchMyDocs();
        if (activeTab === 'notices') fetchNotices();
        if (activeTab === 'routine') fetchRoutines();
    }, [activeTab]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('target_batch_id', selectedBatch);
        setLoading(true); setMsg('');
        try {
            await axios.post(`/documents/upload?target_batch_id=${selectedBatch}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMsg('File Uploaded Successfully'); setFile(null);
        } catch (err) { setMsg('Upload Failed'); }
        finally { setLoading(false); }
    };

    const handleRoutineUpload = async (status) => {
        if (!file) { alert("Please select a file."); return; }
        const msg = document.getElementById('routineMsg').value;
        if (!msg) { alert("Please enter routine details."); return; }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', 'Routine');
        formData.append('content', msg);
        formData.append('type', 'ROUTINE');
        formData.append('status', status);

        setLoading(true);
        try {
            await axios.post('/announcements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Routine submitted successfully!');
            setFile(null);
            document.getElementById('routineMsg').value = '';
            document.getElementById('routineFile').value = '';
            fetchRoutines();
        } catch (err) { alert('Failed to send routine'); }
        finally { setLoading(false); }
    };

    const sendToChairman = async (id) => {
        if (!window.confirm('Are you sure you want to send this routine to the Chairman for final approval?')) return;
        try {
            await axios.put(`/announcements/${id}/status`, { status: 'PENDING_APPROVAL' });
            alert('Routine sent to Chairman for approval!');
            fetchRoutines();
        } catch (err) {
            console.error(err);
            alert('Failed to send for approval');
        }
    };

    const handleClassUpdate = async (e) => {
        e.preventDefault();
        setLoading(true); setMsg('');
        try {
            const message = e.target.message.value;
            const title = e.target.title_display?.value || 'Announcement';
            await axios.post('/announcements', { title, content: message, type: 'ANNOUNCEMENT', target_batch: selectedBatch });
            setMsg('Announcement Sent Successfully'); e.target.reset();
        } catch (err) { setMsg('Failed to send'); }
        finally { setLoading(false); }
    };

    const handleNoticeSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setMsg('');
        try {
            const formData = new FormData();
            formData.append('title', e.target.noticeTitle.value);
            formData.append('content', e.target.noticeContent.value);
            formData.append('type', 'NOTICE');
            formData.append('target_audience', e.target.audience.value);
            if (e.target.noticeFile.files[0]) formData.append('file', e.target.noticeFile.files[0]);
            await axios.post('/announcements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Notice sent for approval!'); e.target.reset(); setShowNoticeForm(false); fetchNotices();
        } catch (err) { alert('Failed to submit notice'); }
        finally { setLoading(false); }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('/auth/profile', editData);
            if (res.data.success) { alert('Profile Updated.'); setEditMode(false); await loadUser(); }
        } catch (err) { alert('Update failed'); }
    };
    const submitPeerFeedback = async (routineId) => {
        const text = peerFeedbackText[routineId]?.trim();
        if (!text) return alert('Please write your feedback first.');

        setPeerFeedbackSending(prev => ({ ...prev, [routineId]: true }));
        try {
            await axios.post('/feedback', {
                message_content: text,
                target_announcement: routineId
            });
            // Mark as sent and clear the input
            setPeerFeedbackSent(prev => ({ ...prev, [routineId]: true }));
            setPeerFeedbackText(prev => ({ ...prev, [routineId]: '' }));
            fetchRoutines(); // refresh to show updated feedback count
        } catch (err) {
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setPeerFeedbackSending(prev => ({ ...prev, [routineId]: false }));
        }
    };


    const deleteFeedback = async (id) => { if (!window.confirm('Delete this feedback?')) return; try { await axios.delete(`/feedback/${id}`); fetchRoutines(); } catch (err) { alert('Failed'); } };
    const deleteRoutine = async (id) => { if (!window.confirm('Delete this routine?')) return; try { await axios.delete(`/announcements/${id}`); fetchRoutines(); } catch (err) { alert('Failed'); } };
    const deleteDoc = (id) => {
        setConfirmModal({
            isOpen: true, title: 'Delete File?', message: 'Permanently delete this file?', isDanger: true,
            onConfirm: async () => { try { await axios.delete(`/documents/${id}`); fetchMyDocs(); } catch (err) { alert('Delete failed'); } finally { closeConfirmModal(); } }
        });
    };

    if (authLoading) return <div style={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><Loader /></div>;
    if (!user) return null;

    // Group uploads by batch for My Uploads tab
    const groupedDocs = myDocs.reduce((acc, doc) => {
        const batchName = doc.target_batch?.batch_name || 'General';
        if (!acc[batchName]) acc[batchName] = [];
        acc[batchName].push(doc);
        return acc;
    }, {});
    const batchNames = Object.keys(groupedDocs);

    // Routine helpers
    const pendingRoutines = routines.filter(r => (r.status === 'PENDING_APPROVAL' || r.status === 'PENDING_FEEDBACK') && r.author?._id === user.id);
    const publishedRoutines = routines.filter(r => r.status === 'APPROVED');
    // Routines from OTHER teachers that need peer review
    const peerReviewRoutines = routines.filter(
        r => r.status === 'PENDING_FEEDBACK' && r.author?._id !== user.id
    );

    return (
        <Layout>
            <div style={s.wrapper}>
                <ConfirmModal isOpen={confirmModal.isOpen} onClose={closeConfirmModal} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} isDanger={confirmModal.isDanger} />

                {/* ═══════ ANNOUNCEMENTS TAB ═══════ */}
                {activeTab === 'announcement' && (
                    <div style={s.outerCard}>
                        <h2 style={s.sectionTitle}>Target Batch</h2>
                        <form onSubmit={handleClassUpdate}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={s.input}>
                                    {batches.map(b => <option key={b._id} value={b._id}>{b.batch_name}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <input name="title_display" placeholder="Title/Subject" style={s.input} />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <textarea name="message" placeholder="Message..." rows="4" style={s.textarea} required></textarea>
                            </div>
                            {msg && <div style={{ textAlign: 'center', padding: '0.75rem', background: msg.includes('Success') ? '#dcfce7' : '#fee2e2', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{msg}</div>}
                            <button type="submit" style={s.submitBtn} disabled={loading}>Send to Announcement</button>
                        </form>
                    </div>
                )}

                {/* ═══════ NEW UPLOAD TAB ═══════ */}
                {activeTab === 'new-upload' && (
                    <div style={s.outerCard}>
                        <h2 style={s.sectionTitle}>Target Batch</h2>
                        {msg && <div style={{ textAlign: 'center', padding: '0.75rem', background: msg.includes('Success') ? '#dcfce7' : '#fee2e2', color: msg.includes('Success') ? '#166534' : '#991b1b', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{msg}</div>}
                        <form onSubmit={handleUpload}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={s.input}>
                                    {batches.map(b => <option key={b._id} value={b._id}>{b.batch_name}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={s.label}>Select Document</label>
                                <div onClick={() => document.getElementById('resFile').click()} style={s.uploadZone}>
                                    <div style={{ color: '#ea580c', marginBottom: '0.75rem' }}><FaCloudUploadAlt size={48} /></div>
                                    {file ? <div style={{ fontWeight: '600', color: '#1e293b' }}>{file.name}</div> : <div style={{ color: '#1e293b', fontWeight: '600' }}>Click to browse file</div>}
                                </div>
                                <input id="resFile" type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                            </div>
                            <button type="submit" style={s.submitBtn} disabled={loading}>Upload Resource</button>
                        </form>
                    </div>
                )}

                {/* ═══════ MY UPLOADS TAB ═══════ */}
                {activeTab === 'my-uploads' && (
                    <div style={s.outerCard}>
                        {!openBatchFolder ? (
                            /* ── Batch Folder List ── */
                            batchNames.length === 0 ? (
                                <p style={{ color: '#94a3b8', textAlign: 'center' }}>No uploads found.</p>
                            ) : (
                                <div className="teacher-folder-grid">
                                    {batchNames.map(name => (
                                        <div key={name} onClick={() => setOpenBatchFolder(name)} style={{ ...s.folderCard, cursor: 'pointer' }}>
                                            <div style={{ color: '#f59e0b', marginBottom: '0.5rem' }}><FaFolder size={40} /></div>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#ea580c' }}>{name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{groupedDocs[name].length} file(s)</div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            /* ── Documents inside a batch folder ── */
                            <>
                                <button onClick={() => setOpenBatchFolder(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#ea580c', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', marginBottom: '1.25rem', padding: 0 }}>← Back</button>
                                <h3 style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.1rem', marginBottom: '1.25rem' }}>{openBatchFolder}</h3>
                                {(groupedDocs[openBatchFolder] || []).length === 0 ? (
                                    <p style={{ color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>No files in this batch.</p>
                                ) : (
                                    <div className="teacher-folder-grid">
                                        {groupedDocs[openBatchFolder].map(doc => (
                                            <div key={doc._id} style={{ ...s.folderCard, position: 'relative' }}>
                                                <button onClick={() => deleteDoc(doc._id)} style={{ ...s.deleteBtn, position: 'absolute', top: '0.4rem', right: '0.4rem' }}><FaTrash size={10} /></button>
                                                <a href={doc.file_path} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                    <div style={{ marginBottom: '0.5rem' }}>{getFileIcon(doc.original_filename)}</div>
                                                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#ea580c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.original_filename}</div>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ═══════ NOTICES TAB ═══════ */}
                {activeTab === 'notices' && (
                    <>
                        {!showNoticeForm ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <h2 style={{ ...s.sectionTitle, marginBottom: 0 }}>Latest Notices</h2>
                                    <button onClick={() => setShowNoticeForm(true)} style={s.publishBtn}>Create Notice</button>
                                </div>
                                <div style={{ ...s.outerCard, padding: '0', overflow: 'hidden' }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>NO</th>
                                                    <th style={{ padding: '1.2rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>TITLE</th>
                                                    <th style={{ padding: '1.2rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>FILES</th>
                                                    <th style={{ padding: '1.2rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>DATE</th>
                                                    <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {notices.filter(n => n.status === 'APPROVED').map((notice, index) => (
                                                    <tr key={notice._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                        <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{index + 1}</td>
                                                        <td style={{ padding: '1rem', fontWeight: '500', color: '#1e293b', fontSize: '0.9rem' }}>{notice.title}</td>
                                                        <td style={{ padding: '1rem', textAlign: 'center' }}>{notice.file_url ? <FaFilePdf color="#ef4444" size={18} /> : '—'}</td>
                                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>{new Date(notice.created_at).toLocaleDateString()}</td>
                                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>{notice.file_url && <a href={notice.file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontWeight: '500', textDecoration: 'none', fontSize: '0.85rem' }}>View</a>}</td>
                                                    </tr>
                                                ))}
                                                {notices.filter(n => n.status === 'APPROVED').length === 0 && <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No notices found.</td></tr>}
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
                                        <div style={{ marginBottom: '1.25rem' }}><input name="noticeTitle" placeholder="Notice Title (e.g. Holi Holiday)" style={s.input} required /></div>
                                        <div style={{ marginBottom: '1.25rem' }}><textarea name="noticeContent" placeholder="Notice Details" rows="4" style={s.textarea} required></textarea></div>
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <label style={s.label}>Attach Document (PDF/Image - Optional)</label>
                                            <input name="noticeFile" type="file" accept=".pdf,.jpg,.png,.jpeg" style={{ fontSize: '0.9rem' }} />
                                        </div>
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <label style={s.label}>Select Audience</label>
                                            <select name="audience" style={s.input}>
                                                <option value="Everyone">Teacher/Student/Everyone</option>
                                                <option value="Teacher">Teacher Only</option>
                                                <option value="Student">Student Only</option>
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            <button type="submit" style={{ ...s.submitBtn, margin: 0 }} disabled={loading}>Send for Approval</button>
                                            <button type="button" onClick={() => setShowNoticeForm(false)} style={{ ...s.declineBtn, padding: '0.85rem 2rem' }}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                                <div style={s.outerCard}>
                                    <h2 style={s.sectionTitle}>⏳ Pending Notice</h2>
                                    {notices.filter(n => (n.status === 'PENDING' || n.status === 'PENDING_APPROVAL') && n.author?._id === user.id).length === 0 ? (
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No pending notices.</p>
                                    ) : notices.filter(n => (n.status === 'PENDING' || n.status === 'PENDING_APPROVAL') && n.author?._id === user.id).map(item => (
                                        <div key={item._id} style={s.noticeCard}>
                                            <div className="chairman-card-row">
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>{item.title}</h4>
                                                    <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0 0 0.4rem', lineHeight: '1.5' }}>{item.content}</p>
                                                    {item.file_url && <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={s.attachBtn}><FaPaperclip /> View Attached Document</a>}
                                                </div>
                                                <button onClick={() => { if (window.confirm('Delete this pending notice?')) { axios.delete(`/announcements/${item._id}`).then(() => fetchNotices()); } }} style={s.deleteBtn}><FaTrash /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* ═══════ ROUTINE TAB ═══════ */}
                {activeTab === 'routine' && (
                    <>
                        {/* Upload Routine */}
                        <div style={s.outerCard}>
                            <h2 style={s.sectionTitle}>Routine</h2>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <textarea name="msg" id="routineMsg" placeholder="Routine Details / Message..." rows="3" style={s.textarea} required></textarea>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={s.label}>Select Document</label>
                                    <div onClick={() => document.getElementById('routineFile').click()} style={s.uploadZone}>
                                        <div style={{ color: '#ea580c', marginBottom: '0.75rem' }}><FaCloudUploadAlt size={48} /></div>
                                        {file ? <div style={{ fontWeight: '600', color: '#1e293b' }}>{file.name}</div> : <div style={{ color: '#1e293b', fontWeight: '600' }}>Click to browse file</div>}
                                    </div>
                                    <input id="routineFile" type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.jpg,.png" />
                                </div>
                                <div className="teacher-routine-btns">
                                    <button type="button" onClick={() => handleRoutineUpload('PENDING_FEEDBACK')} style={s.declineBtn} disabled={loading}>Request Peer Feedback</button>
                                    <button type="button" onClick={() => handleRoutineUpload('PENDING_APPROVAL')} style={s.publishBtn} disabled={loading}>Send for Approval</button>
                                </div>
                            </form>
                        </div>

                        {/* ═══ PEER REVIEW SECTION — routines from other teachers ═══ */}
                        {peerReviewRoutines.length > 0 && (
                            <div style={s.outerCard}>
                                <h2 style={s.sectionTitle}>
                                    👥 Peer Review Requests
                                    <span style={{
                                        marginLeft: '0.75rem',
                                        background: '#fef3c7',
                                        color: '#b45309',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '999px'
                                    }}>
                                        {peerReviewRoutines.length} pending
                                    </span>
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                                    Your colleagues have requested feedback on their routines before sending to the Chairman.
                                </p>

                                {peerReviewRoutines.map(r => (
                                    <div key={r._id} style={{ ...s.noticeCard, borderLeft: '4px solid #f59e0b' }}>
                                        {/* Routine info */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                <h4 style={{ fontWeight: '700', color: '#1e293b', margin: 0 }}>{r.title}</h4>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    by {r.author?.full_name} · {new Date(r.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {r.content && (
                                                <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0.5rem 0' }}>{r.content}</p>
                                            )}
                                            {r.file_url && (
                                                <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={s.attachBtn}>
                                                    <FaPaperclip /> View Routine Document
                                                </a>
                                            )}
                                        </div>

                                        {/* Feedback already given by others */}
                                        {feedbackList.filter(f => f.target_announcement === r._id).length > 0 && (
                                            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>
                                                    Feedback so far:
                                                </div>
                                                {feedbackList.filter(f => f.target_announcement === r._id).map(f => (
                                                    <div key={f._id} style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.35rem' }}>
                                                        <strong>{f.from_user?.full_name || 'A colleague'}:</strong> {f.message_content}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Feedback input — hide if already submitted this session */}
                                        {peerFeedbackSent[r._id] ? (
                                            <div style={{
                                                padding: '0.75rem 1rem',
                                                background: '#dcfce7',
                                                borderRadius: '8px',
                                                color: '#166534',
                                                fontSize: '0.9rem',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                ✓ Your feedback was submitted successfully.
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                                                <textarea
                                                    rows="2"
                                                    placeholder="Write your feedback for this routine..."
                                                    value={peerFeedbackText[r._id] || ''}
                                                    onChange={e => setPeerFeedbackText(prev => ({ ...prev, [r._id]: e.target.value }))}
                                                    style={{
                                                        ...s.textarea,
                                                        flex: 1,
                                                        marginBottom: 0,
                                                        resize: 'vertical',
                                                        minHeight: '60px'
                                                    }}
                                                />
                                                <button
                                                    onClick={() => submitPeerFeedback(r._id)}
                                                    disabled={peerFeedbackSending[r._id] || !peerFeedbackText[r._id]?.trim()}
                                                    style={{
                                                        ...s.publishBtn,
                                                        padding: '0.6rem 1.25rem',
                                                        fontSize: '0.875rem',
                                                        whiteSpace: 'nowrap',
                                                        opacity: !peerFeedbackText[r._id]?.trim() ? 0.5 : 1
                                                    }}
                                                >
                                                    {peerFeedbackSending[r._id] ? 'Sending...' : '✉ Submit'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pending Routine / Routine for Approval */}
                        {pendingRoutines.length > 0 && (
                            <div style={s.outerCard}>
                                <h2 style={s.sectionTitle}>⏳ Routine for Approval</h2>
                                {pendingRoutines.map(r => (
                                    <div key={r._id} style={s.noticeCard}>
                                        <div className="chairman-card-row">
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h4 style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.3rem' }}>
                                                    {r.title}
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 'normal', marginLeft: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: r.status === 'PENDING_FEEDBACK' ? '#fef3c7' : '#fed7aa', color: r.status === 'PENDING_FEEDBACK' ? '#b45309' : '#c2410c' }}>
                                                        {r.status.replace('_', ' ')}
                                                    </span>
                                                </h4>
                                                {r.content && <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 0.5rem' }}>{r.content}</p>}
                                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    {r.file_url && <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={s.attachBtn}><FaPaperclip /> View Attached Document</a>}
                                                    {r.status === 'PENDING_FEEDBACK' && (
                                                        <button onClick={() => sendToChairman(r._id)} style={{ ...s.publishBtn, padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                                            Send to Chairman
                                                        </button>
                                                    )}
                                                </div>
                                                {/* Show feedback on this routine */}
                                                {feedbackList.filter(f => f.target_announcement === r._id).length > 0 && (
                                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '8px', borderLeft: '3px solid #0ea5e9' }}>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0369a1', marginBottom: '0.4rem' }}>Peer Feedback:</div>
                                                        {feedbackList.filter(f => f.target_announcement === r._id).map(f => (
                                                            <div key={f._id} style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                                                                <div><strong>{f.from_user?.full_name || 'Anonymous'}:</strong> {f.message_content}</div>
                                                                <button onClick={() => deleteFeedback(f._id)} style={s.deleteBtn}><FaTrash size={11} /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={() => deleteRoutine(r._id)} style={s.deleteBtn}><FaTrash /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Published / Approved Routines */}
                        <div style={s.outerCard}>
                            <h2 style={s.sectionTitle}>Published Routine</h2>
                            {publishedRoutines.length === 0 ? (
                                <p style={{ color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>No published routines yet.</p>
                            ) : publishedRoutines.map(r => (
                                <div key={r._id} style={s.noticeCard}>
                                    <h4 style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.3rem' }}>
                                        {r.title} {r.author?._id !== user.id && <span style={{ fontWeight: 'normal', color: '#64748b', fontSize: '0.85rem' }}>— by {r.author?.full_name}</span>}
                                    </h4>
                                    {r.content && <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 0.5rem' }}>{r.content}</p>}
                                    {r.file_url && <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={s.attachBtn}><FaPaperclip /> View Attached Document</a>}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ═══════ PROFILE TAB ═══════ */}
                {activeTab === 'profile' && (
                    <div style={s.outerCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 style={{ ...s.sectionTitle, marginBottom: '0.25rem' }}>Teacher Profile</h2>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Manage your account details.</p>
                            </div>
                            {!editMode && <button onClick={() => { setEditData({ full_name: user.name, email: user.email, department: user.department || '' }); setEditMode(true); }} style={s.declineBtn}>Edit Profile</button>}
                        </div>
                        {editMode ? (
                            <form onSubmit={updateProfile}>
                                <div className="chairman-profile-grid" style={{ marginBottom: '1.5rem' }}>
                                    <div><label style={s.label}>Full Name</label><input type="text" value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} style={s.input} /></div>
                                    <div><label style={s.label}>Email Address</label><input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} style={s.input} /></div>
                                    <div><label style={s.label}>Department</label><input type="text" value={editData.department} onChange={e => setEditData({ ...editData, department: e.target.value })} style={s.input} /></div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="submit" style={s.publishBtn}>Save Changes</button>
                                    <button type="button" onClick={() => setEditMode(false)} style={s.declineBtn}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div className="chairman-profile-grid">
                                <div style={s.profileCard}><label style={s.profileLabel}>Full Name</label><div style={s.profileValue}>{user.name}</div></div>
                                <div style={s.profileCard}><label style={s.profileLabel}>Email Address</label><div style={s.profileValue}>{user.email}</div></div>
                                <div style={s.profileCard}><label style={s.profileLabel}>Role</label><div style={s.profileValue}>{user.role}</div></div>
                                <div style={s.profileCard}><label style={s.profileLabel}>Department</label><div style={s.profileValue}>{user.department || 'ICE'}</div></div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default TeacherDashboard;
