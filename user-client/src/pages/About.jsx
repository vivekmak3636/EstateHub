import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import "./About.css";

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.15,
  });
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUp}
      initial="hidden"
      animate={
        reduceMotion || isInView ? "visible" : "hidden"
      }
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ value, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let frame;
    const start = performance.now();
    const duration = 1600;

    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(update);
      }
    };

    frame = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frame);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

const stats = [
  { value: 500, suffix: "+", label: "Properties Listed" },
  { value: 1200, suffix: "+", label: "Happy Clients" },
  { value: 50, suffix: "+", label: "Locations Covered" },
  { value: 5, suffix: "+", label: "Years of Excellence" },
];

const values = [
  {
    icon: "⌂",
    title: "Trust & Transparency",
    text: "We believe every property journey should be built on honesty, clarity, and confidence.",
  },
  {
    icon: "◇",
    title: "Customer First",
    text: "Your goals matter. We make it easier to explore options and make informed property decisions.",
  },
  {
    icon: "✧",
    title: "Quality & Innovation",
    text: "We combine thoughtful design and modern technology to create a better property experience.",
  },
];

const team = [
  {
    name: "Experienced Professionals",
    role: "Property Guidance",
    icon: "♙",
  },
  {
    name: "Dedicated Support",
    role: "Customer Experience",
    icon: "♡",
  },
  {
    name: "Modern Technology",
    role: "Digital Innovation",
    icon: "⌘",
  },
];

export default function About() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-bg" />
        <div className="about-hero-overlay" />

        <motion.div
          className="about-orbit about-orbit-one"
          animate={
            reduceMotion ? {} : { rotate: 360 }
          }
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="about-orbit about-orbit-two"
          animate={
            reduceMotion ? {} : { rotate: -360 }
          }
          transition={{
            duration: 55,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="about-container about-hero-content">
          <motion.div
            className="about-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="about-eyebrow-line" />
            GET TO KNOW US
            <span className="about-eyebrow-line" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.15,
            }}
          >
            More Than Properties.
            <br />
            <span>A Place to Belong.</span>
          </motion.h1>

          <motion.p
            className="about-hero-description"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.35,
            }}
          >
            At EstateHub, we help turn your property
            aspirations into meaningful next chapters.
            Discover a smarter, more personal way to
            find a place to call home.
          </motion.p>

          <motion.div
            className="about-hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.5,
            }}
          >
            <Link to="/properties" className="about-btn about-btn-gold">
              Explore Properties <span>↗</span>
            </Link>

            <Link to="/contact" className="about-btn about-btn-outline">
              Contact Us <span>→</span>
            </Link>
          </motion.div>

          <motion.div
            className="about-scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <motion.span
              animate={reduceMotion ? {} : { y: [0, 7, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              ↓
            </motion.span>
            SCROLL TO DISCOVER
          </motion.div>
        </div>

        <div className="about-hero-bottom-line" />
      </section>

      {/* INTRODUCTION */}
      <section className="about-intro section-padding">
        <div className="about-container about-intro-grid">
          <Reveal className="about-intro-visual">
            <div className="about-image-frame">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85"
                alt="Contemporary luxury home"
                loading="lazy"
              />

              <div className="about-image-shade" />

              <motion.div
                className="about-image-badge"
                whileHover={{ y: -5 }}
              >
                <span className="about-badge-icon">⌂</span>
                <div>
                  <strong>Find Your Place</strong>
                  <small>Discover new possibilities</small>
                </div>
              </motion.div>
            </div>

            <div className="about-visual-decoration" />
          </Reveal>

          <Reveal className="about-intro-copy" delay={0.15}>
            <span className="about-section-label">
              <span /> WHO WE ARE
            </span>

            <h2>
              Every Great Journey
              <br />
              <span>Begins at Home.</span>
            </h2>

            <p>
              EstateHub is designed to bring property
              seekers and property owners together through
              a convenient, modern real-estate experience.
            </p>

            <p>
              Whether you are searching for your first
              home, exploring an investment, or listing
              a property, our goal is to make the journey
              more straightforward and enjoyable.
            </p>

            <div className="about-intro-highlight">
              <span className="about-highlight-mark">“</span>
              <p>
                A property is more than an address.
                It is where the next chapter begins.
              </p>
            </div>

            <Link to="/properties" className="about-text-link">
              Start Exploring <span>↗</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="about-stats-section">
        <div className="about-container">
          <Reveal className="about-stats-heading">
            <span className="about-section-label">
              <span /> ESTATEHUB AT A GLANCE
            </span>
            <h2>Built Around Your Next Move.</h2>
          </Reveal>

          <div className="about-stats-grid">
            {stats.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.1}>
                <motion.div
                  className="about-stat-card"
                  whileHover={{
                    y: -8,
                    borderColor: "rgba(214,170,77,0.65)",
                  }}
                >
                  <span className="about-stat-index">
                    0{index + 1}
                  </span>

                  <h3>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </h3>

                  <p>{stat.label}</p>
                  <div className="about-stat-line" />
                </motion.div>
              </Reveal>
            ))}
          </div>

          <p className="about-stats-note">
            Illustrative project metrics — replace these
            figures with your verified EstateHub data.
          </p>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="about-purpose section-padding">
        <div className="about-container">
          <Reveal className="about-centered-heading">
            <span className="about-section-label">
              <span /> OUR PURPOSE
            </span>
            <h2>
              Guided by Purpose.
              <br />
              <span>Driven by Possibility.</span>
            </h2>
            <p>
              Our principles shape how we build a more
              thoughtful property experience.
            </p>
          </Reveal>

          <div className="about-purpose-grid">
            <Reveal>
              <motion.article
                className="about-purpose-card about-mission-card"
                whileHover={{ y: -8 }}
              >
                <div className="about-purpose-icon">◎</div>
                <span className="about-card-overline">
                  OUR MISSION
                </span>
                <h3>Make Property Discovery Simpler.</h3>
                <p>
                  Help people discover suitable properties
                  with clear information, intuitive tools,
                  and an experience built around their needs.
                </p>
                <span className="about-purpose-number">01</span>
              </motion.article>
            </Reveal>

            <Reveal delay={0.15}>
              <motion.article
                className="about-purpose-card about-vision-card"
                whileHover={{ y: -8 }}
              >
                <div className="about-purpose-icon">✧</div>
                <span className="about-card-overline">
                  OUR VISION
                </span>
                <h3>Bring People Closer to Home.</h3>
                <p>
                  Create a trusted digital destination
                  where property seekers and owners can
                  connect and move forward with confidence.
                </p>
                <span className="about-purpose-number">02</span>
              </motion.article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="about-values section-padding">
        <div className="about-container">
          <Reveal className="about-values-heading">
            <div>
              <span className="about-section-label">
                <span /> WHAT MATTERS TO US
              </span>
              <h2>
                The Values Behind
                <br />
                <span>Every Connection.</span>
              </h2>
            </div>

            <p>
              Good property experiences begin with good
              principles. These values guide our approach
              to every interaction.
            </p>
          </Reveal>

          <div className="about-values-grid">
            {values.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.12}>
                <motion.article
                  className="about-value-card"
                  whileHover={{ y: -8 }}
                >
                  <div className="about-value-top">
                    <span className="about-value-icon">
                      {item.icon}
                    </span>
                    <span className="about-value-number">
                      0{index + 1}
                    </span>
                  </div>

                  <h3>{item.title}</h3>
                  <p>{item.text}</p>

                  <div className="about-value-footer">
                    <span />
                    ESTATEHUB VALUES
                  </div>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OUR APPROACH */}
      <section className="about-approach section-padding">
        <div className="about-container about-approach-grid">
          <Reveal>
            <span className="about-section-label">
              <span /> THE ESTATEHUB EXPERIENCE
            </span>

            <h2>
              Designed Around
              <br />
              <span>Your Journey.</span>
            </h2>

            <p>
              From the first search to the next big
              decision, EstateHub brings the essentials
              of property discovery together in one place.
            </p>

            <Link to="/properties" className="about-btn about-btn-gold">
              Explore Our Listings <span>↗</span>
            </Link>
          </Reveal>

          <div className="about-approach-list">
            {[
              ["01", "Discover", "Explore available properties and possibilities."],
              ["02", "Compare", "Review details to understand your options."],
              ["03", "Connect", "Reach out and take the next step."],
            ].map(([number, title, description], index) => (
              <Reveal key={number} delay={index * 0.12}>
                <motion.div
                  className="about-approach-item"
                  whileHover={{ x: 8 }}
                >
                  <span className="about-approach-number">
                    {number}
                  </span>

                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>

                  <span className="about-approach-arrow">↗</span>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM / PLATFORM */}
      <section className="about-team section-padding">
        <div className="about-container">
          <Reveal className="about-centered-heading">
            <span className="about-section-label">
              <span /> WHAT POWERS ESTATEHUB
            </span>
            <h2>
              A Better Experience,
              <br />
              <span>Built Together.</span>
            </h2>
            <p>
              A property platform is strongest when its
              people, support, and technology work together.
            </p>
          </Reveal>

          <div className="about-team-grid">
            {team.map((item, index) => (
              <Reveal key={item.title || item.name} delay={index * 0.12}>
                <motion.article
                  className="about-team-card"
                  whileHover={{ y: -8, scale: 1.015 }}
                >
                  <div className="about-team-icon">{item.icon}</div>
                  <h3>{item.name}</h3>
                  <p>{item.role}</p>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-cta-background" />

        <Reveal className="about-container about-cta-content">
          <span className="about-section-label">
            <span /> YOUR NEXT CHAPTER STARTS HERE
          </span>

          <h2>
            Ready to Find
            <br />
            <span>Your Place?</span>
          </h2>

          <p>
            Discover properties, explore opportunities,
            and take the next step with EstateHub.
          </p>

          <div className="about-cta-actions">
            <Link to="/properties" className="about-btn about-btn-gold">
              Explore Properties <span>↗</span>
            </Link>

            <Link to="/contact" className="about-btn about-btn-outline">
              Get in Touch <span>→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}