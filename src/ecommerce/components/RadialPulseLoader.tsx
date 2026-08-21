// src/ecommerce/components/loading-animation.tsx
import { motion } from 'framer-motion';

interface LoaderProps {
  text?: string;
}

export function RadialPulseLoader({ text = 'Loading...' }: LoaderProps) {
  return (
    <Wrapper text={text}>
      <div className="relative w-20 h-20 flex items-center justify-center">
        {[0, 0.5, 1, 1.5].map((delay) => (
          <motion.span
            key={delay}
            className="absolute rounded-full border-2 border-primary-500"
            initial={{ width: 12, height: 12, opacity: 0.8 }}
            animate={{ width: 80, height: 80, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay }}
          />
        ))}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 w-4 h-4 rounded-full bg-primary-600 shadow-lg shadow-primary-500/50"
        />
      </div>
    </Wrapper>
  );
}

export function OrbitalLoader({ text = 'Loading...' }: LoaderProps) {
  return (
    <Wrapper text={text}>
      <div className="relative w-20 h-20 flex items-center justify-center">
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        >
          {[0, 120, 240].map((angle) => (
            <span
              key={angle}
              className="absolute w-2.5 h-2.5 rounded-full bg-primary-500"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translateY(-32px)`,
              }}
            />
          ))}
        </motion.div>
        <div className="w-3 h-3 rounded-full bg-primary-700" />
      </div>
    </Wrapper>
  );
}

export function PendulumLoader({ text = 'Loading...' }: LoaderProps) {
  return (
    <Wrapper text={text}>
      <div className="w-20 h-12 flex items-end justify-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            className="w-2 bg-primary-500 rounded-full origin-bottom"
            animate={{ scaleY: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
            style={{ height: 32 }}
          />
        ))}
      </div>
    </Wrapper>
  );
}

export function PulseLoader({ text = 'Loading...' }: LoaderProps) {
  return (
    <Wrapper text={text}>
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-4 h-4 rounded-full bg-primary-500"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
          />
        ))}
      </div>
    </Wrapper>
  );
}

export function ConcentricLoader({ text = 'Loading...' }: LoaderProps) {
  return (
    <Wrapper text={text}>
      <div className="relative w-20 h-20 flex items-center justify-center">
        {[64, 44, 24].map((size, i) => (
          <motion.span
            key={size}
            className="absolute rounded-full border-2 border-primary-400"
            style={{ width: size, height: size }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 2 + i, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>
    </Wrapper>
  );
}

export function SequentialLoader({ text = 'Loading...' }: LoaderProps) {
  return (
    <Wrapper text={text}>
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="w-3 h-3 rounded-full bg-primary-500"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
          />
        ))}
      </div>
    </Wrapper>
  );
}

function Wrapper({ children, text }: { children: React.ReactNode; text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-5">
        {children}
        {text && (
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="text-sm font-medium text-gray-500 tracking-wide"
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
}

export default RadialPulseLoader;