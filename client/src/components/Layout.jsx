import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaGraduationCap, FaSignOutAlt, FaCircle, FaBullhorn, FaCloudUploadAlt, FaFolder, FaCalendarAlt, FaUser, FaHome, FaLayerGroup, FaComments, FaEye, FaBell, FaFileAlt } from 'react-icons/fa';

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

    // ── Compact pill-style nav ──
    const pillStyle = (tabName) => ({
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        height: '34px', padding: '0 0.75rem',
        borderRadius: '8px', border: 'none', cursor: 'pointer',
        fontSize: '0.82rem', fontWeight: '600',
        fontFamily: "'Inter', system-ui, sans-serif",
        background: activeTab === tabName ? '#ea580c' : 'transparent',
        color: activeTab === tabName ? 'white' : '#475569',
        transition: 'all 0.15s ease', whiteSpace: 'nowrap',
    });

    const hdrStyle = {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 1.25rem', height: '56px',
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 100,
    };

    return (
        <>
            <header className="glass-header" style={hdrStyle}>
                {/* Logo */}
                <div className="logo-area" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <div style={{ background: '#fff7ed', padding: '0.3rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaGraduationCap size={22} color="#ea580c" />
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ea580c', letterSpacing: '-0.5px' }}>DeptHub</span>
                </div>

                {/* Desktop Nav - Center */}
                <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className="desktop-nav">
                    {user?.role === 'BATCH' ? (
                        <>
                            <button onClick={() => navigate('/batch?tab=folders')} style={pillStyle('folders')}>Folders</button>
                            <button onClick={() => navigate('/batch?tab=notices')} style={pillStyle('notices')}>Notices</button>
                            <button onClick={() => navigate('/batch?tab=updates')} style={pillStyle('updates')}>Updates</button>
                            <button onClick={() => navigate('/batch?tab=routine')} style={pillStyle('routine')}>Routine</button>
                            <button onClick={() => navigate('/batch?tab=feedback')} style={pillStyle('feedback')}>Feedback</button>
                        </>
                    ) : user?.role === 'TEACHER' ? (
                        <>
                            <button onClick={() => navigate('/teacher?tab=announcement')} style={pillStyle('announcement')}>Announce</button>
                            <button onClick={() => navigate('/teacher?tab=new-upload')} style={pillStyle('new-upload')}>Upload</button>
                            <button onClick={() => navigate('/teacher?tab=my-uploads')} style={pillStyle('my-uploads')}>Files</button>
                            <button onClick={() => navigate('/teacher?tab=notices')} style={pillStyle('notices')}>Notices</button>
                            <button onClick={() => navigate('/teacher?tab=routine')} style={pillStyle('routine')}>Routine</button>
                        </>
                    ) : user?.role === 'CHAIRMAN' ? (
                        <>
                            <button onClick={() => navigate('/chairman?tab=notices')} style={pillStyle('notices')}>Notices</button>
                            <button onClick={() => navigate('/chairman?tab=routine')} style={pillStyle('routine')}>Routine</button>
                            <button onClick={() => navigate('/chairman?tab=feedback')} style={pillStyle('feedback')}>Feedback</button>
                            <button onClick={() => navigate('/chairman?tab=supervision')} style={pillStyle('supervision')}>Supervision</button>
                        </>
                    ) : user?.role === 'COMPUTER_OPERATOR' ? (
                        <>
                            <button onClick={() => navigate('/operator?tab=home')} style={pillStyle('home')}>Home</button>
                            <button onClick={() => navigate('/operator?tab=notices')} style={pillStyle('notices')}>Notices</button>
                            <button onClick={() => navigate('/operator?tab=routine')} style={pillStyle('routine')}>Routine</button>
                            <button onClick={() => navigate('/operator?tab=batch')} style={pillStyle('batch')}>Batch</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => scrollToSection('home-hero')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#475569', padding: '0.4rem 0.6rem' }}>Home</button>
                            <button onClick={() => scrollToSection('services')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#475569', padding: '0.4rem 0.6rem' }}>Services</button>
                            <button onClick={() => scrollToSection('contact')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#475569', padding: '0.4rem 0.6rem' }}>Contact</button>
                        </>
                    )}
                </nav>

                {/* Right: User Area */}
                <div className="user-area" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {/* Hamburger for Mobile */}
                    <button
                        className="mobile-toggle"
                        onClick={toggleMenu}
                        style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#1e293b', padding: '0.25rem' }}
                    >
                        ☰
                    </button>

                    <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {user ? (
                            <>
                                <div
                                    onClick={goToProfile}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                                        padding: '0.25rem 0.5rem 0.25rem 0.75rem', borderRadius: '50px',
                                        transition: 'all 0.15s', border: '1px solid #e2e8f0',
                                    }}
                                    className="user-profile-trigger"
                                >
                                    <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.8rem', color: '#1e293b' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'capitalize' }}>{user.role ? user.role.toLowerCase().replace('_', ' ') : ''}</div>
                                    </div>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 'bold', fontSize: '0.85rem',
                                    }}>
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                        padding: '0.35rem 0.7rem', borderRadius: '8px',
                                        background: '#fef2f2', color: '#ef4444',
                                        border: '1px solid #fecaca', fontWeight: '600',
                                        fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                                >
                                    <FaSignOutAlt size={12} />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.35rem', opacity: showLoginButtons ? 1 : 0, pointerEvents: showLoginButtons ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}>
                                <button onClick={() => navigate('/staff-login')} className="btn-secondary" style={{ height: '32px', fontSize: '0.78rem', padding: '0 0.75rem' }}>
                                    Faculty
                                </button>
                                <button onClick={() => navigate('/batch-login')} className="btn-primary" style={{ height: '32px', fontSize: '0.78rem', padding: '0 0.75rem' }}>
                                    Student
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
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/chairman?tab=supervision'); }} className="mobile-nav-link">Supervision</button>
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
                <div style={{ width: '80%', height: '1px', background: '#e2e8f0', margin: '0.5rem 0' }}></div>
                {!user && (
                    <>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/batch-login'); }} className="btn-primary" style={{ width: '80%', height: '40px' }}>Student Login</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/staff-login'); }} className="btn-secondary" style={{ width: '80%', height: '40px', marginTop: '0.5rem' }}>Faculty Login</button>
                    </>
                )}
                {user && (
                    <button onClick={goToProfile} className="mobile-nav-link" style={{ color: '#ea580c' }}>Go to Dashboard</button>
                )}
            </div>
        </>
    );
};


export const Footer = () => (
    <footer style={{
        padding: '0.75rem 1.25rem', textAlign: 'center',
        background: 'white', borderTop: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem',
    }}>
        <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: 0 }}>© 2026 DeptHub · University Platform</p>
        <div className="status-indicator" title="System Operational">
            <FaCircle size={7} color="#22c55e" />
            <span style={{ fontSize: '0.72rem' }}>Online</span>
        </div>
    </footer>
);

export const Layout = ({ children }) => {
    return (
        <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main className="main-content fade-in" style={{ flex: 1, width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
                {children}
            </main>
            <Footer />
        </div>
    );
};
