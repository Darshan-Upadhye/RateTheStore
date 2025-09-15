import React from "react";
import "./TermsOfService.css";

function TermsOfService() {
  return (
    <div className="terms-bg">
      <div className="terms-card animate-fadeInUp">
        <h1 className="animate-fadeInDown">Terms of Service</h1>

        <p>
          Welcome to <strong>RateTheStore</strong>. By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <h2>User Responsibilities & Access</h2>
        <ul>
          <li><strong>System Administrator:</strong> Manages the platform's operation, user roles, and analytics to ensure security and smooth functionality.</li>
          <li><strong>Normal User:</strong> Able to register, log in, browse stores, and submit or update honest ratings and reviews under our community guidelines.</li>
          <li><strong>Store Owner:</strong> Responsible for managing their store profiles and responding to customer feedback appropriately.</li>
        </ul>

        <h2>Content and Conduct</h2>
        <p>
          Users must provide truthful, respectful, and non-infringing content. Any abusive, fraudulent, or illegal submissions are strictly prohibited and may result in suspension or termination.
        </p>

        <h2>Platform Features</h2>
        <ul>
          <li>Admin privileges allow management of user and store data, ensuring proper authorization.</li>
          <li>Rating submissions are subject to validation for accuracy and relevance.</li>
          <li>Role-based access provides customized features; unauthorized use is forbidden.</li>
        </ul>

        <h2>Data Accuracy and Security</h2>
        <p>
          While we strive to maintain accurate data, users acknowledge that information on stores and ratings may vary and use the platform at their own discretion. We prioritize securing your personal data as described in our Privacy Policy.
        </p>

        <h2>Input Validation Highlights</h2>
        <ul>
          <li>Names must be between 20 and 60 characters enabling clear identity representation.</li>
          <li>Addresses limited to 400 characters for clarity.</li>
          <li>Passwords require 8-16 characters, including uppercase and special symbols.</li>
          <li>Emails follow standard formatting for communication reliability.</li>
        </ul>

        <h2>Modification and Termination</h2>
        <p>
          RateTheStore reserves the right to modify or terminate services at any time without prior notice. Continued use implies acceptance of updated terms.
        </p>

        <p>
          By using this platform, you agree to these Terms of Service and commit to following all applicable rules and policies.
        </p>
      </div>
    </div>
  );
}

export default TermsOfService;
