import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundColor: "#1a1a2e",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
    }}>
      <aside style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#16213e",
        borderTopRightRadius: "24px",
        borderBottomRightRadius: "24px",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "48px",
      }}>
        <div style={{
          width: "100%",
          height: "60%",
          backgroundColor: "#0f3460",
          borderRadius: "16px",
          border: "1px solid #4a4a4a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "32px",
        }}>
          <div style={{
            textAlign: "center",
            color: "#e94560",
            fontSize: "64px",
            fontWeight: "bold",
          }}>
            💰
          </div>
        </div>

        <h2 style={{
          color: "#ffffff",
          fontSize: "24px",
          textAlign: "center",
          marginBottom: "16px",
          fontWeight: "600",
        }}>
          Take Control of Your Finances
        </h2>

        <p style={{
          color: "#a0a0a0",
          fontSize: "16px",
          textAlign: "center",
          maxWidth: "400px",
        }}>
          Track spending, set budgets, achieve goals, and get AI-powered insights to make smarter financial decisions.
        </p>
      </aside>

      <main style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px",
      }}>
        <div style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}>
          <h2 style={{
            color: "#ffffff",
            fontSize: "32px",
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "8px",
          }}>
            Log In
          </h2>

          {error && (
            <div style={{
              padding: "12px",
              backgroundColor: "#ff4444",
              color: "#ffffff",
              borderRadius: "8px",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="username" style={{ color: "#ffffff", fontSize: "14px", fontWeight: "500" }}>
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                placeholder="Enter your username"
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  backgroundColor: "#2a2a3e",
                  border: "1px solid #4a4a4a",
                  borderRadius: "8px",
                  color: "#ffffff",
                  outline: "none",
                }}
                onFocus={(e) => e.target.style.borderColor = "#e94560"}
                onBlur={(e) => e.target.style.borderColor = "#4a4a4a"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="password" style={{ color: "#ffffff", fontSize: "14px", fontWeight: "500" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 50px 12px 12px",
                    fontSize: "16px",
                    backgroundColor: "#2a2a3e",
                    border: "1px solid #4a4a4a",
                    borderRadius: "8px",
                    color: "#ffffff",
                    outline: "none",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#e94560"}
                  onBlur={(e) => e.target.style.borderColor = "#4a4a4a"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#a0a0a0",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "16px",
                fontWeight: "600",
                backgroundColor: loading ? "#666" : "#e94560",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "8px",
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#ff5577")}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#e94560")}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{
            marginTop: "24px",
            textAlign: "center",
          }}>
            <p style={{ color: "#a0a0a0", fontSize: "14px" }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: "#e94560", fontWeight: "600", textDecoration: "none" }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;