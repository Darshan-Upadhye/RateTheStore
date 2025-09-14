import React from "react";
import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  return (
    <div className="privacy-bg">
      <div className="privacy-card animate-fadeInUp">
        <h1 className="animate-fadeInDown">Privacy Policy</h1>

        <p>
          At <strong>RateTheStore</strong>, we value your privacy and are committed to protecting your personal information while providing a transparent and secure platform for honest store reviews and ratings.
        </p>

        <h2>User Types & Access</h2>
        <ul>
          <li><strong>System Administrator:</strong> Oversees users and store management with insightful analytics to improve the platform experience while safeguarding data.</li>
          <li><strong>Normal User:</strong> Can register, log in, browse stores, and submit or update ratings securely with confidence that their information is protected.</li>
          <li><strong>Store Owner:</strong> Manages their store profile and monitors ratings and feedback, with role-based access restricting unnecessary data exposure.</li>
        </ul>

        <h2>Data Collection and Usage</h2>
        <p>
          We collect essential information such as names, email addresses, and ratings to facilitate authentic interactions. All data is handled with strict security protocols to prevent unauthorized access or misuse.
        </p>

        <h2>Core Features Privacy Considerations</h2>
        <ul>
          <li>User role privileges are solidly enforced to limit data access and ensure user-specific privacy.</li>
          <li>Validation safeguards protect the integrity and quality of the data submitted.</li>
          <li>We do not sell or share your personal data with third parties without your explicit consent.</li>
        </ul>

        <h2>Input Validation Highlights</h2>
        <ul>
          <li>Name must be between 20 and 60 characters to ensure clear identity without unnecessary exposure.</li>
          <li>Addresses are limited to 400 characters for concise location storage.</li>
          <li>Passwords require 8-16 characters, including uppercase letters and special symbols to enhance security.</li>
          <li>Email addresses are validated to maintain consistent and accurate communication.</li>
        </ul>

        <h2>Your Rights</h2>
        <p>
          You have the right to access, modify, or delete your personal information at any time by contacting our support team. We are committed to transparency and user control over data.
        </p>

        <p>
          By using RateTheStore, you consent to this Privacy Policy and acknowledge our commitment to safeguard your data and privacy.
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
