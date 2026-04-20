import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash, FaArrowLeft, FaGraduationCap, FaShieldAlt, FaUsers, FaCalendarAlt } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { Loader, Toast } from "../components/UI";

const StaffLogin = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    role: "TEACHER",
    secret_code: "",
    department: "",
  });
  const [error, setError] = useState("");
  const { loginUser, registerUser, user } = useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === "CHAIRMAN") navigate("/chairman");
      else if (user.role === "COMPUTER_OPERATOR") navigate("/operator");
      else if (user.role === "TEACHER") navigate("/teacher");
      else if (user.role === "BATCH") navigate("/batch");
    }
  }, [user, navigate]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        res = await registerUser({
          ...formData,
          email,
          password,
          confirmPassword,
          full_name,
          department,
          secret_code,
        });
      } else {
        res = await loginUser(email, password);
      }

      if (res.success) {
        // Redirection handled by useEffect
      } else {
        setError(res.msg);
      }
    } catch (err) {
      console.error("StaffLogin Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <FaShieldAlt size={14} />, text: "Role-based access control" },
    { icon: <FaUsers size={14} />, text: "Department-wide collaboration" },
    { icon: <FaCalendarAlt size={14} />, text: "Routine & notice management" },
  ];

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#f8fafc', padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '880px', borderRadius: '16px',
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
          <div style={{ position: 'absolute', top: '15%', right: '-20%', width: '200px', height: '200px', background: 'rgba(234,88,12,0.08)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', zIndex: 1 }}>
            <div style={{ background: 'rgba(234,88,12,0.2)', padding: '0.4rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaGraduationCap size={24} color="#fb923c" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>DeptHub</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '2rem', zIndex: 1 }}>
            Your department management platform. Streamline academic operations with ease.
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
        <div style={{ flex: 1, padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            {isRegister ? "Register as faculty or staff" : "Sign in to your faculty account"}
          </p>
          {error && <Toast message={error} onClose={() => setError("")} />}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loader />
              <p style={{ marginTop: '0.75rem', color: '#94a3b8', fontSize: '0.85rem' }}>Connecting to server...</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {isRegister && (
                <>
                  <input type="text" placeholder="Full Name" name="full_name" value={formData.full_name} onChange={onChange} required style={{ height: '42px' }} />
                  <select name="role" value={formData.role} onChange={onChange} style={{ height: '42px' }}>
                    <option value="TEACHER">Teacher</option>
                    <option value="CHAIRMAN">Chairman</option>
                  </select>
                  <input type="text" placeholder="Department (e.g. CSE)" name="department" value={formData.department} onChange={onChange} required style={{ height: '42px' }} />
                  <input type="text" placeholder={formData.role === "CHAIRMAN" ? "Chairman Secret Code" : "Faculty Secret Code"} name="secret_code" value={formData.secret_code} onChange={onChange} required style={{ height: '42px' }} />
                </>
              )}
              <input type="email" placeholder="Email Address" name="email" value={formData.email} onChange={onChange} required style={{ height: '42px' }} />
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} placeholder="Password" name="password" value={formData.password} onChange={onChange} required style={{ paddingRight: '40px', height: '42px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '4px' }}>
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>

              {isRegister && (
                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={onChange} required style={{ paddingRight: '40px', height: '42px' }} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '4px' }}>
                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              )}

              {isRegister && formData.confirmPassword && (
                <div style={{
                  fontSize: '0.78rem',
                  color: formData.password === formData.confirmPassword ? '#16a34a' : '#ef4444',
                  display: 'flex', alignItems: 'center', gap: '0.3rem', paddingLeft: '0.15rem',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: formData.password === formData.confirmPassword ? '#16a34a' : '#ef4444' }}></div>
                  {formData.password === formData.confirmPassword ? "Passwords match" : "Passwords do not match"}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', height: '40px', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                {isRegister ? "Register" : "Login"}
              </button>
            </form>
          )}

          <p style={{ marginTop: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
            {isRegister ? "Already have an account?" : "Need an account?"}
            <button
              onClick={() => setIsRegister(!isRegister)}
              style={{ background: 'none', border: 'none', color: '#ea580c', cursor: 'pointer', marginLeft: '0.35rem', fontWeight: 'bold', fontSize: '0.82rem' }}
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
