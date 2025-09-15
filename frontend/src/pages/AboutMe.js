import React from "react";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaWhatsapp,
  FaFolderOpen,
} from "react-icons/fa";
import "./AboutMe.css";

const projects = [
  {
    title: "InGeniBot – Your Friendly Generative AI Chatbot",
    description:
      "A sleek and intelligent AI chatbot built with Next.js and OpenRouter (DeepSeek model), inspired by Messenger UI for fun and productive AI interaction.",
    link: "https://ingenibot.vercel.app/",
    logo: "/InGeniBotLogo.svg",
  },
  {
    title: "InGeniVoice - A Voice-first AI Assistant",
    description:
      "A voice-first AI assistant using Next.js, OpenRouter, and Web Speech API enabling speech interaction, animated responses, and text-to-speech.",
    link: "https://in-geni-voice.vercel.app/",
    logo: "/InGeniVoice.svg",
  },
  {
    title: "DineEase : Smart Management for Restaurants",
    description:
      "A digital dining solution that streamlines ordering via QR codes, real-time tracking, and digital payments — solving delays and miscommunication.",
    logo: "/DineEase.svg",
  },
  {
    title: "RakshaSootra – The Sootra of Peaceful Driving",
    description:
      "An AI-powered emotional co-pilot monitoring driver emotions in real-time, providing voice-based de-escalation and alerts for safer driving.",
    logo: "/RakshaSootra_Icon.svg",
  },
  {
    title: "InGeniGo: Your Smart Travel Wishlist & Planner",
    description:
      "An AI travel companion creating personalized, budget-friendly itineraries with authentic experiences and booking assistance.",
    logo: "/InGeniGO.svg",
  },
  {
    title: "InGeniWardrobeX – Your Wardrobe, Reinvented",
    description:
      "A smart AI wardrobe platform with image recognition, styling recommendations, weather-based suggestions, and e-commerce integration.",
    logo: "/InGeniWardrobeX.svg",
  },
  {
    title: "InGeniVault – Where Genius Projects Live and Thrive",
    description:
      "A secure portfolio platform to showcase creativity and innovation, offering professional space to store and promote projects.",
    logo: "/InGeniVault.svg",
  },
];

function AboutMe() {
  return (
    <div className="aboutme-bg">
      <div className="aboutme-outer-card">
        <section className="aboutme-intro animate-fadeInDown">
          <h1>About Me</h1>
          <p className="delay-1">
            Hi, I'm Darshan Akshay Upadhye, a B.Tech student in Electronics and Computer Engineering.
          </p>
          <p className="delay-2">
            I have a strong passion and experience in Full Stack Web Development. I enjoy building innovative and intelligent web applications that solve real-world problems using cutting-edge technologies.
          </p>
        </section>

        <section className="projects-section">
          <h2 className="animate-fadeInDown delay-3">My Projects</h2>
          <div className="projects-list">
            {projects.map(({ title, description, link, logo }, idx) => (
              <div
                key={idx}
                className="project-card animate-fadeInUp"
                style={{ animationDelay: `${0.3 + idx * 0.15}s` }}
              >
                <img src={logo} alt={`${title} logo`} className="project-logo" />
                <div className="project-info">
                  <h3>{title}</h3>
                  <p>{description}</p>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-explore-btn"
                    >
                      Explore
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="contact-section animate-fadeInDown delay-4">
          <h2>Connect with Me</h2>
          <div className="social-icons animate-fadeInUp delay-5">
            <a
              href="https://github.com/Darshan-Upadhye"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/darshan-upadhye-02a9a5287?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BDnuwdhGIRRySDI8pa%2BBjNA%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a href="mailto:darshanupadhye272@gmail.com" aria-label="Email">
              <FaEnvelope />
            </a>
            <a
              href="https://wa.me/8412967484?text=Hello%2C%20I%20am%20a%20website%20developer%20interested%20in%20discussing%20potential%20projects%20or%20collaboration.%20Please%20let%20me%20know%20how%20we%20can%20connect.%20Thank%20you!"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
            <a
              href="https://darshan-upadhye-portfolio.example.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Portfolio"
            >
              <FaFolderOpen />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutMe;
