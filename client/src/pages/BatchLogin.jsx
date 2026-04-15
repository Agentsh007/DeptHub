import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
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
          Batch Login
        </h2>
        {error && <Toast message={error} onClose={() => setError("")} />}

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Loader />
            <p style={{ marginTop: "1rem", color: "var(--text-dim)" }}>
              Unlocking class resources...
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Batch Username (e.g. CSE-24)"
              name="username"
              value={formData.username}
              onChange={onChange}
              required
            />
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Batch Password"
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

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%" }}
            >
              Enter Class
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BatchLogin;
