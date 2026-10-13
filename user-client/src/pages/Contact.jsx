import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./Contact.css";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const contactDetails = [
  {
    icon: "⌖",
    title: "Our Location",
    value: "Bhavnagar, Gujarat, India",
    description: "Connecting people with properties",
  },
  {
    icon: "✉",
    title: "Email Us",
    value: "support@estatehub.com",
    description: "For questions and general enquiries",
    href: "mailto:support@estatehub.com",
  },
  {
    icon: "◷",
    title: "Working Hours",
    value: "Monday – Saturday",
    description: "9:00 AM – 6:00 PM",
  },
];

const reasons = [
  {
    number: "01",
    title: "Property Assistance",
    description:
      "Explore available properties and find information to help you make informed decisions.",
    icon: "⌂",
  },
  {
    number: "02",
    title: "Owner Support",
    description:
      "Discover how EstateHub helps property owners present and manage their listings.",
    icon: "◇",
  },
  {
    number: "03",
    title: "A Better Experience",
    description:
      "Explore a convenient digital platform designed around your property journey.",
    icon: "✧",
  },
];

export default function Contact() {
  return (
    <main className="contact-page">
      {/* HERO SECTION */}
      <section className="contact-hero">
        <div className="contact-hero-background" />
        <div className="contact-hero-overlay" />

        <motion.div
          className="contact-orbit contact-orbit-one"
          animate={{ rotate: 360 }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="contact-orbit contact-orbit-two"
          animate={{ rotate: -360 }}
          transition={{
            duration: 55,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="contact-hero-content"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85 }}
        >
          <span className="contact-eyebrow">
            <span />
            WE'RE HERE FOR YOU
            <span />
          </span>

          <h1>
            Let's Start a
            <br />
            <span>Conversation.</span>
          </h1>

          <p>
            Every great property journey starts with the
            right connection. Discover EstateHub and take
            the next step towards your property goals.
          </p>

          <div className="contact-hero-actions">
            <Link
              to="/properties"
              className="contact-btn contact-btn-gold"
            >
              Explore Properties <span>↗</span>
            </Link>

            <Link
              to="/about"
              className="contact-btn contact-btn-outline"
            >
              About EstateHub <span>→</span>
            </Link>
          </div>
        </motion.div>

        <div className="contact-hero-bottom">
          <span>ESTATEHUB</span>
          <span>CONNECT · DISCOVER · BELONG</span>
        </div>
      </section>

      {/* CONTACT INFORMATION */}
      <section className="contact-info-section">
        <div className="contact-container">
          <motion.div
            className="contact-section-heading"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="contact-section-label">
              <span /> GET IN TOUCH
            </span>

            <h2>
              We'd Love to
              <br />
              <span>Hear From You.</span>
            </h2>

            <p>
              Find our contact information and learn more
              about the EstateHub experience.
            </p>
          </motion.div>

          <div className="contact-info-grid">
            {contactDetails.map((item, index) => (
              <motion.article
                key={item.title}
                className="contact-info-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.12,
                }}
                whileHover={{ y: -8 }}
              >
                <div className="contact-info-icon">
                  {item.icon}
                </div>

                <span className="contact-info-title">
                  {item.title}
                </span>

                {item.href ? (
                  <a
                    className="contact-info-value"
                    href={item.href}
                  >
                    {item.value}
                  </a>
                ) : (
                  <h3 className="contact-info-value">
                    {item.value}
                  </h3>
                )}

                <p>{item.description}</p>

                <div className="contact-card-bottom">
                  <span />
                  ESTATEHUB
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT OUR APPROACH */}
      <section className="contact-approach-section">
        <div className="contact-container contact-approach-grid">
          <motion.div
            className="contact-approach-image"
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75 }}
          >
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85"
              alt="Modern luxury residential property"
              loading="lazy"
            />

            <div className="contact-image-overlay" />

            <motion.div
              className="contact-image-badge"
              whileHover={{ y: -5 }}
            >
              <span>⌂</span>

              <div>
                <strong>Find Your Place</strong>
                <small>Your next chapter starts here</small>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="contact-approach-copy"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="contact-section-label">
              <span /> THE ESTATEHUB EXPERIENCE
            </span>

            <h2>
              More Than a
              <br />
              Property Platform.
            </h2>

            <p>
              At EstateHub, we believe finding a property
              should feel straightforward and convenient.
              Our platform brings property discovery and
              useful information together in one place.
            </p>

            <p>
              Whether you are exploring a new home,
              looking for a rental, or listing a property,
              EstateHub is designed to help you take the
              next step with confidence.
            </p>

            <Link
              to="/about"
              className="contact-text-link"
            >
              Discover Our Story <span>↗</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* WHY CONNECT WITH ESTATEHUB */}
      <section className="contact-reasons-section">
        <div className="contact-container">
          <motion.div
            className="contact-section-heading"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="contact-section-label">
              <span /> WHY ESTATEHUB
            </span>

            <h2>
              Built Around
              <br />
              <span>Your Property Journey.</span>
            </h2>

            <p>
              Discover a more convenient way to explore
              properties and connect with opportunities.
            </p>
          </motion.div>

          <div className="contact-reasons-grid">
            {reasons.map((item, index) => (
              <motion.article
                key={item.number}
                className="contact-reason-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.13,
                }}
                whileHover={{ y: -7 }}
              >
                <div className="contact-reason-top">
                  <span className="contact-reason-icon">
                    {item.icon}
                  </span>

                  <span className="contact-reason-number">
                    {item.number}
                  </span>
                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <div className="contact-reason-line" />
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="contact-bottom-cta">
        <div className="contact-cta-decoration" />

        <motion.div
          className="contact-container contact-bottom-inner"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="contact-section-label">
            <span /> YOUR NEXT CHAPTER
          </span>

          <h2>
            Your Dream Property
            <br />
            <span>Could Be One Click Away.</span>
          </h2>

          <p>
            Explore properties, discover opportunities,
            and find a place that feels right for you.
          </p>

          <div className="contact-cta-actions">
            <Link
              to="/properties"
              className="contact-btn contact-btn-gold"
            >
              Discover Properties <span>↗</span>
            </Link>

            <Link
              to="/"
              className="contact-btn contact-btn-outline"
            >
              Back to Home <span>⌂</span>
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}