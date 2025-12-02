import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const roles = [
  { name: "System Administrator", description: "Manage users and stores, view analytics", icon: "🔧" },
  { name: "Normal User", description: "Browse and rate stores", icon: "👤" },
  { name: "Store Owner", description: "Manage your store and view ratings", icon: "🏪" },
];

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
  role: Yup.string()
    .oneOf(["System Administrator", "Normal User", "Store Owner"], "Role required")
    .required("Required"),
});

function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const getDashboardRoute = (role) => {
    switch (role) {
      case "System Administrator": return "/dashboard/admin";
      case "Normal User": return "/dashboard/user";
      case "Store Owner": return "/dashboard/store-owner";
      default: return "/dashboard";
    }
  };

  const handleLogin = async (values, { setSubmitting, setErrors }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(values),
});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Save token + user
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      setShowPopup(true);
    } catch (error) {
      setErrors({ password: error.message });
      setSubmitting(false);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    const user = JSON.parse(localStorage.getItem("user"));
    navigate(getDashboardRoute(user.role));
  };

  const handleSignupNavigate = () => {
    navigate("/signup", { state: { role: selectedRole } });
  };

  return (
    <div className="auth-bg">
      <div className="auth-outer-card">
        {!selectedRole ? (
          <div className="role-select-card">
            <h2 className="role-title">Select Your Role</h2>
            <p className="role-desc">How would you like to use <b>RateTheStore</b>?</p>
            <div className="role-select-row">
              {roles.map((role) => (
                <button
                  key={role.name}
                  className="role-pick-card"
                  onClick={() => setSelectedRole(role.name)}
                  tabIndex={0}
                  type="button"
                >
                  <span className="role-pick-icon">{role.icon}</span>
                  <span className="role-pick-name">{role.name}</span>
                  <span className="role-pick-desc">{role.description}</span>
                </button>
              ))}
            </div>
            <button className="role-back-btn" onClick={() => navigate("/")}>Back to Home</button>
          </div>
        ) : (
          <div className="login-card">
            <h2 className="login-title">Login as {selectedRole}</h2>
            <Formik
              initialValues={{ email: "", password: "", role: selectedRole }}
              validationSchema={LoginSchema}
              onSubmit={handleLogin}
              enableReinitialize
            >
              {({ isSubmitting }) => (
                <Form className="login-form">
                  <div className="login-form-group">
                    <label>Email</label>
                    <Field name="email" type="email" />
                    <ErrorMessage name="email" component="div" className="login-error" />
                  </div>
                  <div className="login-form-group">
                    <label>Password</label>
                    <Field name="password" type="password" />
                    <ErrorMessage name="password" component="div" className="login-error" />
                  </div>
                  <div className="login-form-group">
                    <label>Role</label>
                    <input type="text" value={selectedRole} disabled />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="login-btn">
                    {isSubmitting ? "Logging in..." : "Login"}
                  </button>
                  <div className="login-links">
                    <p>
                      Don't have an account?{" "}
                      <button type="button" className="login-link-btn" onClick={handleSignupNavigate}>
                        Sign Up
                      </button>
                    </p>
                    <button
                      type="button"
                      className="role-back-btn"
                      onClick={() => setSelectedRole("")}
                    >
                      Back to Role Selection
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="signup-popup-overlay">
          <div className="signup-popup signup-popup-animate">
            <img
              src={`${process.env.PUBLIC_URL}/Done.svg`}
              alt="Done"
              className="done-mark-animate"
              width={150}
              height={150}
            />
            <h3>Welcome Back</h3>
            <p className="popup-description">Successfully logged in!</p>
            <button className="signup-btn" onClick={handlePopupClose}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
