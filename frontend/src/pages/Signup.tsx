import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImg from "../images/image 1.png";

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (formData.first_name.length < 1) {
      newErrors.firstName = "First name is required";
    }

    if (formData.last_name.length < 1) {
      newErrors.lastName = "Last name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain an uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain a lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain a number";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = "Password must contain a special character";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;
      await signup(signupData);
      navigate("/dashboard");
    } catch (err: any) {
      setServerError(
        err.response?.data?.detail || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#1a1a2e",
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
              Take Control of Your Finances
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "#a0a0a0",
              }}
            >
              Track spending, set budgets, achieve goals, and get AI-powered
              insights to make smarter financial decisions.
              <br />
              <br />
              Join BudgetWise AI today and start your journey to financial
              freedom!
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
            maxWidth: "450px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
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
            Create Account
          </h2>

          {serverError && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#ff4444",
                color: "#ffffff",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              {serverError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  style={{
                    padding: "10px",
                    fontSize: "14px",
                    backgroundColor: "transparent",
                    border: `1px solid ${errors.firstName ? "#ff4444" : "#ffffff"}`,
                    borderRadius: "8px",
                    color: "#ffffff",
                    outline: "none",
                  }}
                />
                {errors.firstName && (
                  <span style={{ color: "#ff4444", fontSize: "12px" }}>
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  style={{
                    padding: "10px",
                    fontSize: "14px",
                    backgroundColor: "transparent",
                    border: `1px solid ${errors.lastName ? "#ff4444" : "#ffffff"}`,
                    borderRadius: "8px",
                    color: "#ffffff",
                    outline: "none",
                  }}
                />
                {errors.lastName && (
                  <span style={{ color: "#ff4444", fontSize: "12px" }}>
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                required
                style={{
                  padding: "10px",
                  fontSize: "14px",
                  backgroundColor: "transparent",
                  border: `1px solid ${errors.username ? "#ff4444" : "#ffffff"}`,
                  borderRadius: "8px",
                  color: "#ffffff",
                  outline: "none",
                }}
              />
              {errors.username && (
                <span style={{ color: "#ff4444", fontSize: "12px" }}>
                  {errors.username}
                </span>
              )}
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                style={{
                  padding: "10px",
                  fontSize: "14px",
                  backgroundColor: "transparent",
                  border: `1px solid ${errors.email ? "#ff4444" : "#ffffff"}`,
                  borderRadius: "8px",
                  color: "#ffffff",
                  outline: "none",
                }}
              />
              {errors.email && (
                <span style={{ color: "#ff4444", fontSize: "12px" }}>
                  {errors.email}
                </span>
              )}
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 50px 10px 10px",
                    fontSize: "14px",
                    backgroundColor: "transparent",
                    border: `1px solid ${errors.password ? "#ff4444" : "#ffffff"}`,
                    borderRadius: "8px",
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
                    fontSize: "12px",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <span style={{ color: "#ff4444", fontSize: "12px" }}>
                  {errors.password}
                </span>
              )}
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={{
                  padding: "10px",
                  fontSize: "14px",
                  backgroundColor: "transparent",
                  border: "1px solid #ffffff",
                  borderRadius: "8px",
                  color: "#ffffff",
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "transparent",
                borderRadius: "8px",
                border: "1px solid gray",
                fontSize: "12px",
                color: "#a0a0a0",
              }}
            >
              <p style={{ marginBottom: "6px", fontWeight: "500" }}>
                Password must contain:
              </p>
              <ul style={{ paddingLeft: "20px", margin: 0 }}>
                <li>At least 8 characters</li>
                <li>Uppercase and lowercase letters</li>
                <li>At least one number</li>
                <li>At least one special character</li>
              </ul>
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
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div
            style={{
              marginTop: "16px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#a0a0a0", fontSize: "14px" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "white",
                  textDecoration: "underline",
                  fontWeight: "600",
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
