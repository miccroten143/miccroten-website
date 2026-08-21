'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { ChevronDown, ArrowUp, List, Shield, FileCheck } from 'lucide-react';
import { StoreLayout } from './StoreLayout';

// ---------- Shared context: powers TOC + scrollspy ----------
interface SectionMeta {
  id: string;
  number: number;
  title: string;
}

interface PolicyContextValue {
  sections: SectionMeta[];
  registerSection: (meta: SectionMeta) => void;
  activeId: string | null;
}

const PolicyContext = createContext<PolicyContextValue | null>(null);

function usePolicyContext() {
  const ctx = useContext(PolicyContext);
  if (!ctx) throw new Error('PolicySection must be used inside PolicyLayout');
  return ctx;
}

// ---------- Layout ----------
interface PolicyLayoutProps {
  title: string;
  subtitle?: string;
  effectiveDate: string;
  children: ReactNode;
}

export function PolicyLayout({ title, subtitle, effectiveDate, children }: PolicyLayoutProps) {
  const [sections, setSections] = useState<SectionMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tocOpenMobile, setTocOpenMobile] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const registerSection = useCallback((meta: SectionMeta) => {
    setSections((prev) =>
      prev.some((s) => s.id === meta.id)
        ? prev
        : [...prev, meta].sort((a, b) => a.number - b.number)
    );
  }, []);

  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlights active section in TOC as you scroll
  useEffect(() => {
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setTocOpenMobile(false);
  };

  return (
    <PolicyContext.Provider value={{ sections, registerSection, activeId }}>
      <StoreLayout>
        {/* Reading progress bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400 origin-left z-50"
          style={{ scaleX: progressScaleX }}
        />

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-r from-primary-700 to-primary-500 text-white py-10 md:py-14">
          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Animated gradient wash */}
          <motion.div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'linear-gradient(120deg, rgba(255,255,255,0.15), rgba(255,255,255,0) 40%, rgba(255,255,255,0.1) 70%)',
              backgroundSize: '200% 200%',
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />

          {/* Floating blurred circles */}
          <motion.div
            className="absolute -top-10 -left-8 w-48 h-48 rounded-full bg-white/10 blur-3xl"
            animate={{ y: [0, 16, 0], x: [0, 12, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-6 right-0 w-64 h-64 rounded-full bg-primary-300/20 blur-3xl"
            animate={{ y: [0, -18, 0], x: [0, -14, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          <div className="relative container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
            <div className="flex items-center justify-between gap-8">
              <div className="min-w-0">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-2xl md:text-3xl lg:text-4xl font-bold font-poppins mb-3"
                >
                  {title}
                </motion.h1>
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-base md:text-lg text-white/90 max-w-xl"
                  >
                    {subtitle}
                  </motion.p>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm text-white/90"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                  Effective Date: {effectiveDate}
                </motion.div>
              </div>

              {/* Floating icon illustration - desktop only */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden md:flex relative shrink-0 w-32 h-32 lg:w-40 lg:h-40 items-center justify-center"
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/10 blur-xl"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.9, 0.6] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="relative w-full h-full rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Shield className="w-14 h-14 lg:w-16 lg:h-16 text-white/90" strokeWidth={1.5} />
                  <motion.div
                    className="absolute -bottom-2 -right-2 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <FileCheck className="w-5 h-5 lg:w-6 lg:h-6 text-primary-600" strokeWidth={2} />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl py-12 md:py-16">
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
            {/* Sticky TOC - desktop */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  On this page
                </p>
                <nav className="space-y-1 border-l border-gray-200">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollToSection(s.id)}
                      className={`block w-full text-left pl-4 -ml-px py-1.5 text-sm border-l-2 transition-colors ${activeId === s.id
                          ? 'border-primary-600 text-primary-700 font-medium'
                          : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                        }`}
                    >
                      {s.number}. {s.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Mobile TOC toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setTocOpenMobile((v) => !v)}
                className="flex items-center gap-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-100 rounded-lg px-4 py-2.5 w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  On this page
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${tocOpenMobile ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {tocOpenMobile && (
                  <motion.nav
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 border border-gray-100 rounded-lg divide-y divide-gray-100 bg-white">
                      {sections.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => scrollToSection(s.id)}
                          className={`block w-full text-left px-4 py-2.5 text-sm ${activeId === s.id ? 'text-primary-700 font-medium bg-primary-50' : 'text-gray-600'
                            }`}
                        >
                          {s.number}. {s.title}
                        </button>
                      ))}
                    </div>
                  </motion.nav>
                )}
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-poppins prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-0 prose-h2:mb-4 prose-h3:text-xl md:prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-gray-900 prose-a:text-primary-600 hover:prose-a:text-primary-700">
              {children}
            </div>
          </div>
        </div>

        {/* Back to top */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 20 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 flex items-center justify-center hover:bg-primary-700 transition-colors"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </StoreLayout>
    </PolicyContext.Provider>
  );
}

// ---------- Animated divider ----------
export function PolicyDivider() {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="h-px my-10 origin-left bg-gradient-to-r from-primary-500 via-gray-200 to-transparent"
    />
  );
}

// ---------- Section: glass card + accordion + scrollspy target ----------
interface PolicySectionProps {
  number: number;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
}

export function PolicySection({
  number,
  title,
  children,
  defaultOpen = true,
  collapsible = true,
}: PolicySectionProps) {
  const { registerSection } = usePolicyContext();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const id = `section-${number}`;

  useEffect(() => {
    registerSection({ id, number, title });
  }, [id, number, title, registerSection]);

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="mb-8 scroll-mt-24 rounded-2xl border border-gray-100 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
    >
      <button
        onClick={() => collapsible && setIsOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-4 text-left px-6 py-5 md:px-8 md:py-6 ${collapsible ? 'cursor-pointer' : 'cursor-default'
          }`}
        aria-expanded={isOpen}
      >
        <h2 className="flex items-baseline gap-3 text-xl md:text-2xl font-bold font-poppins text-gray-900 m-0">
          <span className="text-primary-500">{number}.</span>
          {title}
        </h2>
        {collapsible && (
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="shrink-0 text-gray-400"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 md:px-8 md:pb-8 space-y-4 text-gray-600 leading-relaxed text-base md:text-lg">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}