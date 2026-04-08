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
