import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { ArrowRight, ShoppingBag, Zap, Trophy, ChevronRight } from 'lucide-react';

export function IgnitionHomeSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    let hasScrolledManually = false;

    const cancelAutoScroll = () => {
      if (cancelled) return;
      cancelled = true;
      if (scrollTimer) clearTimeout(scrollTimer);
      window.removeEventListener('scroll', onManualScroll);
      window.removeEventListener('wheel', onManualScroll);
      window.removeEventListener('touchmove', onManualScroll);
    };

    const onManualScroll = () => {
      if (hasScrolledManually) return;
      hasScrolledManually = true;
      cancelAutoScroll();
    };

    scrollTimer = setTimeout(() => {
      if (cancelled) return;
      if (hasScrolledManually) return;
      const el = document.getElementById('ignition-2k26');
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      window.removeEventListener('scroll', onManualScroll);
      window.removeEventListener('wheel', onManualScroll);
      window.removeEventListener('touchmove', onManualScroll);
    }, 1500);

    window.addEventListener('scroll', onManualScroll, { passive: true });
    window.addEventListener('wheel', onManualScroll, { passive: true });
    window.addEventListener('touchmove', onManualScroll, { passive: true });

    return () => {
      cancelAutoScroll();
    };
  }, []);

  return (
    <section
      id="ignition-2k26"
      ref={sectionRef}
      className="relative py-20 md:py-28 overflow-hidden bg-gray-950"
    >
      {/* Dark Blurred Banner Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('assets/event_home.png')`,
            filter: 'blur(7px) brightness(1.8)',
            transform: 'scale(1.1)',
          }}
        />
        {/* Additional dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Animated blobs - moved to z-[1] to appear above background */}
      <motion.div
        className="absolute -top-20 -left-10 w-72 h-72 rounded-full bg-primary-600/15 blur-3xl z-[1]"
        animate={{ y: [0, 20, 0], x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary-500/10 blur-3xl z-[1]"
        animate={{ y: [0, -20, 0], x: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative container mx-auto px-4 md:px-6 lg:px-8 z-[2]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-400/30 backdrop-blur-md mb-6"
          >
            <Zap className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-300">Electronics Project Competition</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold font-poppins text-white mb-3"
          >
            IGNITE <span className="text-gradient">2K26</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl font-bold text-primary-300 mb-6 tracking-wide"
          >
            BUILD IT. INNOVATE IT. WIN IT.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto mb-4"
          >
            "Your kit is more than just a collection of components — it's your chance to build something extraordinary."
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base text-gray-400 max-w-2xl mx-auto mb-8"
          >
            Get the IGNITE 2K26 kit from MICCROTEN, use your unique kit UID to register, build your own innovative project, and submit it before the final deadline.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-400/30 backdrop-blur-md">
              <Trophy className="h-6 w-6 text-amber-400" />
              <span className="text-lg font-bold text-amber-300">1st Prize — ₹1,00,000</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-400/15 to-gray-500/10 border border-gray-300/30 backdrop-blur-md">
              <Trophy className="h-6 w-6 text-gray-300" />
              <span className="text-lg font-bold text-gray-200">2nd Prize — ₹75,000</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500/15 to-orange-600/10 border border-orange-400/30 backdrop-blur-md">
              <Trophy className="h-6 w-6 text-orange-400" />
              <span className="text-lg font-bold text-orange-300">3rd Prize — ₹50,000</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500/15 to-sky-600/10 border border-sky-400/30 backdrop-blur-md">
              <Trophy className="h-6 w-6 text-sky-400" />
              <span className="text-lg font-bold text-sky-300">4th Prize — ₹35,000</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 border border-emerald-400/30 backdrop-blur-md">
              <Trophy className="h-6 w-6 text-emerald-400" />
              <span className="text-lg font-bold text-emerald-300">5th Prize — ₹25,000</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-12"
          >
            <motion.a
              href="/event"
              whileHover={{ scale: 1.05 }}
              className="relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-primary-200 bg-white/10 backdrop-blur-md border border-primary-400/30 hover:bg-white/15 shadow-primary-500/40 hover:shadow-xl hover:border-primary-400/50 transition-all"
            >
              <Zap className="h-5 w-5" />
              Register Now
              <ChevronRight className="h-4 w-4" />
            </motion.a>

            <motion.a
              href="/product/11"
              animate={{ scale: [1, 1.14, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.28 }}
              className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary-900 to-primary-500 shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-400/50 transition-all"
            >
              <ShoppingBag className="h-5 w-5" />
              Order Kit Now
              <ArrowRight className="h-4 w-4" />
            </motion.a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 text-sm text-gray-500 italic"
          >
            One Kit. One Idea. One Chance to Win.
          </motion.p>
        </div>
      </div>
    </section>
  );
}