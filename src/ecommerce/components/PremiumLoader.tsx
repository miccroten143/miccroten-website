import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const LOADING_TEXTS = [
  'Initializing...',
  'Loading...',
  'Preparing...',
  'Almost there...',
];

interface PremiumLoaderProps {
  isLoading: boolean;
  text?: string;
  loadingTexts?: string[];
}

export function PremiumLoader({
  isLoading,
  text,
  loadingTexts = LOADING_TEXTS,
}: PremiumLoaderProps) {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setTextIndex((i) => (i + 1) % loadingTexts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isLoading, loadingTexts]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-3xl" />
            <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-primary-500/5 blur-3xl" />
          </div>

          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute block w-1 h-1 rounded-full bg-primary-400/40"
              style={{ left: `${(i * 67) % 100}%`, top: `${(i * 41) % 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.1, 0.5, 0.1] }}
              transition={{ duration: 3 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
            />
          ))}

          <div className="relative flex flex-col items-center">
            <div className="relative w-28 h-28 flex items-center justify-center mb-8">
              <motion.svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(14, 165, 233, 0.6)" strokeWidth="2" strokeLinecap="round" strokeDasharray="80 210" />
              </motion.svg>

              <motion.svg
                className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)]"
                viewBox="0 0 100 100"
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="1" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="40 236" />
              </motion.svg>

              {[0, 90, 180, 270].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary-400"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${angle}deg) translateY(-52px)`,
                  }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                />
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative z-10"
              >
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="absolute inset-0 blur-lg bg-primary-500/30 rounded-full" />
                  <img
                    src="/assets/logo.png"
                    alt="MICCROTEN"
                    className="relative w-14 h-14 object-contain"
                  />
                </motion.div>
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg font-bold font-poppins text-white tracking-wide mb-2"
            >
              MICCROTEN <span className="text-primary-400">TECHNOLOGIES</span>
            </motion.h2>

            <div className="h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={text ?? textIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-gray-400 font-medium"
                >
                  {text ?? loadingTexts[textIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-6 w-48 h-0.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-300 rounded-full"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
