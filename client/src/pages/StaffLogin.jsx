import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
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

  return (
    <div
      className="container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div className="glass-panel" style={{ width: "100%", maxWidth: "400px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-dim)",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.9rem",
            padding: "0",
            marginBottom: "1rem",
          }}
        >
          <FaArrowLeft size={14} /> Back
        </button>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          {isRegister ? "Faculty/Staff Registration" : "Faculty/Staff Login"}
        </h2>
        {error && <Toast message={error} onClose={() => setError("")} />}

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Loader />
            <p style={{ marginTop: "1rem", color: "var(--text-dim)" }}>
              Connecting to server...
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            {isRegister && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={onChange}
                  required
                />
                <select name="role" value={formData.role} onChange={onChange}>
                  <option value="TEACHER">Teacher</option>
                  <option value="CHAIRMAN">Chairman</option>
                </select>
                <input
                  type="text"
                  placeholder="Department (e.g. CSE)"
                  name="department"
                  value={formData.department}
                  onChange={onChange}
                  required
                />
                <input
                  type="text"
                  placeholder={
                    formData.role === "CHAIRMAN"
                      ? "Chairman Secret Code"
                      : "Faculty Secret Code"
                  }
                  name="secret_code"
                  value={formData.secret_code}
                  onChange={onChange}
                  required
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email Address"
              name="email"
              value={formData.email}
              onChange={onChange}
              required
            />
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={onChange}
                required
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "38%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px",
                }}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            {isRegister && (
              <div style={{ position: "relative", marginTop: "1rem" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={onChange}
                  required
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "38%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "5px",
                  }}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
            )}

            {isRegister && formData.confirmPassword && (
              <div
                style={{
                  marginTop: "0.5rem",
                  marginBottom: "1rem",
                  fontSize: "0.85rem",
                  color:
                    formData.password === formData.confirmPassword
                      ? "#10b981"
                      : "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  paddingLeft: "0.2rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background:
                      formData.password === formData.confirmPassword
                        ? "#10b981"
                        : "#ef4444",
                  }}
                ></div>
                {formData.password === formData.confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%" }}
            >
              {isRegister ? "Register" : "Login"}
            </button>
          </form>
        )}

        <p
          style={{
            marginTop: "1rem",
            textAlign: "center",
            color: "var(--text-dim)",
            fontSize: "0.9rem",
          }}
        >
          {isRegister ? "Already have an account?" : "Need an account?"}
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              cursor: "pointer",
              marginLeft: "0.5rem",
              fontWeight: "bold",
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default StaffLogin;
