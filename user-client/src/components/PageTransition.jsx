
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigationType } from "react-router-dom";

const BLIND_COUNT = 10;
const COVER_DURATION = 0.48;
const STAGGER = 0.035;

const blinds = Array.from({ length: BLIND_COUNT }, (_, index) => ({
  id: index,
  from: index % 2 === 0 ? "-100%" : "100%",
}));

const PageTransition = ({ children }) => {
  const location = useLocation();
  const navigationType = useNavigationType();

  const [displayLocation, setDisplayLocation] = useState(location);
  const [phase, setPhase] = useState("idle");

  const latestLocation = useRef(location);
  const running = useRef(false);

  useEffect(() => {
    latestLocation.current = location;

    // Initial load: no transition.
    if (location.key === displayLocation.key) return;

    // Browser Back/Forward: update without curtains.
    if (navigationType === "POP") {
      setDisplayLocation(location);
      setPhase("idle");
      running.current = false;
      return;
    }

    // Prevent duplicate animations for the same navigation.
    if (running.current) return;

    running.current = true;
    setPhase("cover");
  }, [location, displayLocation.key, navigationType]);

  const handleCoverComplete = () => {
    if (phase !== "cover") return;

    // The new route is mounted while the screen is covered.
    setDisplayLocation(latestLocation.current);
    setPhase("reveal");
  };

  const handleRevealComplete = () => {
    if (phase !== "reveal") return;

    setPhase("idle");
    running.current = false;
  };

  const isActive = phase !== "idle";

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          visibility: phase === "cover" ? "hidden" : "visible",
        }}
      >
        {/*
          Routes receives the previous location until the cover finishes.
          This prevents the next page flashing before the blinds close.
        */}
        {children.type
          ? children.type({
              ...children.props,
              location: displayLocation,
            })
          : children}
      </div>

      {isActive && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "grid",
            gridTemplateColumns: `repeat(${BLIND_COUNT}, minmax(0, 1fr))`,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          {blinds.map((blind, index) => (
            <motion.div
              key={blind.id}
              initial={{
                y: phase === "cover" ? blind.from : "0%",
              }}
              animate={{
                y: phase === "cover" ? "0%" : blind.from,
              }}
              transition={{
                duration: COVER_DURATION,
                delay: index * STAGGER,
                ease: [0.76, 0, 0.24, 1],
              }}
              onAnimationComplete={
                index === BLIND_COUNT - 1
                  ? phase === "cover"
                    ? handleCoverComplete
                    : handleRevealComplete
                  : undefined
              }
              style={{
                height: "100%",
                background:
                  index % 2 === 0 ? "#061A2F" : "#0A2540",
                borderRight: "1px solid rgba(214, 170, 77, 0.35)",
                boxShadow: "inset 0 0 16px rgba(0, 0, 0, 0.12)",
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default PageTransition;
