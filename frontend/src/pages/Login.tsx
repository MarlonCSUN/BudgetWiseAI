import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImg from "../images/image 1.png";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
      className="primary-bg"
    >
      <aside
        className="primary-bg"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          padding: "20px 90px",
        }}
      >
        <div className="flex flex-col items-between justify-evenly">
          <h1 className="text-7xl text-white my-10 tracking-wide font-semibold">
            Welcome to <br />
            BudgetWise AI
          </h1>
          <div>
            <h2
              style={{
                color: "#ffffff",
                fontSize: "30px",
                marginBottom: "16px",
                fontWeight: "600",
              }}
            >
              Log In to Your Account
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "#a0a0a0",
              }}
            >
              Pick up where you left off and stay in control of your finances.
              <br />
              <br />
              Track your spending, monitor budgets, and get AI-powered insights
              tailored just for you.
            </p>
          </div>
        </div>

        <div className="">
          <img
            src={heroImg}
            alt="Hero"
            className="w-full h-full object-contain"
          />
        </div>
      </aside>

      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          borderTopLeftRadius: "30px",
          borderBottomLeftRadius: "30px",
        }}
        className="secondary-bg"
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <h2
            style={{
              color: "#ffffff",
              fontSize: "32px",
              fontWeight: "600",
              textAlign: "center",
              marginBottom: "8px",
            }}
          >
            Log In
          </h2>

          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#ff4444",
                color: "#ffffff",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                htmlFor="username"
                style={{
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
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
                  backgroundColor: "transparent",
                  border: "1px solid white",
                  borderRadius: "5px",
                  color: "#ffffff",
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                htmlFor="password"
                style={{
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
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
                    backgroundColor: "transparent",
                    border: "1px solid white",
                    borderRadius: "5px",
                    color: "#ffffff",
                    outline: "none",
                  }}
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
                backgroundColor: loading ? "#666" : "#238E89",
                boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "8px",
              }}
              onMouseEnter={(e) =>
                !loading &&
                (e.currentTarget.style.backgroundColor = "#238E89AA")
              }
              onMouseLeave={(e) =>
                !loading && (e.currentTarget.style.backgroundColor = "#238E89")
              }
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div
            style={{
              marginTop: "24px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#a0a0a0", fontSize: "14px" }}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{
                  color: "white",
                  textDecoration: "underline",
                  fontWeight: "600",
                }}
              >
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
