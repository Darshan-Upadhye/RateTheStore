import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import "./SignupPage.css";

const SignupSchema = Yup.object().shape({
  name: Yup.string().min(3, "Name must be at least 3 characters").max(60, "Name too long").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  address: Yup.string().max(400, "Address too long").required("Required"),
  password: Yup.string()
    .min(8, "Password must be 8-16 characters")
    .max(16, "Password must be 8-16 characters")
    .matches(/[A-Z]/, "At least one uppercase letter required")
    .matches(/[^A-Za-z0-9]/, "At least one special character required")
    .required("Required"),
  role: Yup.string()
    .oneOf(["System Administrator", "Normal User", "Store Owner"], "Role required")
    .required("Required"),
  acceptTerms: Yup.bool().oneOf([true], "You must accept the Terms and Privacy").required("Required"),
});

function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedRole = location.state?.role || "";
  const [showPopup, setShowPopup] = useState(false);

  const handleSignup = async (values, { setSubmitting, setErrors }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(values),
});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      setShowPopup(true);
    } catch (error) {
      setErrors({ email: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="auth-bg">
      <div className="auth-outer-card">
        <div className="signup-card">
          <h2 className="signup-title">Sign Up</h2>
          <p className="signup-desc">Create a free account to get started with <b>RateTheStore</b></p>
          <Formik
            initialValues={{
              name: "",
              email: "",
              address: "",
              password: "",
              role: preselectedRole,
              acceptTerms: false,
            }}
            validationSchema={SignupSchema}
            onSubmit={handleSignup}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form className="signup-form">
                <div className="signup-form-group">
                  <label>Name</label>
                  <Field type="text" name="name" />
                  <ErrorMessage name="name" component="div" className="signup-error" />
                </div>
                <div className="signup-form-group">
                  <label>Email</label>
                  <Field type="email" name="email" />
                  <ErrorMessage name="email" component="div" className="signup-error" />
                </div>
                <div className="signup-form-group">
                  <label>Address</label>
                  <Field as="textarea" name="address" rows="2" />
                  <ErrorMessage name="address" component="div" className="signup-error" />
                </div>
                <div className="signup-form-group">
                  <label>Password</label>
                  <Field type="password" name="password" />
                  <ErrorMessage name="password" component="div" className="signup-error" />
                </div>
                <div className="signup-form-group">
                  <label>Role</label>
                  {preselectedRole ? (
                    <>
                      <input type="text" value={preselectedRole} disabled />
                      <Field type="hidden" name="role" />
                    </>
                  ) : (
                    <Field as="select" name="role">
                      <option value="">Select Role</option>
                      <option value="System Administrator">System Administrator</option>
                      <option value="Normal User">Normal User</option>
                      <option value="Store Owner">Store Owner</option>
                    </Field>
                  )}
                  <ErrorMessage name="role" component="div" className="signup-error" />
                </div>
                <div className="signup-form-checkbox">
                  <label className="checkbox-inline">
                    <Field type="checkbox" name="acceptTerms" className="signup-checkbox" />
                    <span>
                      I read and accept the{" "}
                      <a href="/TermsOfService" target="_blank" rel="noopener noreferrer">Terms</a> and{" "}
                      <a href="/PrivacyPolicy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                    </span>
                  </label>
                </div>
                <ErrorMessage name="acceptTerms" component="div" className="signup-error" />
                <button type="submit" disabled={isSubmitting} className="signup-btn">
                  {isSubmitting ? "Signing up..." : "Sign Up"}
                </button>
                <div className="signup-links">
                  <p>
                    Already have an account?{" "}
                    <button type="button" className="signup-link-btn" onClick={() => navigate("/login")}>
                      Login
                    </button>
                  </p>
                </div>
              </Form>
            )}
          </Formik>
        </div>
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
            <h3>Welcome to RateTheStore!</h3>
            <p>You are successfully registered. You can now login.</p>
            <button className="signup-btn" onClick={handlePopupClose}>Go to Login</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignupPage;
