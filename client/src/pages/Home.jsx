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
        {/* HERO SECTION */}
        <section id="home-hero" className="hero-section">
          <div className="hero-bg-blob-1"></div>
          <div className="hero-bg-blob-2"></div>

          <div className="hero-container animate-fade-up">
            <h1
              className="hero-title"
              style={{
                fontSize: "10rem",
                fontWeight: "900",
                color: "#ea580c",
                letterSpacing: "-2px",
                marginBottom: "1rem",
              }}
            >
              DeptHub
            </h1>
            <p
              className="hero-subtitle"
              style={{
                fontSize: "1.3rem",
                color: "#64748b",
                marginBottom: "2.5rem",
                fontStyle: "italic",
              }}
            >
              Connect, Coordinate, Create.
            </p>
            <div
              id="hero-cta"
              className="hero-btn-group animate-fade-up animate-delay-2"
            >
              {!user ? (
                <>
                  <button
                    onClick={() => navigate("/staff-login")}
                    className="btn-primary"
                    style={{
                      padding: "1rem 2.5rem",
                      fontSize: "1.05rem",
                      borderRadius: "50px",
                      background: "#ea580c",
                      boxShadow: "0 10px 20px -5px rgba(234, 88, 12, 0.35)",
                    }}
                  >
                    Faculty/Staff Login
                  </button>
                  <button
                    onClick={() => navigate("/batch-login")}
                    className="btn-secondary"
                    style={{
                      padding: "1rem 2.5rem",
                      fontSize: "1.05rem",
                      borderRadius: "50px",
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
                    padding: "1rem 2.5rem",
                    fontSize: "1.1rem",
                    borderRadius: "50px",
                    background: "#ea580c",
                    boxShadow: "0 10px 20px -5px rgba(234, 88, 12, 0.35)",
                  }}
                >
                  Go to Dashboard{" "}
                  <FaArrowRight style={{ marginLeft: "0.5rem" }} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section
          id="services"
          className="section-padding"
          style={{ background: "#ffffff" }}
        >
          <div className="container" style={{ maxWidth: "1100px" }}>
            <div className="section-header animate-fade-up animate-delay-1">
              <h2 className="section-title">Our Services</h2>
              <p className="section-subtitle">
                Designed to make your daily activities for the university life
                simplified.
              </p>
            </div>

            <div className="services-grid">
              {/* Service 1 */}
              <div className="service-card animate-fade-up animate-delay-1">
                <div
                  className="service-icon-wrapper"
                  style={{ background: "#dbeafe", color: "#2563eb" }}
                >
                  <FaChalkboardTeacher />
                </div>
                <h3 className="service-title">Academic Management</h3>
                <p className="service-desc">
                  Empowering teachers and chairmen with tools to manage
                  coursework, schedules, and departmental operations seamlessly.
                </p>
              </div>

              {/* Service 2 */}
              <div className="service-card animate-fade-up animate-delay-2">
                <div
                  className="service-icon-wrapper"
                  style={{ background: "#ffedd5", color: "#ea580c" }}
                >
                  <FaLayerGroup />
                </div>
                <h3 className="service-title">Resource Sharing</h3>
                <p className="service-desc">
                  A unified hub for students to access study materials,
                  assignments, and important documents uploaded by faculty.
                </p>
              </div>

              {/* Service 3 */}
              <div className="service-card animate-fade-up animate-delay-3">
                <div
                  className="service-icon-wrapper"
                  style={{ background: "#dcfce7", color: "#16a34a" }}
                >
                  <FaShieldAlt />
                </div>
                <h3 className="service-title">Secure Access</h3>
                <p className="service-desc">
                  Role-based authentication ensures data privacy and security
                  for all users, from students to administrators.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section
          id="contact"
          className="section-padding"
          style={{ background: "#1e293b", color: "white" }}
        >
          <div className="container" style={{ maxWidth: "1000px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "4rem",
              }}
            >
              <div className="animate-fade-up">
                <h2
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "700",
                    marginBottom: "1.5rem",
                    color: "white",
                  }}
                >
                  Get in Touch
                </h2>
                <p
                  style={{
                    color: "#94a3b8",
                    marginBottom: "2.5rem",
                    fontSize: "1.1rem",
                    lineHeight: "1.6",
                  }}
                >
                  Have questions about the platform? Reach out to our
                  administrative team for support and inquiries.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
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
                      <div className="contact-value">
                        University Campus, Admin Block A
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="contact-form-card animate-fade-up animate-delay-2">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        color: "#cbd5e1",
                      }}
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="contact-input"
                    />
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        color: "#cbd5e1",
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="contact-input"
                    />
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        color: "#cbd5e1",
                      }}
                    >
                      Message
                    </label>
                    <textarea
                      rows="4"
                      placeholder="How can we help you?"
                      className="contact-input"
                      style={{ resize: "vertical" }}
                    ></textarea>
                  </div>
                  <button
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "1rem",
                      borderRadius: "12px",
                      fontWeight: "600",
                      fontSize: "1rem",
                      background: "#ea580c",
                    }}
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
