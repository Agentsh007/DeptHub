// Start of: ./client\src\App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import StaffLogin from './pages/StaffLogin';
import BatchLogin from './pages/BatchLogin';
import ChairmanDashboard from './pages/ChairmanDashboard';
import ComputerOperatorDashboard from './pages/ComputerOperatorDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import BatchDashboard from './pages/BatchDashboard';
import BatchFiles from './pages/BatchFiles'; // Added back
import { Loader } from './components/UI';
import NetworkStatus from './components/NetworkStatus';

import './App.css';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader /></div>;

  if (!user) return <Navigate to="/" />;

  // Role check
  if (role) {
    const authorized = Array.isArray(role) ? role.includes(user.role) : user.role === role;
    if (!authorized) {
      // Handle redirect logic based on their actual role if they try accessing wrong route
      if (user.role === 'CHAIRMAN') return <Navigate to="/chairman" />;
      if (user.role === 'CHAIRMAN') return <Navigate to="/chairman" />;
      if (user.role === 'COMPUTER_OPERATOR') return <Navigate to="/operator" />;
      if (user.role === 'TEACHER') return <Navigate to="/teacher" />;
      if (user.role === 'BATCH') return <Navigate to="/batch" />;
      return <Navigate to="/" />;
    }
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <NetworkStatus />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/batch-login" element={<BatchLogin />} />

          <Route
            path="/chairman"
            element={<PrivateRoute role="CHAIRMAN"><ChairmanDashboard /></PrivateRoute>}
          />
          <Route
            path="/operator"
            element={<PrivateRoute role="COMPUTER_OPERATOR"><ComputerOperatorDashboard /></PrivateRoute>}
          />
          <Route
            path="/teacher"
            element={<PrivateRoute role="TEACHER"><TeacherDashboard /></PrivateRoute>}
          />
          <Route
            path="/batch/*"
            element={<PrivateRoute role="BATCH"><BatchDashboard /></PrivateRoute>}
          />
          <Route
            path="/batch/teacher/:teacherId"
            element={<PrivateRoute role="BATCH"><BatchFiles /></PrivateRoute>}
          />
          {/* Fallback/Central Dashboard Route */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// Redirect /dashboard to specific role dashboard
const DashboardRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/" />;

  if (user.role === 'CHAIRMAN') return <Navigate to="/chairman" />;
  if (user.role === 'COMPUTER_OPERATOR') return <Navigate to="/operator" />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher" />;
  if (user.role === 'BATCH') return <Navigate to="/batch" />;

  return <Navigate to="/" />;
};

export default App;

// End of file

// Start of: ./client\src\main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components/ui-components.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

// End of file

// Start of: ./client\src\components\Layout.jsx
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaGraduationCap, FaSignOutAlt, FaCircle } from 'react-icons/fa';

export const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'folders';

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHeroVisible, setIsHeroVisible] = useState(true);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    useEffect(() => {
        if (location.pathname !== '/') {
            setIsHeroVisible(false);
            return;
        }

        const observerCallback = (entries) => {
            const [entry] = entries;
            setIsHeroVisible(entry.isIntersecting);
        };

        const observer = new IntersectionObserver(observerCallback, {
            root: null,
            threshold: 0,
            rootMargin: '0px 0px -50px 0px'
        });

        // Helper to safely observe
        const observeTarget = () => {
            const heroCta = document.getElementById('hero-cta');
            if (heroCta) {
                observer.observe(heroCta);
            } else {
                // If not found (rare race condition), fallback to visible
                setIsHeroVisible(true);
                // Retry once
                setTimeout(() => {
                    const el = document.getElementById('hero-cta');
                    if (el) observer.observe(el);
                }, 500);
            }
        };

        observeTarget();

        return () => observer.disconnect();
    }, [location.pathname]);

    const goToProfile = () => {
        setIsMobileMenuOpen(false);
        if (!user) return;
        if (user.role === 'TEACHER') navigate('/teacher?tab=profile');
        else if (user.role === 'CHAIRMAN') navigate('/chairman?tab=profile');
        else if (user.role === 'COMPUTER_OPERATOR') navigate('/operator?tab=profile');
        else if (user.role === 'BATCH') navigate('/batch?tab=profile');
    };

    const scrollToSection = (id) => {
        setIsMobileMenuOpen(false);
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const showLoginButtons = !user && (!isHeroVisible || location.pathname !== '/');

    const getLinkStyle = (tabName) => ({
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        color: activeTab === tabName ? 'var(--primary)' : 'var(--text-main)',
        borderBottom: activeTab === tabName ? '2px solid var(--primary)' : '2px solid transparent',
        paddingBottom: '2px',
        transition: 'all 0.2s'
    });

    return (
        <>
            <header className="glass-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="logo-area" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary-fade)', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaGraduationCap size={28} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', margin: 0, letterSpacing: '-0.5px' }}>DeptHub</h1>
                </div>

                {/* Desktop Nav */}
                <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-nav">
                    {user?.role === 'BATCH' ? (
                        <>
                            <button onClick={() => navigate('/batch?tab=folders')} className={activeTab === 'folders' ? '' : 'nav-link'} style={getLinkStyle('folders')}>Faculty Folders</button>
                            <button onClick={() => navigate('/batch?tab=notices')} className={activeTab === 'notices' ? '' : 'nav-link'} style={getLinkStyle('notices')}>Notices</button>
                            <button onClick={() => navigate('/batch?tab=updates')} className={activeTab === 'updates' ? '' : 'nav-link'} style={getLinkStyle('updates')}>Class Updates</button>
                            <button onClick={() => navigate('/batch?tab=routine')} className={activeTab === 'routine' ? '' : 'nav-link'} style={getLinkStyle('routine')}>Routine</button>
                            <button onClick={() => navigate('/batch?tab=feedback')} className={activeTab === 'feedback' ? '' : 'nav-link'} style={getLinkStyle('feedback')}>Feedback</button>
                        </>
                    ) : user?.role === 'TEACHER' ? (
                        <>
                            <button onClick={() => navigate('/teacher?tab=announcement')} className={activeTab === 'announcement' ? '' : 'nav-link'} style={getLinkStyle('announcement')}>Announcements</button>
                            <button onClick={() => navigate('/teacher?tab=new-upload')} className={activeTab === 'new-upload' ? '' : 'nav-link'} style={getLinkStyle('new-upload')}>New Upload</button>
                            <button onClick={() => navigate('/teacher?tab=my-uploads')} className={activeTab === 'my-uploads' ? '' : 'nav-link'} style={getLinkStyle('my-uploads')}>My Upload</button>
                            <button onClick={() => navigate('/teacher?tab=notices')} className={activeTab === 'notices' ? '' : 'nav-link'} style={getLinkStyle('notices')}>Notices</button>
                            <button onClick={() => navigate('/teacher?tab=routine')} className={activeTab === 'routine' ? '' : 'nav-link'} style={getLinkStyle('routine')}>Routine</button>
                        </>
                    ) : user?.role === 'CHAIRMAN' ? (
                        <>
                            <button onClick={() => navigate('/chairman?tab=notices')} className={activeTab === 'notices' ? '' : 'nav-link'} style={getLinkStyle('notices')}>Notices</button>
                            <button onClick={() => navigate('/chairman?tab=routine')} className={activeTab === 'routine' ? '' : 'nav-link'} style={getLinkStyle('routine')}>Routine</button>
                            <button onClick={() => navigate('/chairman?tab=feedback')} className={activeTab === 'feedback' ? '' : 'nav-link'} style={getLinkStyle('feedback')}>Feedback</button>
                        </>
                    ) : user?.role === 'COMPUTER_OPERATOR' ? (
                        <>
                            <button onClick={() => navigate('/operator?tab=home')} className={activeTab === 'home' ? '' : 'nav-link'} style={getLinkStyle('home')}>Home</button>
                            <button onClick={() => navigate('/operator?tab=notices')} className={activeTab === 'notices' ? '' : 'nav-link'} style={getLinkStyle('notices')}>Notices</button>
                            <button onClick={() => navigate('/operator?tab=routine')} className={activeTab === 'routine' ? '' : 'nav-link'} style={getLinkStyle('routine')}>Routine</button>
                            <button onClick={() => navigate('/operator?tab=batch')} className={activeTab === 'batch' ? '' : 'nav-link'} style={getLinkStyle('batch')}>Batch</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => scrollToSection('home-hero')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', color: 'var(--text-main)' }}>Home</button>
                            <button onClick={() => scrollToSection('services')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', color: 'var(--text-main)' }}>Services</button>
                            <button onClick={() => scrollToSection('contact')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', color: 'var(--text-main)' }}>Contact</button>
                        </>
                    )}
                </nav>

                <div className="user-area" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Hamburger for Mobile */}
                    <button
                        className="mobile-toggle"
                        onClick={toggleMenu}
                        style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-main)' }}
                    >
                        ☰
                    </button>

                    <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {user ? (
                            <>
                                <div
                                    onClick={goToProfile}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.4rem 0.8rem 0.4rem 1rem', borderRadius: '50px', transition: 'all 0.2s', background: 'var(--input-bg)', border: '1px solid #e2e8f0' }}
                                    className="user-profile-trigger"
                                >
                                    {/* ... profile content ... */}
                                    <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{user.role ? user.role.toLowerCase() : ''}</div>
                                    </div>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 2px 5px rgba(249, 115, 22, 0.3)' }}>
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </div>

                                <button
                                    onClick={logout}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.5rem 1rem', borderRadius: '50px',
                                        background: '#fef2f2', color: '#ef4444',
                                        border: '1px solid #fee2e2', fontWeight: '600',
                                        fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                                >
                                    <FaSignOutAlt size={14} />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', opacity: showLoginButtons ? 1 : 0, pointerEvents: showLoginButtons ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}>
                                <button onClick={() => navigate('/staff-login')} className="btn-secondary">
                                    Faculty
                                </button>
                                <button onClick={() => navigate('/batch-login')} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                    Student Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
                {user?.role === 'BATCH' ? (
                    <>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/batch?tab=folders'); }} className="mobile-nav-link">Faculty Folders</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/batch?tab=notices'); }} className="mobile-nav-link">Notices</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/batch?tab=updates'); }} className="mobile-nav-link">Class Updates</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/batch?tab=routine'); }} className="mobile-nav-link">Routine</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/batch?tab=feedback'); }} className="mobile-nav-link">Feedback</button>
                    </>
                ) : user?.role === 'TEACHER' ? (
                    <>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/teacher?tab=announcement'); }} className="mobile-nav-link">Announcements</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/teacher?tab=new-upload'); }} className="mobile-nav-link">New Upload</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/teacher?tab=my-uploads'); }} className="mobile-nav-link">My Upload</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/teacher?tab=notices'); }} className="mobile-nav-link">Notices</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/teacher?tab=routine'); }} className="mobile-nav-link">Routine</button>
                    </>
                ) : user?.role === 'CHAIRMAN' ? (
                    <>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/chairman?tab=notices'); }} className="mobile-nav-link">Notices</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/chairman?tab=routine'); }} className="mobile-nav-link">Routine</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/chairman?tab=feedback'); }} className="mobile-nav-link">Feedback</button>
                    </>
                ) : user?.role === 'COMPUTER_OPERATOR' ? (
                    <>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/operator?tab=home'); }} className="mobile-nav-link">Home</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/operator?tab=notices'); }} className="mobile-nav-link">Notices</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/operator?tab=routine'); }} className="mobile-nav-link">Routine</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/operator?tab=batch'); }} className="mobile-nav-link">Batch</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => scrollToSection('home-hero')} className="mobile-nav-link">Home</button>
                        <button onClick={() => scrollToSection('services')} className="mobile-nav-link">Services</button>
                        <button onClick={() => scrollToSection('contact')} className="mobile-nav-link">Contact</button>
                    </>
                )}
                <div style={{ width: '80%', height: '1px', background: '#e2e8f0', margin: '1rem 0' }}></div>
                {!user && (
                    <>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/batch-login'); }} className="btn-primary" style={{ width: '80%', padding: '1rem' }}>Student Login</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/staff-login'); }} className="btn-secondary" style={{ width: '80%', padding: '1rem', marginTop: '1rem' }}>Faculty Login</button>
                    </>
                )}
                {user && (
                    <button onClick={goToProfile} className="mobile-nav-link" style={{ color: 'var(--primary)' }}>Go to Dashboard</button>
                )}
            </div>
        </>
    );
};


export const Footer = () => (
    <footer className="glass-footer" style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ color: 'var(--text-dim)' }}>© 2026 UniResource Platform. All rights reserved.</p>
        <div className="status-indicator" title="System Operational" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
            <FaCircle size={10} color="#22c55e" />
            <span>Systems Online</span>
        </div>
    </footer>
);

export const Layout = ({ children }) => {
    return (
        <div className="app-layout">
            <Header />
            <main className="main-content fade-in" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

// End of file

// Start of: ./client\src\components\NetworkStatus.jsx
import React, { useState, useEffect } from 'react';
import { Toast } from './UI';

const NetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000); // Hide "Back Online" after 3s
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowToast(true);
            // Don't auto-hide "Offline" message, or maybe hide after a while but keep a small indicator?
            // For now, let's auto-hide to avoid annoyance, or keep it.
            // Let's keep it visible for 5s.
            setTimeout(() => setShowToast(false), 5000);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showToast) return null;

    return (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
            <div style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: isOnline ? '#10b981' : '#ef4444',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', gap: '10px'
            }}>
                <span style={{ fontSize: '1.2rem' }}>{isOnline ? 'wifi' : 'wifi_off'}</span>
                {isOnline ? 'You are back online' : 'You are offline. Showing cached data.'}
            </div>
        </div>
    );
};

export default NetworkStatus;

// End of file

// Start of: ./client\src\components\UI.jsx
import React from 'react';
import { FaExclamationCircle, FaTimes, FaCheckCircle } from 'react-icons/fa';

export const Loader = () => (
    <div className="loader-container">
        <div className="spinner"></div>
    </div>
);

export const Toast = ({ message, type = 'error', onClose }) => {
    if (!message) return null;
    const isSuccess = type === 'success';
    return (
        <div className={`toast-notification ${isSuccess ? 'toast-success' : 'toast-error'}`}>
            <div className="toast-icon">
                {isSuccess ? <FaCheckCircle /> : <FaExclamationCircle />}
            </div>
            <div>
                <strong>{isSuccess ? 'Success' : 'Error'}</strong>
                <div style={{ fontSize: '0.9rem' }}>{message}</div>
            </div>
            <button onClick={onClose}><FaTimes /></button>
        </div>
    );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '16px',
                width: '90%', maxWidth: '420px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0',
                animation: 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: isDanger ? '#fef2f2' : '#eff6ff',
                        color: isDanger ? '#ef4444' : 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', flexShrink: 0
                    }}>
                        {isDanger ? <FaExclamationCircle /> : <FaCheckCircle />}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                            {title || 'Are you sure?'}
                        </h3>
                        <p style={{ color: 'var(--text-dim)', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
                            {message}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn-primary"
                        style={{
                            background: isDanger ? '#ef4444' : 'var(--primary)',
                            padding: '0.6rem 1.2rem',
                            fontSize: '0.95rem',
                            boxShadow: isDanger ? '0 4px 6px -1px rgba(239, 68, 68, 0.3)' : undefined
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

// End of file

// Start of: ./client\src\context\AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        if (localStorage.getItem('token')) {
            try {
                const res = await axios.get('/auth/me');
                setUser(res.data);
            } catch (err) {
                console.error("Load User Error:", err);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUser();
    }, []);

    const loginUser = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            await loadUser();
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Login failed' };
        }
    };

    const loginBatch = async (username, password) => {
        try {
            const res = await axios.post('/auth/login-batch', { username, password });
            localStorage.setItem('token', res.data.token);
            await loadUser();
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Login failed' };
        }
    };

    const registerUser = async (formData) => {
        try {
            const res = await axios.post('/auth/register-public', formData);
            localStorage.setItem('token', res.data.token);
            await loadUser();
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, loginBatch, registerUser, logout, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// End of file

// Start of: ./client\src\pages\BatchDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaFolder, FaPaperPlane, FaBell, FaBullhorn, FaFilePdf, FaImage, FaUser } from 'react-icons/fa';

import { Layout } from '../components/Layout';
import { ConfirmModal } from '../components/UI';

const BatchDashboard = () => {
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const activeTab = searchParams.get('tab') || 'folders'; // folders(default), notices, feedback

    const [teachers, setTeachers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [myFeedback, setMyFeedback] = useState([]);
    const [sentMsg, setSentMsg] = useState('');

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const teachersRes = await axios.get(`/documents/batch/${user.id}/teachers`);
                setTeachers(teachersRes.data);

                const annRes = await axios.get('/announcements');
                setAnnouncements(annRes.data);

                const feedRes = await axios.get('/feedback');
                setMyFeedback(feedRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [user.id]);

    const sendFeedback = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/feedback', {
                message_content: feedbackMsg,
                is_anonymous: isAnonymous
            });
            setSentMsg('Feedback Sent to Head Authority!');
            setFeedbackMsg('');
            setIsAnonymous(false);

            // Refresh feedback list
            const feedRes = await axios.get('/feedback');
            setMyFeedback(feedRes.data);

            setTimeout(() => setSentMsg(''), 3000);
        } catch (err) {
            setSentMsg('Failed to send');
        }
    };

    const deleteFeedback = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Feedback?',
            message: 'Are you sure you want to delete this feedback message?',
            isDanger: true,
            onConfirm: async () => {
                try {
                    await axios.delete(`/feedback/${id}`);
                    const feedRes = await axios.get('/feedback');
                    setMyFeedback(feedRes.data);
                } catch (err) {
                    console.error(err);
                } finally {
                    closeConfirmModal();
                }
            }
        });
    };

    return (
        <Layout>
            <div className="container" style={{ maxWidth: '1000px', padding: '2rem 1rem' }}>
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={closeConfirmModal}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    isDanger={confirmModal.isDanger}
                />
                <div className="glass-panel fade-in" style={{ minHeight: '400px' }}>

                    {activeTab === 'profile' && (
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e2e8f0', maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ width: '80px', height: '80px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#2563eb' }}>
                                    <FaUser size={32} />
                                </div>
                                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{user.name}</h2>
                                <span className="badge badge-primary" style={{ padding: '0.4rem 1rem', fontSize: '1rem' }}>Batch Profile</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', textAlign: 'center' }}>
                                    <label style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Batch Name</label>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>{user.name}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', textAlign: 'center' }}>
                                    <label style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Account Type</label>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>Student Access</div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                To update batch details, please contact the Chairman.
                            </div>
                        </div>
                    )}

                    {activeTab === 'notices' && (
                        <div>
                            {announcements.filter(a => a.type === 'NOTICE' || a.type === 'ANNOUNCEMENT').length === 0 ? <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '1rem' }}>No new notices.</p> :
                                <div className="table-container">
                                    <table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                                                <th>Title</th>
                                                <th style={{ width: '80px', textAlign: 'center' }}>Files</th>
                                                <th style={{ width: '120px' }}>Date</th>
                                                <th style={{ width: '100px', textAlign: 'center' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {announcements.filter(a => a.type === 'NOTICE' || a.type === 'ANNOUNCEMENT').map((ann, index) => {
                                                const isPdf = ann.file_url && ann.file_url.toLowerCase().endsWith('.pdf');
                                                const isImage = ann.file_url && (ann.file_url.match(/\.(jpeg|jpg|gif|png)$/) != null);

                                                return (
                                                    <tr key={ann._id}>
                                                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                                        <td style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                                                            <FaBullhorn style={{ marginRight: '0.5rem', color: '#f97316' }} />
                                                            {ann.title}
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            {ann.file_url ? (
                                                                <a href={ann.file_url} target="_blank" rel="noopener noreferrer" className="file-icon" title="Download File">
                                                                    {isPdf ? <FaFilePdf size={20} /> : isImage ? <FaImage size={20} color="#3b82f6" /> : <FaFolder size={20} color="#64748b" />}
                                                                    <span>{isPdf ? 'PDF' : isImage ? 'IMG' : 'FILE'}</span>
                                                                </a>
                                                            ) : (
                                                                <span style={{ color: '#cbd5e1' }}>-</span>
                                                            )}
                                                        </td>
                                                        <td>{new Date(ann.created_at).toLocaleDateString()}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            {ann.file_url ? (
                                                                <a href={ann.file_url} target="_blank" rel="noopener noreferrer" className="action-link">
                                                                    View
                                                                </a>
                                                            ) : (
                                                                <span style={{ color: '#cbd5e1' }}>-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            }
                        </div>
                    )}

                    {activeTab === 'routine' && (
                        <div>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1.5rem', fontWeight: '600' }}>Class Routines</h3>
                            {announcements.filter(a => a.type === 'ROUTINE').length === 0 ? <p style={{ color: 'var(--text-dim)', textAlign: 'center' }}>No routines published yet.</p> :
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {announcements.filter(a => a.type === 'ROUTINE').map(routine => (
                                        <div key={routine._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>{routine.title}</h4>
                                                    <p style={{ color: '#475569', marginBottom: '1rem' }}>{routine.content}</p>
                                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                        Posted on: {new Date(routine.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    {routine.file_url && (
                                                        <a href={routine.file_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <FaFilePdf /> View Routine
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                        </div>
                    )}

                    {activeTab === 'folders' && (
                        <div>
                            <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Browse resources by Teacher. Folders appear only when content is uploaded.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                                {teachers.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No resources found yet.</p> :
                                    teachers.map(teacher => (
                                        <Link key={teacher._id} to={`/batch/teacher/${teacher._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div className="interactive-card" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #e2e8f0' }}>
                                                <div style={{ background: '#fef3c7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                                    <FaFolder size={28} color="#d97706" />
                                                </div>
                                                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main)' }}>{teacher.full_name}</div>
                                            </div>
                                        </Link>
                                    ))
                                }
                            </div>
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div style={{ maxWidth: '700px', margin: '0 auto', width: '100%' }}>
                            <div className="feedback-card" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)' }}>
                                <h3 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem', color: 'var(--text-main)' }}>Contact Head Authority</h3>

                                {sentMsg && (
                                    <div style={{ background: sentMsg.includes('Failed') ? '#fef2f2' : '#f0fdf4', color: sentMsg.includes('Failed') ? 'var(--error)' : 'var(--success)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '500' }}>
                                        {sentMsg}
                                    </div>
                                )}

                                <form onSubmit={sendFeedback}>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <textarea
                                            rows="6"
                                            placeholder="Write your message here... (e.g., Request for materials, Class scheduling issue)"
                                            value={feedbackMsg}
                                            onChange={e => setFeedbackMsg(e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid #cbd5e1',
                                                resize: 'vertical',
                                                minHeight: '150px',
                                                fontSize: '1rem',
                                                fontFamily: 'inherit',
                                                outline: 'none',
                                                transition: 'all 0.2s',
                                                background: 'var(--bg-main)',
                                                color: 'var(--text-main)'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = 'var(--primary)';
                                                e.target.style.boxShadow = '0 0 0 3px var(--primary-fade)';
                                                e.target.style.background = 'white';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#cbd5e1';
                                                e.target.style.boxShadow = 'none';
                                                e.target.style.background = '#f8fafc';
                                            }}
                                        ></textarea>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setIsAnonymous(!isAnonymous)}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '4px',
                                                border: `2px solid ${isAnonymous ? 'var(--primary)' : '#cbd5e1'}`,
                                                background: isAnonymous ? 'var(--primary)' : 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}>
                                                {isAnonymous && <FaPaperPlane size={10} color="white" style={{ transform: 'rotate(0deg)' }} />}
                                                {/* Using PaperPlane icon specifically or Check/Tick */}
                                            </div>
                                            <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-main)', userSelect: 'none' }}>Send Anonymously</span>
                                        </div>

                                        {/* You can add a character count or other info here if needed */}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            width: '100%',
                                            fontSize: '1.1rem',
                                            padding: '1rem'
                                        }}
                                    >
                                        <FaPaperPlane /> Send Feedback
                                    </button>
                                </form>
                            </div>

                            <div style={{ marginTop: '3rem' }}>
                                <h4 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-dim)', fontSize: '1.1rem', fontWeight: '600' }}>Previous Feedback History</h4>

                                {myFeedback.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                        <FaPaperPlane size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                        <p>No feedback sent yet.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {myFeedback.map(f => (
                                            <div key={f._id} className="history-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '500' }}>
                                                            {new Date(f.sent_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </span>
                                                        {f.is_anonymous && (
                                                            <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: 'var(--text-dim)', padding: '2px 8px', borderRadius: '4px', width: 'fit-content' }}>
                                                                Anonymous
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => deleteFeedback(f._id)}
                                                        style={{
                                                            background: '#fef2f2',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            padding: '0.4rem 0.8rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#fee2e2'}
                                                        onMouseLeave={(e) => e.target.style.background = '#fef2f2'}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                                <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{f.message_content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default BatchDashboard;

// End of file

// Start of: ./client\src\pages\BatchFiles.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { FaFilePdf, FaFileWord, FaFileImage, FaFile, FaArrowLeft, FaDownload, FaSearch } from 'react-icons/fa';
import { Layout } from '../components/Layout';

const BatchFiles = () => {
    const { user } = useContext(AuthContext);
    const { teacherId } = useParams();
    const [docs, setDocs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await axios.get(`/documents/batch/${user.id}/teacher/${teacherId}`);
                setDocs(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchDocs();
    }, [user.id, teacherId]);

    const getIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (ext === 'pdf') return <FaFilePdf color="#ef4444" />;
        if (['doc', 'docx'].includes(ext)) return <FaFileWord color="#3b82f6" />;
        if (['jpg', 'png', 'jpeg'].includes(ext)) return <FaFileImage color="#10b981" />;
        return <FaFile color="var(--text-dim)" />;
    };

    const filteredDocs = docs.filter(doc =>
        doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDownloadUrl = (doc) => {
        if (!doc.file_path) return '#';

        let url = doc.file_path;

        // Check if it's a Cloudinary URL
        if (url.includes('cloudinary.com')) {
            // Insert fl_attachment to force download and set filename
            const parts = url.split('/upload/');
            if (parts.length === 2) {
                // Extract filename without extension for the parameter, 
                // as Cloudinary adds extension based on original file if not specified, 
                // or we can specify it. Safeguard: just format it nicely.
                // Note: The original_filename typically includes extension.
                // We'll strip the extension for the attachment name param
                // so Cloudinary effectively does name.ext
                const nameWithoutExt = doc.original_filename.replace(/\.[^/.]+$/, "");
                const safeName = encodeURIComponent(nameWithoutExt);

                // Construct new URL with fl_attachment:name
                return `${parts[0]}/upload/fl_attachment:${safeName}/${parts[1]}`;
            }
        }

        // Fallback or local file (though local shouldn't happen with current config)
        if (!url.startsWith('http')) {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            return `${baseUrl}/${url.replace(/\\/g, '/')}`;
        }

        return url;
    };

    return (
        <Layout>
            <div className="container">
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Link to="/batch" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '0.5rem' }}>
                            <FaArrowLeft /> Back to Subject Folders
                        </Link>
                        <h2>Course Documents</h2>
                    </div>
                </header>

                <div className="glass-panel">
                    <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {filteredDocs.length === 0 ? <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>No files found matching your search.</p> :
                            filteredDocs.map(doc => (
                                <div key={doc._id} className="interactive-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{ fontSize: '1.75rem' }}>{getIcon(doc.original_filename)}</div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem' }}>{doc.original_filename}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Uploaded: {new Date(doc.upload_date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <a href={getDownloadUrl(doc)} className="btn-primary" style={{ padding: '0.6rem 1.2rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', borderRadius: '8px' }}>
                                        <FaDownload size={14} /> Download
                                    </a>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BatchFiles;

// End of file

// Start of: ./client\src\pages\BatchLogin.jsx
import React, { useState, useContext } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { Loader, Toast } from '../components/UI';

const BatchLogin = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const { loginBatch, user } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            navigate('/batch');
        }
    }, [user, navigate]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await loginBatch(formData.username, formData.password);
            if (res.success) {
                navigate('/batch');
            } else {
                setError(res.msg);
            }
        } catch (err) {
            setError('Connection failed. Please check your internet or try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Batch Login</h2>
                {error && <Toast message={error} onClose={() => setError('')} />}

                {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><Loader /><p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>Unlocking class resources...</p></div> :
                    <form onSubmit={onSubmit}>
                        <input type="text" placeholder="Batch Username (e.g. CSE-24)" name="username" value={formData.username} onChange={onChange} required />
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Batch Password"
                                name="password"
                                value={formData.password}
                                onChange={onChange}
                                required
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '38%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-dim)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '5px'
                                }}
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            Enter Class
                        </button>
                    </form>
                }
            </div>
        </div>
    );
};

export default BatchLogin;

// End of file

// Start of: ./client\src\pages\ChairmanDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Loader, Toast, ConfirmModal } from '../components/UI';
import { Layout } from '../components/Layout';
import { FaTrash, FaCheck, FaTimes, FaPaperclip, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const ChairmanDashboard = () => {
    const { user, loadUser, loading: authLoading } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('notices');

    // Data State
    const [notices, setNotices] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [feedback, setFeedback] = useState([]);

    // Derived state
    const [pendingNotices, setPendingNotices] = useState([]);
    const [publishedNotices, setPublishedNotices] = useState([]);
    const [pendingRoutines, setPendingRoutines] = useState([]);
    const [publishedRoutines, setPublishedRoutines] = useState([]);

    // UI State
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
    const [loading, setLoading] = useState(false);
    const [expandedFeedback, setExpandedFeedback] = useState({});
    const [expandedRoutineFeedback, setExpandedRoutineFeedback] = useState({});

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
        else navigate('?tab=notices', { replace: true });
    }, [location.search, navigate]);

    useEffect(() => {
        if (activeTab === 'notices' || activeTab === 'routine') fetchContent();
        if (activeTab === 'feedback') fetchFeedback();
    }, [activeTab]);

    const fetchContent = async () => {
        try {
            const res = await axios.get('/announcements');
            const allItems = res.data;
            const allNotices = allItems.filter(i => i.type === 'NOTICE');
            setNotices(allNotices);
            setPendingNotices(allNotices.filter(n => n.status === 'PENDING' || n.status === 'PENDING_APPROVAL'));
            setPublishedNotices(allNotices.filter(n => n.status === 'APPROVED' && !n.target_batch));
            const allRoutines = allItems.filter(i => i.type === 'ROUTINE');
            setRoutines(allRoutines);
            setPendingRoutines(allRoutines.filter(r => r.status === 'PENDING' || r.status === 'PENDING_APPROVAL'));
            setPublishedRoutines(allRoutines.filter(r => r.status === 'APPROVED'));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFeedback = async () => {
        try {
            const res = await axios.get('/feedback');
            setFeedback(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (id, status, type, feedback = '') => {
        try {
            await axios.put(`/announcements/${id}/status`, { status, feedback });
            showToast(`${type} ${status === 'APPROVED' ? 'Published' : 'Declined'}`, 'success');
            fetchContent();
        } catch (err) {
            console.error(err);
            showToast('Action failed', 'error');
        }
    };

    const deleteItem = (id, endpoint = 'announcements') => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Item?',
            message: 'Are you sure you want to delete this item?',
            isDanger: true,
            onConfirm: async () => {
                try {
                    await axios.delete(`/${endpoint}/${id}`);
                    showToast('Deleted successfully', 'success');
                    if (endpoint === 'announcements') fetchContent();
                    else fetchFeedback();
                } catch (err) {
                    showToast('Delete failed', 'error');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    if (authLoading) return <Loader />;
    if (!user || user.role !== 'CHAIRMAN') return null;

    /* ─── Shared Inline Styles ─── */
    const styles = {
        wrapper: {
            maxWidth: '900px',
            margin: '0 auto',
            padding: '1rem 1rem 4rem',
        },
        outerCard: {
            background: '#fff',
            borderRadius: '18px',
            border: '1px solid #ffe0cc',
            padding: '2rem 2rem 2.5rem',
            marginBottom: '2rem',
        },
        sectionTitle: {
            fontFamily: "'Georgia', serif",
            fontStyle: 'italic',
            fontSize: '1.35rem',
            color: '#ea580c',
            fontWeight: '600',
            marginBottom: '1.5rem',
        },
        noticeCard: {
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        },
        badge: (type) => ({
            display: 'inline-block',
            fontSize: '0.7rem',
            padding: '0.2rem 0.7rem',
            borderRadius: '20px',
            fontWeight: '600',
            border: '1px solid',
            background: type === 'batch' ? '#fff7ed' : '#f0fdf4',
            color: type === 'batch' ? '#ea580c' : '#16a34a',
            borderColor: type === 'batch' ? '#fed7aa' : '#bbf7d0',
        }),
        attachBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            background: 'linear-gradient(135deg, #fef3c7 0%, #ffedd5 100%)',
            color: '#b45309',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: '600',
            border: '1px solid #fcd34d',
            marginTop: '0.75rem',
        },
        publishBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 1.2rem',
            background: '#ea580c',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
        },
        declineBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 1.2rem',
            background: '#fff',
            color: '#1e293b',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '0.85rem',
            cursor: 'pointer',
        },
        deleteBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: 'transparent',
            color: '#ef4444',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '0.9rem',
        },
        readMoreBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 1.2rem',
            background: '#ea580c',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
        },
        feedbackToggleBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.5rem',
            background: 'linear-gradient(135deg, #fef3c7 0%, #ffedd5 100%)',
            color: '#b45309',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
            margin: '0.75rem 0',
        },
        profileCard: {
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
        },
        profileLabel: {
            display: 'block',
            fontSize: '0.8rem',
            color: '#94a3b8',
            marginBottom: '0.4rem',
            fontWeight: '500',
        },
        profileValue: {
            fontWeight: '700',
            color: '#1e293b',
            fontSize: '1rem',
        },
        editProfileBtn: {
            padding: '0.5rem 1.25rem',
            background: '#fff',
            color: '#1e293b',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '0.85rem',
            cursor: 'pointer',
        },
    };

    return (
        <Layout>
            <div style={styles.wrapper}>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    isDanger={confirmModal.isDanger}
                />

                {/* ═══════ NOTICES TAB ═══════ */}
                {activeTab === 'notices' && (
                    <>
                        {/* Pending Notices */}
                        <div style={styles.outerCard}>
                            <h2 style={styles.sectionTitle}>
                                Pending Notices{pendingNotices.length > 0 && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>●</span>}
                            </h2>

                            {pendingNotices.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No pending notices.</p>
                            ) : pendingNotices.map(item => (
                                <div key={item._id} style={styles.noticeCard}>
                                    <div className="chairman-card-row">
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>{item.title}</h4>
                                                <span style={styles.badge(item.target_batch ? 'batch' : 'global')}>
                                                    {item.target_batch ? item.target_batch.batch_name : 'Everyone'}
                                                </span>
                                            </div>
                                            <p style={{ color: '#475569', margin: '0 0 0.4rem', fontSize: '0.9rem', lineHeight: '1.5' }}>{item.content}</p>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                by: {item.author?.full_name} on {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                            {item.file_url && (
                                                <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={styles.attachBtn}>
                                                    <FaPaperclip /> View Attached Document
                                                </a>
                                            )}
                                        </div>
                                        <div className="chairman-action-btns">
                                            <button onClick={() => handleStatusUpdate(item._id, 'APPROVED', 'Notice')} style={styles.publishBtn}>Publish</button>
                                            <button onClick={() => {
                                                const fb = prompt('Reason for rejection?');
                                                if (fb !== null) handleStatusUpdate(item._id, 'REJECTED', 'Notice', fb);
                                            }} style={styles.declineBtn}>Decline</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Published Notices */}
                        <div style={styles.outerCard}>
                            <h2 style={styles.sectionTitle}>Published Notices</h2>
                            {publishedNotices.length === 0 ? (
                                <p style={{ color: '#94a3b8' }}>No published global notices.</p>
                            ) : publishedNotices.map(item => (
                                <div key={item._id} style={styles.noticeCard}>
                                    <div className="chairman-card-row">
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.3rem' }}>{item.title}</h4>
                                            <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0 0 0.4rem', lineHeight: '1.5' }}>{item.content}</p>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                To Everyone
                                            </div>
                                            {item.file_url && (
                                                <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={styles.attachBtn}>
                                                    <FaPaperclip /> View Attached Document
                                                </a>
                                            )}
                                        </div>
                                        <button onClick={() => deleteItem(item._id)} style={styles.deleteBtn}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ═══════ ROUTINE TAB ═══════ */}
                {activeTab === 'routine' && (
                    <>
                        {/* Pending Routines */}
                        <div style={styles.outerCard}>
                            <h2 style={styles.sectionTitle}>
                                Pending Routine{pendingRoutines.length > 0 && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>●</span>}
                            </h2>

                            {pendingRoutines.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No pending routines.</p>
                            ) : pendingRoutines.map(item => (
                                <div key={item._id} style={styles.noticeCard}>
                                    <div className="chairman-card-row">
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.3rem' }}>{item.title}</h4>
                                            <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0 0 0.4rem' }}>{item.content}</p>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                                by: {item.author?.full_name} on {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                            {item.file_url && (
                                                <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={styles.attachBtn}>
                                                    <FaPaperclip /> View Attached Document
                                                </a>
                                            )}

                                            {/* Feedback from Faculty toggle */}
                                            {item.routine_feedbacks && item.routine_feedbacks.length > 0 && (
                                                <>
                                                    <button
                                                        onClick={() => setExpandedRoutineFeedback(prev => ({ ...prev, [item._id]: !prev[item._id] }))}
                                                        style={styles.feedbackToggleBtn}
                                                    >
                                                        Feedback from Faculty {expandedRoutineFeedback[item._id] ? <FaChevronUp /> : <FaChevronDown />}
                                                    </button>
                                                    {expandedRoutineFeedback[item._id] && (
                                                        <div style={{ marginTop: '0.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                                            {item.routine_feedbacks.map((fb, idx) => (
                                                                <div key={idx} style={{ marginBottom: idx < item.routine_feedbacks.length - 1 ? '1rem' : 0 }}>
                                                                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{fb.from_user?.full_name || 'Faculty'}</div>
                                                                    <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.25rem 0 0', lineHeight: '1.5' }}>{fb.message}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <div className="chairman-action-btns">
                                            <button onClick={() => handleStatusUpdate(item._id, 'APPROVED', 'Routine')} style={styles.publishBtn}>Publish</button>
                                            <button onClick={() => {
                                                const fb = prompt('Reason for rejection?');
                                                if (fb !== null) handleStatusUpdate(item._id, 'REJECTED', 'Routine', fb);
                                            }} style={styles.declineBtn}>Decline</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Published Routines */}
                        <div style={styles.outerCard}>
                            <h2 style={styles.sectionTitle}>Published Routine</h2>
                            {publishedRoutines.length === 0 ? (
                                <p style={{ color: '#94a3b8' }}>No published routines.</p>
                            ) : publishedRoutines.map(item => (
                                <div key={item._id} style={styles.noticeCard}>
                                    <div className="chairman-card-row">
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.3rem' }}>{item.title}</h4>
                                            {item.file_url && (
                                                <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={styles.attachBtn}>
                                                    <FaPaperclip /> View Attached Document
                                                </a>
                                            )}
                                        </div>
                                        <button onClick={() => deleteItem(item._id)} style={styles.deleteBtn}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ═══════ FEEDBACK TAB ═══════ */}
                {activeTab === 'feedback' && (
                    <div style={styles.outerCard}>
                        <h2 style={{ ...styles.sectionTitle, textAlign: 'center', fontSize: '1.5rem' }}>Feedbacks</h2>
                        {feedback.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8' }}>No registered feedback.</p>
                        ) : feedback.map(item => (
                            <div key={item._id} style={styles.noticeCard}>
                                <div className="chairman-card-row">
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
                                            {item.is_anonymous ? 'Anonymous' : item.from_batch?.batch_name || 'Unknown Batch'}
                                        </h4>
                                        <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                                            {expandedFeedback[item._id] ? item.message_content : item.message_content?.slice(0, 120) + (item.message_content?.length > 120 ? '...' : '')}
                                        </p>
                                        {expandedFeedback[item._id] && (
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                                {new Date(item.sent_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => setExpandedFeedback(prev => ({ ...prev, [item._id]: !prev[item._id] }))}
                                            style={styles.readMoreBtn}
                                        >
                                            {expandedFeedback[item._id] ? 'Close' : 'Read More'}
                                        </button>
                                        <button onClick={() => deleteItem(item._id, 'feedback')} style={styles.deleteBtn}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ═══════ PROFILE TAB ═══════ */}
                {activeTab === 'profile' && (
                    <div style={styles.outerCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 style={{ ...styles.sectionTitle, marginBottom: '0.25rem' }}>Chairman Profile</h2>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Manage your account details.</p>
                            </div>
                            <button style={styles.editProfileBtn}>Edit Profile</button>
                        </div>

                        <div className="chairman-profile-grid">
                            <div style={styles.profileCard}>
                                <label style={styles.profileLabel}>Full Name</label>
                                <div style={styles.profileValue}>{user.name}</div>
                            </div>
                            <div style={styles.profileCard}>
                                <label style={styles.profileLabel}>Email Address</label>
                                <div style={styles.profileValue}>{user.email}</div>
                            </div>
                            <div style={styles.profileCard}>
                                <label style={styles.profileLabel}>Role</label>
                                <div style={styles.profileValue}>CHAIRMAN</div>
                            </div>
                            <div style={styles.profileCard}>
                                <label style={styles.profileLabel}>Department</label>
                                <div style={styles.profileValue}>{user.department || 'ICE'}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ChairmanDashboard;

// End of file

// Start of: ./client\src\pages\ComputerOperatorDashboard.jsx
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
            <div className="container" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={closeConfirmModal}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    isDanger={confirmModal.isDanger}
                />

                <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>Computer Operator</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Manage Dept. Notices, Routines & Batches</p>
                </header>

                <div className="glass-panel fade-in" style={{ minHeight: '500px' }}>

                    {/* HOME TAB */}
                    {activeTab === 'home' && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Welcome, {user.name}</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                                <div onClick={() => navigate('?tab=notices')} className="interactive-card" style={{ padding: '2rem', cursor: 'pointer', textAlign: 'center', background: '#fffbeb', border: '1px solid #fcd34d' }}>
                                    <FaBullhorn size={40} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                                    <h3>Notices</h3>
                                    <p style={{ color: 'var(--text-dim)' }}>Manage General Notices</p>
                                </div>
                                <div onClick={() => navigate('?tab=routine')} className="interactive-card" style={{ padding: '2rem', cursor: 'pointer', textAlign: 'center', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                    <FaCalendarAlt size={40} color="#3b82f6" style={{ marginBottom: '1rem' }} />
                                    <h3>Routines</h3>
                                    <p style={{ color: 'var(--text-dim)' }}>Manage Class Routines</p>
                                </div>
                                <div onClick={() => navigate('?tab=batch')} className="interactive-card" style={{ padding: '2rem', cursor: 'pointer', textAlign: 'center', background: '#f0fdf4', border: '1px solid #86efac' }}>
                                    <FaLayerGroup size={40} color="#22c55e" style={{ marginBottom: '1rem' }} />
                                    <h3>Batches</h3>
                                    <p style={{ color: 'var(--text-dim)' }}>Create & Manage Batches</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NOTICES TAB */}
                    {activeTab === 'notices' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                    <FaBullhorn color="#f59e0b" /> Manage Notices
                                </h3>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Post New Notice</h4>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                    <FaCalendarAlt color="#3b82f6" /> Manage Routines
                                </h3>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Upload New Routine</h4>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                    <FaLayerGroup color="#22c55e" /> Manage Batches
                                </h3>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Create New Batch</h4>
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

// End of file

// Start of: ./client\src\pages\Home.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaChalkboardTeacher, FaLayerGroup, FaShieldAlt, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { Layout } from '../components/Layout';

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const goToDashboard = () => {
        if (!user) return;
        if (user.role === 'CHAIRMAN') navigate('/chairman');
        else if (user.role === 'COORDINATOR') navigate('/coordinator');
        else if (user.role === 'COMPUTER_OPERATOR') navigate('/operator');
        else if (user.role === 'CC') navigate('/cc');
        else if (user.role === 'TEACHER') navigate('/teacher');
        else if (user.role === 'BATCH') navigate('/batch');
    };

    return (
        <Layout>
            <div className="home-page" style={{ overflowX: 'hidden' }}>

                {/* HERO SECTION */}
                <section id="home-hero" className="hero-section">
                    <div className="hero-bg-blob-1"></div>
                    <div className="hero-bg-blob-2"></div>

                    <div className="hero-container animate-fade-up">
                        <h1 className="hero-title" style={{ fontSize: '5rem', fontWeight: '900', color: '#ea580c', letterSpacing: '-2px', marginBottom: '1rem' }}>
                            DeptHub
                        </h1>
                        <p className="hero-subtitle" style={{ fontSize: '1.3rem', color: '#64748b', marginBottom: '2.5rem', fontStyle: 'italic' }}>
                            Connect, Coordinate, Create.
                        </p>
                        <div id="hero-cta" className="hero-btn-group animate-fade-up animate-delay-2">
                            {!user ? (
                                <>
                                    <button onClick={() => navigate('/staff-login')} className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '50px', background: '#ea580c', boxShadow: '0 10px 20px -5px rgba(234, 88, 12, 0.35)' }}>
                                        Staff Login
                                    </button>
                                    <button onClick={() => navigate('/batch-login')} className="btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '50px' }}>
                                        Batch Login
                                    </button>
                                </>
                            ) : (
                                <button onClick={goToDashboard} className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px', background: '#ea580c', boxShadow: '0 10px 20px -5px rgba(234, 88, 12, 0.35)' }}>
                                    Go to Dashboard <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* SERVICES SECTION */}
                <section id="services" className="section-padding" style={{ background: '#ffffff' }}>
                    <div className="container" style={{ maxWidth: '1100px' }}>
                        <div className="section-header animate-fade-up animate-delay-1">
                            <h2 className="section-title">Our Services</h2>
                            <p className="section-subtitle">Designed to make your daily activities for the university life simplified.</p>
                        </div>

                        <div className="services-grid">
                            {/* Service 1 */}
                            <div className="service-card animate-fade-up animate-delay-1">
                                <div className="service-icon-wrapper" style={{ background: '#dbeafe', color: '#2563eb' }}>
                                    <FaChalkboardTeacher />
                                </div>
                                <h3 className="service-title">Academic Management</h3>
                                <p className="service-desc">Empowering teachers and chairmen with tools to manage coursework, schedules, and departmental operations seamlessly.</p>
                            </div>

                            {/* Service 2 */}
                            <div className="service-card animate-fade-up animate-delay-2">
                                <div className="service-icon-wrapper" style={{ background: '#ffedd5', color: '#ea580c' }}>
                                    <FaLayerGroup />
                                </div>
                                <h3 className="service-title">Resource Sharing</h3>
                                <p className="service-desc">A unified hub for students to access study materials, assignments, and important documents uploaded by faculty.</p>
                            </div>

                            {/* Service 3 */}
                            <div className="service-card animate-fade-up animate-delay-3">
                                <div className="service-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
                                    <FaShieldAlt />
                                </div>
                                <h3 className="service-title">Secure Access</h3>
                                <p className="service-desc">Role-based authentication ensures data privacy and security for all users, from students to administrators.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CONTACT SECTION */}
                <section id="contact" className="section-padding" style={{ background: '#1e293b', color: 'white' }}>
                    <div className="container" style={{ maxWidth: '1000px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
                            <div className="animate-fade-up">
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'white' }}>Get in Touch</h2>
                                <p style={{ color: '#94a3b8', marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                    Have questions about the platform? Reach out to our administrative team for support and inquiries.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div className="contact-item">
                                        <div className="contact-icon-circle">
                                            <FaEnvelope />
                                        </div>
                                        <div>
                                            <div className="contact-label">Email Us</div>
                                            <div className="contact-value">support@depthub.edu</div>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <div className="contact-icon-circle">
                                            <FaPhone />
                                        </div>
                                        <div>
                                            <div className="contact-label">Call Us</div>
                                            <div className="contact-value">+1 (555) 123-4567</div>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <div className="contact-icon-circle">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div>
                                            <div className="contact-label">Visit Us</div>
                                            <div className="contact-value">University Campus, Admin Block A</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="contact-form-card animate-fade-up animate-delay-2">
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Your Name</label>
                                        <input type="text" placeholder="John Doe" className="contact-input" />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Email Address</label>
                                        <input type="email" placeholder="john@example.com" className="contact-input" />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Message</label>
                                        <textarea rows="4" placeholder="How can we help you?" className="contact-input" style={{ resize: 'vertical' }}></textarea>
                                    </div>
                                    <button className="btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: '600', fontSize: '1rem', background: '#ea580c' }}>Send Message</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </Layout>
    );
};

export default Home;

// End of file

// Start of: ./client\src\pages\StaffLogin.jsx
import React, { useState, useContext } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { Loader, Toast } from '../components/UI';

const StaffLogin = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '', password: '', confirmPassword: '', full_name: '', role: 'TEACHER', secret_code: '', department: ''
    });
    const [error, setError] = useState('');
    const { loginUser, registerUser, user } = useContext(AuthContext);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            if (user.role === 'CHAIRMAN') navigate('/chairman');
            else if (user.role === 'COMPUTER_OPERATOR') navigate('/operator');
            else if (user.role === 'TEACHER') navigate('/teacher');
            else if (user.role === 'BATCH') navigate('/batch');
        }
    }, [user, navigate]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // Trim whitespace from email and password
        const email = formData.email.trim();
        const password = formData.password.trim();
        const confirmPassword = formData.confirmPassword.trim();
        const full_name = formData.full_name.trim();
        const department = formData.department.trim();
        const secret_code = formData.secret_code.trim();

        try {
            let res;
            if (isRegister) {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }
                res = await registerUser({ ...formData, email, password, confirmPassword, full_name, department, secret_code });
            } else {
                res = await loginUser(email, password);
            }

            if (res.success) {
                // Redirection handled by useEffect
            } else {
                setError(res.msg);
            }
        } catch (err) {
            console.error('StaffLogin Error:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {isRegister ? 'Staff Registration' : 'Staff Login'}
                </h2>
                {error && <Toast message={error} onClose={() => setError('')} />}

                {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><Loader /><p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>Connecting to server...</p></div> :
                    <form onSubmit={onSubmit}>
                        {isRegister && (
                            <>
                                <input type="text" placeholder="Full Name" name="full_name" value={formData.full_name} onChange={onChange} required />
                                <select name="role" value={formData.role} onChange={onChange}>
                                    <option value="TEACHER">Teacher</option>
                                    <option value="CHAIRMAN">Chairman</option>
                                </select>
                                <input type="text" placeholder="Department (e.g. CSE)" name="department" value={formData.department} onChange={onChange} required />
                                <input type="text" placeholder={formData.role === 'CHAIRMAN' ? "Chairman Secret Code" : "Faculty Secret Code"} name="secret_code" value={formData.secret_code} onChange={onChange} required />
                            </>
                        )}
                        <input type="email" placeholder="Email Address" name="email" value={formData.email} onChange={onChange} required />
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={onChange}
                                required
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '38%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-dim)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '5px'
                                }}
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>

                        {isRegister && (
                            <div style={{ position: 'relative', marginTop: '1rem' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={onChange}
                                    required
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '38%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-dim)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '5px'
                                    }}
                                >
                                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                        )}

                        {isRegister && formData.confirmPassword && (
                            <div style={{
                                marginTop: '0.5rem',
                                marginBottom: '1rem',
                                fontSize: '0.85rem',
                                color: formData.password === formData.confirmPassword ? '#10b981' : '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                paddingLeft: '0.2rem'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: formData.password === formData.confirmPassword ? '#10b981' : '#ef4444'
                                }}></div>
                                {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                            </div>
                        )}

                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            {isRegister ? 'Register' : 'Login'}
                        </button>
                    </form>
                }

                <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    {isRegister ? 'Already have an account?' : 'Need an account?'}
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginLeft: '0.5rem', fontWeight: 'bold' }}>
                        {isRegister ? 'Login' : 'Register'}
                    </button>
                </p>
            </div>
        </div >
    );
};

export default StaffLogin;

// End of file

// Start of: ./client\src\pages\TeacherDashboard.jsx
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
            // Fetch feedback for routines pending feedback
            const pendingFeedbackRoutines = allRoutines.filter(r => r.status === 'PENDING_FEEDBACK');
            if (pendingFeedbackRoutines.length > 0) {
                let allFeedback = [];
                for (let r of pendingFeedbackRoutines) {
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

// End of file

