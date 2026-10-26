import { useState } from "react";
import { Link } from "react-router-dom";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.subject.trim() ||
      !form.message.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.message.trim().length < 10) {
      setError("Message must contain at least 10 characters.");
      return;
    }

    setSuccess(
      "Your contact form passed validation successfully! This is a demo form; no email has been sent."
    );

    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <main className="contact-page">
      <section className="contact-header">
        <p className="contact-eyebrow">SHOPEASE SUPPORT</p>
        <h1>Contact Us</h1>
        <p>
          Have a question? Send us a message. We're happy to help!
        </p>
      </section>

      <div className="contact-layout">
        <section className="contact-info">
          <div className="contact-icon">💬</div>

          <h2>Get in Touch</h2>

          <p>
            Questions about your orders, products or shopping experience?
            Complete the form and validate your message.
          </p>

          <div className="contact-info-item">
            <span>🛍️</span>
            <div>
              <strong>ShopEase Customer Support</strong>
              <p>We're here to help with your shopping experience.</p>
            </div>
          </div>

          <Link to="/" className="contact-home-link">
            ← Back to Home
          </Link>
        </section>

        <section className="contact-form-card">
          <h2>Send Us a Message</h2>
          <p className="contact-form-subtitle">
            Please complete all fields below.
          </p>

          {error && (
            <p className="contact-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="contact-success" role="status">
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="contact-field">
              <label htmlFor="contact-name">Full Name *</label>
              <input
                id="contact-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-email">Email Address *</label>
              <input
                id="contact-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-subject">Subject *</label>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What do you need help with?"
                maxLength={120}
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">Message *</label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                rows={5}
                minLength={10}
                maxLength={1000}
                required
              />
            </div>

            <button type="submit" className="contact-submit-button">
              Submit Message
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Contact;