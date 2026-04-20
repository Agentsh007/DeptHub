import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Loader, Toast, ConfirmModal } from '../components/UI';
import { FaBullhorn, FaCalendarAlt, FaLayerGroup, FaUser, FaTrash, FaPaperclip, FaPlus, FaCloudUploadAlt, FaHistory } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const ComputerOperatorDashboard = () => {
    const { user, loadUser, loading: authLoading } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');

    // Data States
    const [notices, setNotices] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [batches, setBatches] = useState([]);

    // Form States
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '' });
    const [routineForm, setRoutineForm] = useState({ title: '', content: '' });
    const [batchForm, setBatchForm] = useState({ batch_name: '', batch_username: '', batch_password: '' });
    const [file, setFile] = useState(null);

    // Profile Edit State
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ full_name: '', email: '', department: '' });

    // UI States
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const closeConfirmModal = () => setConfirmModal({ ...confirmModal, isOpen: false });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
        else navigate('?tab=home', { replace: true });
    }, [location.search, navigate]);

    useEffect(() => {
        if (activeTab === 'notices') fetchNotices();
        if (activeTab === 'routine') fetchRoutines();
        if (activeTab === 'batch') fetchBatches();
    }, [activeTab]);

    const fetchNotices = async () => {
        try {
            const res = await axios.get('/announcements');
            setNotices(res.data.filter(a => a.type === 'NOTICE'));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRoutines = async () => {
        try {
            const res = await axios.get('/announcements');
            setRoutines(res.data.filter(a => a.type === 'ROUTINE' && (a.status === 'APPROVED' || a.author?._id === user.id)));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/batches');
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const postAnnouncement = async (e, type, formState, setFormState, fetchFn) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', formState.title);
            formData.append('content', formState.content);
            formData.append('type', type);
            if (file) formData.append('file', file);

            await axios.post('/announcements', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast(`${type === 'NOTICE' ? 'Notice' : 'Routine'} Posted Successfully`, 'success');
            setFormState({ title: '', content: '' });
            setFile(null);
            fetchFn();
        } catch (err) {
            console.error(err);
            showToast(`Failed to post ${type.toLowerCase()}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const createBatch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/batches', batchForm);
            showToast('Batch Created Successfully!', 'success');
            setBatchForm({ batch_name: '', batch_username: '', batch_password: '' });
            fetchBatches();
        } catch (err) {
            showToast(err.response?.data?.msg || 'Error creating batch', 'error');
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = (id, endpoint, fetchFn, itemName) => {
        setConfirmModal({
            isOpen: true,
            title: `Delete ${itemName}?`,
            message: `Are you sure you want to delete this ${itemName}?`,
            isDanger: true,
            onConfirm: async () => {
                try {
                    await axios.delete(`/${endpoint}/${id}`);
                    showToast(`${itemName} deleted`, 'success');
                    fetchFn();
                } catch (err) {
                    showToast(`Failed to delete ${itemName}`, 'error');
                } finally {
                    closeConfirmModal();
                }
            }
        });
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('/auth/profile', editData);
            if (res.data.success) {
                showToast('Profile Updated', 'success');
                setEditMode(false);
                loadUser();
            }
        } catch (err) {
            showToast('Update failed', 'error');
        }
    };

    const deleteAccount = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Account?',
            message: 'Are you ABSOLUTELY SURE? This will delete your account permanently.',
            isDanger: true,
            onConfirm: async () => {
                try {
                    await axios.delete('/auth/profile');
                    window.location.href = '/';
                } catch (err) {
                    showToast('Delete failed', 'error');
                } finally {
                    closeConfirmModal();
                }
            }
        });
    };

    if (authLoading) return <Loader />;
    if (!user || user.role !== 'COMPUTER_OPERATOR') return null;

    return (
        <Layout>
            <div className="container" style={{ maxWidth: '1100px', paddingBottom: '3rem', padding: '0.75rem' }}>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={closeConfirmModal}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    isDanger={confirmModal.isDanger}
                />

                <div className="glass-panel fade-in" style={{ minHeight: '400px' }}>

                    {/* HOME TAB */}
                    {activeTab === 'home' && (
                        <div style={{ padding: '1.25rem 0.5rem' }}>
                            <h2 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>Welcome, {user.name}</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: '1rem' }}>Manage department notices, routines & batches</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                                <div onClick={() => navigate('?tab=notices')} className="interactive-card" style={{ padding: '1.25rem', cursor: 'pointer', textAlign: 'center', background: '#fffbeb', border: '1px solid #fcd34d' }}>
                                    <FaBullhorn size={28} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                                    <h3 style={{ fontSize: '0.9rem' }}>Notices</h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Manage Notices</p>
                                </div>
                                <div onClick={() => navigate('?tab=routine')} className="interactive-card" style={{ padding: '1.25rem', cursor: 'pointer', textAlign: 'center', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                    <FaCalendarAlt size={28} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
                                    <h3 style={{ fontSize: '0.9rem' }}>Routines</h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Manage Routines</p>
                                </div>
                                <div onClick={() => navigate('?tab=batch')} className="interactive-card" style={{ padding: '1.25rem', cursor: 'pointer', textAlign: 'center', background: '#f0fdf4', border: '1px solid #86efac' }}>
                                    <FaLayerGroup size={28} color="#22c55e" style={{ marginBottom: '0.5rem' }} />
                                    <h3 style={{ fontSize: '0.9rem' }}>Batches</h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Create & Manage</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NOTICES TAB */}
                    {activeTab === 'notices' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontSize: '0.95rem', margin: 0 }}>
                                    <FaBullhorn color="#f59e0b" size={14} /> Notices
                                </h3>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '0.75rem', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>Post New Notice</h4>
                                <form onSubmit={(e) => postAnnouncement(e, 'NOTICE', noticeForm, setNoticeForm, fetchNotices)}>
                                    <input type="text" placeholder="Title" value={noticeForm.title} onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem' }} />
                                    <textarea rows="3" placeholder="Content..." value={noticeForm.content} onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem' }}></textarea>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <input type="file" onChange={e => setFile(e.target.files[0])} accept=".pdf,.doc,.docx,.jpg,.png" />
                                    </div>
                                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>{loading ? 'Posting...' : 'Publish Notice'}</button>
                                </form>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {notices.map(n => (
                                    <div key={n._id} style={{ background: 'white', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {n.title}
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: n.status === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                                                    color: n.status === 'APPROVED' ? '#166534' : '#991b1b',
                                                    border: '1px solid',
                                                    borderColor: n.status === 'APPROVED' ? '#86efac' : '#fca5a5'
                                                }}>
                                                    {n.status === 'APPROVED' ? 'PUBLISHED' : 'PENDING APPROVAL'}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>{n.content}</p>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{new Date(n.created_at).toLocaleDateString()} • {n.author?.full_name}</div>
                                            {n.file_url && <a href={n.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}><FaPaperclip /> Attachment</a>}
                                        </div>
                                        <button onClick={() => deleteItem(n._id, 'announcements', fetchNotices, 'Notice')} className="btn-icon" style={{ color: '#ef4444', background: '#fee2e2', padding: '0.5rem' }}><FaTrash /></button>
                                    </div>
                                ))}
                                {notices.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No notices found.</p>}
                            </div>
                        </div>
                    )}

                    {/* ROUTINE TAB */}
                    {activeTab === 'routine' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontSize: '0.95rem', margin: 0 }}>
                                    <FaCalendarAlt color="#3b82f6" size={14} /> Routines
                                </h3>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '0.75rem', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>Upload New Routine</h4>
                                <form onSubmit={(e) => postAnnouncement(e, 'ROUTINE', routineForm, setRoutineForm, fetchRoutines)}>
                                    <input type="text" placeholder="Title (e.g. Fall 2024 Final Routine)" value={routineForm.title} onChange={e => setRoutineForm({ ...routineForm, title: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem' }} />
                                    <textarea rows="3" placeholder="Description..." value={routineForm.content} onChange={e => setRoutineForm({ ...routineForm, content: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem' }}></textarea>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <input type="file" onChange={e => setFile(e.target.files[0])} accept=".pdf,.doc,.docx,.jpg,.png" />
                                    </div>
                                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>{loading ? 'Uploading...' : 'Upload Routine'}</button>
                                </form>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {routines.map(r => (
                                    <div key={r._id} style={{ background: 'white', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                                    {r.title}
                                                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: r.status === 'APPROVED' ? '#dcfce7' : '#fee2e2', color: r.status === 'APPROVED' ? '#166534' : '#991b1b', borderRadius: '4px', marginLeft: '0.5rem' }}>{r.status}</span>
                                                </div>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>{r.content}</p>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{new Date(r.created_at).toLocaleDateString()} • {r.author?.full_name}</div>
                                                {r.file_url && <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}><FaPaperclip /> View Routine</a>}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <button onClick={() => deleteItem(r._id, 'announcements', fetchRoutines, 'Routine')} className="btn-icon" style={{ color: '#ef4444', background: '#fee2e2', padding: '0.5rem' }}><FaTrash /></button>
                                            </div>
                                        </div>
                                        {r.feedback && r.author?._id === user.id && (
                                            <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#fff7ed', borderRadius: '8px', borderLeft: '3px solid #f97316' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#9a3412' }}>Chairman/Admin Feedback:</div>
                                                <div style={{ fontSize: '0.85rem', color: '#7c2d12' }}>{r.feedback}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {routines.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No routines uploaded.</p>}
                            </div>
                        </div>
                    )}

                    {/* BATCH TAB */}
                    {activeTab === 'batch' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontSize: '0.95rem', margin: 0 }}>
                                    <FaLayerGroup color="#22c55e" size={14} /> Batches
                                </h3>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '0.75rem', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>Create New Batch</h4>
                                <form onSubmit={createBatch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <input type="text" placeholder="Batch Name" value={batchForm.batch_name} onChange={e => setBatchForm({ ...batchForm, batch_name: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    <input type="text" placeholder="Username" value={batchForm.batch_username} onChange={e => setBatchForm({ ...batchForm, batch_username: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    <input type="text" placeholder="Password" value={batchForm.batch_password} onChange={e => setBatchForm({ ...batchForm, batch_password: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    <button type="submit" className="btn-primary" disabled={loading} style={{ gridColumn: '1/-1' }}>{loading ? 'Creating...' : 'Create Batch'}</button>
                                </form>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {batches.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No batches found.</p> :
                                    batches.map(batch => (
                                        <div key={batch._id} style={{ padding: '1rem', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span style={{ fontWeight: '600', color: 'var(--text-main)', marginRight: '1rem' }}>{batch.batch_name}</span>
                                                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>@{batch.batch_username}</span>
                                            </div>
                                            <button onClick={() => deleteItem(batch._id, 'batches', fetchBatches, 'Batch')} className="btn-icon" style={{ color: '#ef4444', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete Batch">
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Operator Profile</h2>
                                    <p style={{ color: 'var(--text-dim)' }}>Manage your account details.</p>
                                </div>
                                {!editMode && (
                                    <button onClick={() => { setEditData({ full_name: user.name, email: user.email, department: user.department || '' }); setEditMode(true); }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '10px' }}>
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {editMode ? (
                                <form onSubmit={updateProfile} style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '600px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label>
                                            <input type="text" value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                                            <input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Department</label>
                                            <input type="text" value={editData.department} onChange={e => setEditData({ ...editData, department: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button type="submit" className="btn-primary">Save Changes</button>
                                            <button type="button" onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                        <div className="profile-card-item">
                                            <label style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>FULL NAME</label>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user.name}</div>
                                        </div>
                                        <div className="profile-card-item">
                                            <label style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>EMAIL</label>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user.email}</div>
                                        </div>
                                        <div className="profile-card-item">
                                            <label style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>ROLE</label>
                                            <div><span className="badge badge-primary">{user.role}</span></div>
                                        </div>
                                        <div className="profile-card-item">
                                            <label style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>DEPARTMENT</label>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user.department || 'Not Specified'}</div>
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', color: '#ef4444', marginBottom: '1rem' }}>Danger Zone</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#991b1b' }}>Delete Account</div>
                                                <div style={{ fontSize: '0.9rem', color: '#b91c1c' }}>Permanently remove your account.</div>
                                            </div>
                                            <button onClick={deleteAccount} className="btn-icon" style={{ background: '#ef4444', color: 'white', padding: '0.75rem 1.5rem', width: 'auto', borderRadius: '8px' }}>Delete Account</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ComputerOperatorDashboard;
