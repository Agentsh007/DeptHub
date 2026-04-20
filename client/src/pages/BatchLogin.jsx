import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash, FaArrowLeft, FaGraduationCap, FaFolder, FaCalendarAlt, FaComments } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { Loader, Toast } from "../components/UI";

const BatchLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { loginBatch, user } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  React.useEffect(() => {
    if (user) {
      navigate("/batch");
    }
  }, [user, navigate]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginBatch(formData.username, formData.password);
      if (res.success) {
        navigate("/batch");
      } else {
        setError(res.msg);
      }
    } catch (err) {
      setError(
        "Connection failed. Please check your internet or try again later.",
      );
      err.response && console.error("Batch Login Error:", err.response.data);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <FaFolder size={14} />, text: "Access faculty resources" },
    { icon: <FaCalendarAlt size={14} />, text: "View class routines" },
    { icon: <FaComments size={14} />, text: "Send feedback to department" },
  ];

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#f8fafc', padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '800px', borderRadius: '16px',
        overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        display: 'flex', background: 'white',
      }}>
        {/* ── Left Brand Panel ── */}
        <div style={{
          width: '42%', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', color: 'white', position: 'relative',
          overflow: 'hidden',
        }} className="desktop-nav">
          <div style={{ position: 'absolute', bottom: '10%', left: '-15%', width: '180px', height: '180px', background: 'rgba(59,130,246,0.08)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', zIndex: 1 }}>
            <div style={{ background: 'rgba(234,88,12,0.2)', padding: '0.4rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaGraduationCap size={24} color="#fb923c" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>DeptHub</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white' }}>Student Access</h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '2rem', zIndex: 1 }}>
            Access your batch resources, routines, and department notices.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 1 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <div style={{ color: '#fb923c' }}>{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div style={{ flex: 1, padding: '2.5rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', display: 'flex', alignItems: 'center',
              gap: '0.3rem', fontSize: '0.82rem', padding: '0',
              marginBottom: '1rem',
            }}
          >
            <FaArrowLeft size={12} /> Back
          </button>
          <h2 style={{ textAlign: 'left', marginBottom: '0.25rem', fontSize: '1.35rem', fontWeight: '700', color: '#1e293b' }}>
            Batch Login
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            Enter your batch credentials to access resources
          </p>
          {error && <Toast message={error} onClose={() => setError("")} />}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loader />
              <p style={{ marginTop: '0.75rem', color: '#94a3b8', fontSize: '0.85rem' }}>Unlocking class resources...</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input type="text" placeholder="Batch Username (e.g. CSE-24)" name="username" value={formData.username} onChange={onChange} required style={{ height: '42px' }} />
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} placeholder="Batch Password" name="password" value={formData.password} onChange={onChange} required style={{ paddingRight: '40px', height: '42px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '4px' }}>
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', height: '40px', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Enter Class
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchLogin;
