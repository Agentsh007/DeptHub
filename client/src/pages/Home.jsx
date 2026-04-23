import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaChalkboardTeacher,
  FaLayerGroup,
  FaShieldAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaFileAlt,
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { Layout } from "../components/Layout";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const goToDashboard = () => {
    if (!user) return;
    if (user.role === "CHAIRMAN") navigate("/chairman");
    else if (user.role === "COORDINATOR") navigate("/coordinator");
    else if (user.role === "COMPUTER_OPERATOR") navigate("/operator");
    else if (user.role === "CC") navigate("/cc");
    else if (user.role === "TEACHER") navigate("/teacher");
    else if (user.role === "BATCH") navigate("/batch");
  };

  return (
    <Layout>
      <div className="home-page" style={{ overflowX: "hidden" }}>
        {/* ═══ HERO — DARK NAVY ═══ */}
        <section id="home-hero" className="hero-section">
          <div className="hero-bg-blob-1"></div>
          <div className="hero-bg-blob-2"></div>

          <div className="hero-container animate-fade-up">
            <div className="hero-badge">🎓 University Department Platform</div>
            <h1 className="hero-title" style={{ fontSize: '6rem', fontWeight: '900', color: 'white', letterSpacing: '-2px', marginBottom: '0.75rem' }}>
              DeptHub
            </h1>
            <div className="hero-accent-line"></div>
            <p className="hero-subtitle" style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '2rem', fontStyle: 'italic', fontFamily: "'Georgia', serif" }}>
              Connect, Coordinate, Create.
            </p>
            <div id="hero-cta" className="hero-btn-group animate-fade-up animate-delay-2">
              {!user ? (
                <>
                  <button
                    onClick={() => navigate("/staff-login")}
                    className="btn-primary"
                    style={{
                      height: '44px', padding: '0 2rem', fontSize: '0.95rem',
                      borderRadius: '10px', background: '#ea580c',
                      boxShadow: '0 8px 20px -4px rgba(234, 88, 12, 0.4)',
                    }}
                  >
                    Faculty / Staff Login
                  </button>
                  <button
                    onClick={() => navigate("/batch-login")}
                    className="btn-secondary"
                    style={{
                      height: '44px', padding: '0 2rem', fontSize: '0.95rem',
                      borderRadius: '10px', background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.25)', color: 'white',
                    }}
                  >
                    Batch Login
                  </button>
                </>
              ) : (
                <button
                  onClick={goToDashboard}
                  className="btn-primary"
                  style={{
                    height: '44px', padding: '0 2rem', fontSize: '0.95rem',
                    borderRadius: '10px', background: '#ea580c',
                    boxShadow: '0 8px 20px -4px rgba(234, 88, 12, 0.4)',
                  }}
                >
                  Go to Dashboard <FaArrowRight style={{ marginLeft: '0.4rem' }} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ═══ STATS STRIP ═══ */}
        <div className="stats-strip">
          {[
            { icon: <FaUsers size={18} color="#ea580c" />, num: "5+", label: "Faculty" },
            { icon: <FaLayerGroup size={18} color="#3b82f6" />, num: "2", label: "Batches" },
            { icon: <FaFileAlt size={18} color="#16a34a" />, num: "5+", label: "Documents" },
            { icon: <FaCalendarAlt size={18} color="#f59e0b" />, num: "2", label: "Routines" },
          ].map((s, i) => (
            <div key={i} className="stat-item animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ marginBottom: '0.35rem' }}>{s.icon}</div>
              <div className="stat-number">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ═══ SERVICES ═══ */}
        <section id="services" className="section-padding" style={{ background: '#ffffff' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <div className="section-header animate-fade-up animate-delay-1">
              <h2 className="section-title">What We Offer</h2>
              <p className="section-subtitle">
                Tools designed for modern university departments.
              </p>
            </div>

            <div className="services-grid">
              <div className="service-card animate-fade-up animate-delay-1">
                <div className="service-icon-wrapper" style={{ background: '#dbeafe', color: '#2563eb' }}>
                  <FaChalkboardTeacher />
                </div>
                <h3 className="service-title">Academic Management</h3>
                <p className="service-desc">
                  Manage coursework, schedules, and departmental operations seamlessly.
                </p>
              </div>

              <div className="service-card animate-fade-up animate-delay-2">
                <div className="service-icon-wrapper" style={{ background: '#ffedd5', color: '#ea580c' }}>
                  <FaLayerGroup />
                </div>
                <h3 className="service-title">Resource Sharing</h3>
                <p className="service-desc">
                  Unified hub for study materials, assignments, and documents.
                </p>
              </div>

              <div className="service-card animate-fade-up animate-delay-3">
                <div className="service-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <FaShieldAlt />
                </div>
                <h3 className="service-title">Secure Access</h3>
                <p className="service-desc">
                  Role-based authentication for students, faculty, and admins.
                </p>
              </div>

              <div className="service-card animate-fade-up animate-delay-2">
                <div className="service-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <FaCalendarAlt />
                </div>
                <h3 className="service-title">Routine Builder</h3>
                <p className="service-desc">
                  Interactive grid editor for class schedules with PDF generation.
                </p>
              </div>

              <div className="service-card animate-fade-up animate-delay-3">
                <div className="service-icon-wrapper" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                  <FaUsers />
                </div>
                <h3 className="service-title">Supervision</h3>
                <p className="service-desc">
                  Chairman dashboard for monitoring today's classes and cancellations.
                </p>
              </div>

              <div className="service-card animate-fade-up animate-delay-4">
                <div className="service-icon-wrapper" style={{ background: '#fce7f3', color: '#db2777' }}>
                  <FaFileAlt />
                </div>
                <h3 className="service-title">Notice System</h3>
                <p className="service-desc">
                  Publish and manage department notices with approval workflow.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CONTACT ═══ */}
        <section id="contact" className="section-padding" style={{ background: '#1e293b', color: 'white' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
              <div className="animate-fade-up">
                <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}>Get in Touch</h2>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Have questions? Reach out to our administrative team.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div className="contact-item">
                    <div className="contact-icon-circle"><FaEnvelope /></div>
                    <div>
                      <div className="contact-label">Email Us</div>
                      <div className="contact-value">support@depthub.edu</div>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon-circle"><FaPhone /></div>
                    <div>
                      <div className="contact-label">Call Us</div>
                      <div className="contact-value">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon-circle"><FaMapMarkerAlt /></div>
                    <div>
                      <div className="contact-label">Visit Us</div>
                      <div className="contact-value">University Campus, Admin Block A</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="contact-form-card animate-fade-up animate-delay-2">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '500' }}>Your Name</label>
                    <input type="text" placeholder="John Doe" className="contact-input" />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '500' }}>Email Address</label>
                    <input type="email" placeholder="john@example.com" className="contact-input" />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '500' }}>Message</label>
                    <textarea rows="3" placeholder="How can we help?" className="contact-input" style={{ resize: 'vertical', height: 'auto' }}></textarea>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ width: '100%', height: '40px', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', background: '#ea580c' }}
                  >
                    Send Message
                  </button>
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
