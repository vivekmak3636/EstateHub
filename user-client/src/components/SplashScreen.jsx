
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./SplashScreen.css";

const SPLASH_DURATION = 6000;
const EXIT_DELAY = 500;

const particles = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  delay: (i % 7) * 0.45,
  duration: 6 + (i % 4) * 1.2,
}));

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = Date.now();
    let completionTimer;

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      const nextProgress = Math.min(
        100,
        Math.round((elapsed / SPLASH_DURATION) * 100)
      );

      setProgress(nextProgress);

      if (nextProgress >= 100) {
        clearInterval(progressTimer);

        completionTimer = setTimeout(() => {
          setVisible(false);
        }, EXIT_DELAY);
      }
    }, 40);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(completionTimer);
    };
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        onComplete?.();
      }}
    >
      {visible && (
        <motion.div
          className="splash-screen"
          initial={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            transition: {
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
        >
          {/* Background */}
          <div className="splash-background" />
          <div className="splash-glow splash-glow-one" />
          <div className="splash-glow splash-glow-two" />

          {/* Floating golden particles */}
          <div className="splash-particles">
            {particles.map((particle) => (
              <motion.span
                key={particle.id}
                className="splash-particle"
                style={{
                  left: particle.left,
                  top: particle.top,
                }}
                animate={{
                  y: [-8, -35, -8],
                  opacity: [0.15, 0.75, 0.15],
                  scale: [0.7, 1.15, 0.7],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Brand content */}
          <motion.div
            className="splash-content"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Animated house logo */}
            <motion.div
              className="splash-logo"
              initial={{
                opacity: 0,
                scale: 0.65,
                rotate: -8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              transition={{
                duration: 1.5,
                delay: 0.4,
                type: "spring",
                stiffness: 65,
                damping: 18,
              }}
            >
              <motion.div
                className="splash-logo-ring"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              <svg
                className="splash-house-icon"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="EstateHub house logo"
                role="img"
              >
                <path
                  d="M12 46 L50 14 L88 46"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M22 42 V83 H78 V42"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M42 83 V59 H58 V83"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />

                <path
                  d="M32 48 H40 M36 44 V52 M60 48 H68 M64 44 V52"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>

              <motion.span
                className="splash-logo-orbit"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>

            {/* Website name */}
            <motion.h1
              className="splash-title"
              initial={{
                opacity: 0,
                letterSpacing: "12px",
                y: 12,
              }}
              animate={{
                opacity: 1,
                letterSpacing: "2px",
                y: 0,
              }}
              transition={{
                duration: 1.7,
                delay: 0.9,
                ease: "easeInOut",
              }}
            >
              Estate<span>Hub</span>
            </motion.h1>

            {/* Decorative divider */}
            <motion.div
              className="splash-divider"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 100, opacity: 1 }}
              transition={{
                duration: 1.3,
                delay: 1.4,
                ease: "easeInOut",
              }}
            />

            {/* Tagline */}
            <motion.p
              className="splash-tagline"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.8,
                duration: 1.2,
                ease: "easeOut",
              }}
            >
              FIND <span>•</span> EXPLORE <span>•</span> BELONG
            </motion.p>


            {/* Smooth Loading Bar */}
            <div
              className="splash-loader"
              role="progressbar"
              aria-label="Preparing your EstateHub experience"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div className="splash-loader-track">
                <div
                  className="splash-loader-fill"
                  style={{
                    transform: `scaleX(${progress / 100})`,
                  }}
                >
                  <span className="splash-loader-shine" />
                </div>
              </div>

              <div className="splash-loading-info">
                <span>PREPARING YOUR EXPERIENCE</span>
                <span>{progress}%</span>
              </div>
            </div>


            {/* Bottom text */}
            <motion.p
              className="splash-bottom-text"
              animate={{ opacity: [0.45, 0.85, 0.45] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Your next chapter starts here.
            </motion.p>
          </motion.div>

          {/* Corner decorations */}
          <div className="splash-corner splash-corner-tl" />
          <div className="splash-corner splash-corner-br" />

          <div className="splash-version">
            ESTATEHUB · REAL ESTATE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
