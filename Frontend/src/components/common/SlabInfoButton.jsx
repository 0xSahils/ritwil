import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLAB_DISCLAIMER =
  "The 5% commission or the applicable slab rate shall be calculated solely on the incremental revenue generated above the 121% threshold.";

export default function SlabInfoButton() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <span
      ref={wrapperRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Pulsing glow effect behind button */}
      <motion.div
        className="absolute inset-0 rounded-full bg-indigo-500/30 blur-sm"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main button with blinking/pulsing animation */}
      <motion.button
        type="button"
        aria-label="Slab qualification info"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
        animate={{
          scale: [1, 1.06, 1],
          boxShadow: [
            "0 2px 8px rgba(99, 102, 241, 0.3)",
            "0 4px 12px rgba(99, 102, 241, 0.5)",
            "0 2px 8px rgba(99, 102, 241, 0.3)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.1,
          boxShadow: "0 4px 16px rgba(99, 102, 241, 0.5)",
        }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Inner glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-white/30"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span className="relative z-10 text-[10px] font-bold leading-none">i</span>
      </motion.button>

      {/* Tooltip with smooth connection */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{
              duration: 0.25,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute bottom-full left-1/2 z-50 mb-2.5 w-80 -translate-x-1/2"
          >
            {/* Tooltip content */}
            <motion.div
              className="relative rounded-xl border border-indigo-200/80 bg-gradient-to-br from-white to-indigo-50/30 px-5 py-4 shadow-xl shadow-indigo-500/10 backdrop-blur-sm"
              initial={{ filter: "blur(4px)" }}
              animate={{ filter: "blur(0px)" }}
              transition={{ duration: 0.2 }}
            >
              {/* Decorative top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
              
              <p className="text-sm leading-relaxed text-slate-700 font-medium">
                {SLAB_DISCLAIMER}
              </p>

              {/* Arrow pointing to button - connected visually */}
              <motion.div
                className="absolute left-1/2 top-full -translate-x-1/2"
                initial={{ y: -4 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <svg
                  width="16"
                  height="12"
                  viewBox="0 0 16 12"
                  fill="none"
                  className="drop-shadow-sm"
                >
                  <path
                    d="M8 12L0 0h16L8 12z"
                    fill="white"
                    className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                  />
                  <path
                    d="M8 11L1.5 1h13L8 11z"
                    fill="url(#gradient-arrow)"
                  />
                  <defs>
                    <linearGradient id="gradient-arrow" x1="8" y1="1" x2="8" y2="11" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#EEF2FF" />
                      <stop offset="1" stopColor="#E0E7FF" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* Subtle glow effect */}
              <div className="absolute -inset-1 rounded-xl bg-indigo-500/5 blur-xl -z-10" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
