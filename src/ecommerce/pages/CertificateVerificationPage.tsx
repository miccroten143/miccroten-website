import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Search,
  QrCode,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
  Briefcase,
  FolderKanban,
  Users,
  Hash,
  Award,
  FileText,
  ExternalLink,
  Sparkles,
  Fingerprint,
  X,
  Home,
  Store,
} from 'lucide-react';
import { getInternCertificate } from '../../service/certificateService';
import type { InternCertificate } from '../../ecommerce/types';

const EXAMPLE_ID = 'M*IN*2023*001';

export default function CertificateVerificationPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'notfound'>('idle');
  const [certificate, setCertificate] = useState<InternCertificate | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || status === 'loading') return;
    setStatus('loading');
    setCertificate(null);
    const result = await getInternCertificate(query);
    if (result) {
      setCertificate(result);
      setStatus('found');
    } else {
      setStatus('notfound');
    }
  };

  const reset = () => {
    setStatus('idle');
    setCertificate(null);
    setQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative">
        <TopNav />
        <Hero />

        <section className="container mx-auto px-4 md:px-6 lg:px-8 pb-20 -mt-6 md:-mt-10">
          {/* Search card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-500 shadow-2xl shadow-primary-500/20">
              <div className="rounded-2xl bg-white/80 backdrop-blur-xl p-6 md:p-8">
                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter Certificate Number"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                      disabled={status === 'loading'}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading' || !query.trim()}
                    className="px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Search size={18} /> Verify
                  </button>
                </form>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 text-sm text-gray-400 px-4 py-2 rounded-lg border border-dashed border-gray-300 cursor-not-allowed"
                    title="QR scanning coming soon"
                  >
                    <QrCode size={16} /> Scan QR <span className="text-[10px] uppercase tracking-wider bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Soon</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuery(EXAMPLE_ID)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Try example: {EXAMPLE_ID}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <div className="max-w-3xl mx-auto mt-8">
            <AnimatePresence mode="wait">
              {status === 'loading' && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <KinematicLoader label="Verifying Certificate..." />
                </motion.div>
              )}

              {status === 'found' && certificate && (
                <VerifiedCard key="found" certificate={certificate} onReset={reset} />
              )}

              {status === 'notfound' && (
                <NotFoundCard key="notfound" query={query} onReset={reset} />
              )}

              {status === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
                >
                  {[
                    { icon: ShieldCheck, title: 'Authentic', desc: 'Every certificate is verified against our official records.' },
                    { icon: Fingerprint, title: 'Unique ID', desc: 'Each certificate has a one-of-a-kind verification number.' },
                    { icon: Sparkles, title: 'Instant', desc: 'Get confirmation in seconds, anytime, anywhere.' },
                  ].map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="rounded-xl bg-white/70 backdrop-blur-md border border-white/60 p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-3">
                        <f.icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}

function AnimatedBackground() {
  const particles = Array.from({ length: 18 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-200/30 blur-3xl" />
      <div className="absolute top-40 -right-40 w-96 h-96 rounded-full bg-secondary-200/30 blur-3xl" />
      {particles.map((_, i) => (
        <motion.span
          key={i}
          className="absolute block w-1.5 h-1.5 rounded-full bg-primary-400/40"
          style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%` }}
          animate={{ y: [0, -24, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function TopNav() {
  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center group">
          <img src="/assets/footer-logo.png" alt="MICCROTEN" className="h-24 w-24 object-contain drop-shadow-lg" />
          <div className="leading-tight">
            <span className="block text-white font-bold font-poppins text-lg tracking-tight drop-shadow-md">MICCROTEN</span>
            <span className="block text-white/70 text-[10px] uppercase tracking-[0.2em]">Technologies</span>
          </div>
        </a>
        <nav className="flex items-center gap-2 md:gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-sm font-medium text-white/90 bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/20 hover:text-white transition-all"
          >
            <Home size={16} /> <span className="hidden sm:inline">Home Page</span>
          </a>
          <a
            href="/shop"
            className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all"
          >
            <Store size={16} /> <span className="hidden sm:inline">Visit Store</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden text-white py-24 md:py-32">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://t3.ftcdn.net/jpg/09/00/82/00/360_F_900820049_PaEStww5X97haHvRCS2NmH63xzipiwml.jpg"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/30 via-gray-900/85 to-primary-900/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-gray-900/40" />
      </div>

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Floating glows */}
      <motion.div
        className="absolute -top-10 -left-8 w-56 h-56 rounded-full bg-primary-500/20 blur-3xl"
        animate={{ y: [0, 18, 0], x: [0, 12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-secondary-500/20 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, -14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-2xl"
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <ShieldCheck className="h-10 w-10 text-white" strokeWidth={1.5} />
          </motion.div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl md:text-5xl font-bold font-poppins mb-4 drop-shadow-lg"
        >
          Verify Internship Certificate
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-base md:text-lg text-white/90 max-w-2xl mx-auto drop-shadow"
        >
          Confirm the authenticity of internship certificates issued by MICCROTEN Technologies Pvt. Ltd. Enter the certificate number below to verify it instantly.
        </motion.p>
      </div>
    </section>
  );
}

function KinematicLoader({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-500 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundPosition: ['0% 50%', '200% 50%', '0% 50%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', backgroundSize: '200% 100%' }}
      />
      <div className="rounded-2xl bg-white/90 backdrop-blur-xl py-10 px-6 flex flex-col items-center">
        <div className="flex items-center gap-2.5 mb-5">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-br from-primary-500 to-primary-600"
              animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}>
            {label}
          </motion.span>
        </p>
      </div>
    </motion.div>
  );
}

function VerifiedCard({ certificate, onReset }: { certificate: InternCertificate; onReset: () => void }) {
  const verifiedAt = new Date().toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-emerald-400 via-primary-500 to-secondary-500 shadow-2xl shadow-emerald-500/20"
    >
      <div className="rounded-2xl bg-white/90 backdrop-blur-xl overflow-hidden">
        {/* Verified banner */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
              <CheckCircle2 className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Verified</h2>
              <p className="text-emerald-50 text-xs">This certificate is authentic and valid</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-white bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Verified {verifiedAt}
          </span>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          {/* Row 1: Certificate Number — full width */}
          <InfoCard index={0} icon={Hash} label="Certificate Number" value={certificate.certificate_number} mono highlight />

          {/* Row 2: Photo | Name */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="md:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all overflow-hidden group"
            >
              <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
                {certificate.photo_url ? (
                  <img src={certificate.photo_url} alt={certificate.intern_name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
                    <Users className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ y: -4 }}
              className="md:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all p-5 flex flex-col justify-center"
            >
              <div className="flex items-center gap-2 mb-2">
                <Fingerprint className="h-4 w-4 text-primary-500" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Intern Name</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{certificate.intern_name}</h3>
              <StatusPill status={certificate.status} />
            </motion.div>
          </div>

          {/* Row 3: Role | Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard index={1} icon={Briefcase} label="Role" value={certificate.role} />
            <InfoCard index={2} icon={FolderKanban} label="Project" value={certificate.project} />
          </div>

          {/* Row 4: Department | University */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard index={3} icon={Building2} label="Department" value={certificate.department} />
            <InfoCard index={4} icon={Users} label="University / College" value={certificate.university} />
          </div>

          {/* Row 5: Start Date | End Date | Issue Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoCard index={5} icon={Calendar} label="Start Date" value={formatDate(certificate.start_date)} />
            <InfoCard index={6} icon={Calendar} label="End Date" value={formatDate(certificate.end_date)} />
            <InfoCard index={7} icon={Award} label="Issue Date" value={formatDate(certificate.certificate_issue_date)} />
          </div>

          {/* Row 6: Certificate photo with verified watermark — full width */}
          {certificate.certificate_image_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all overflow-hidden group"
            >
              <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Certificate</span>
              </div>
              <div className="relative w-full overflow-hidden bg-gray-50">
                <img src={certificate.certificate_image_url} alt="Certificate" loading="lazy" className="w-full max-h-[420px] object-contain group-hover:scale-[1.02] transition-transform duration-500" />
                {/* Verified watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  <motion.span
                    initial={{
                      scale: 0.9,
                      opacity: 0.6,
                    }}
                    animate={{
                      scale: [0.95, 1.08, 1, 1.06, 0.95],
                      opacity: [0.45, 0.7, 0.55, 0.7, 0.45],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                    }}
                    className="text-green-500 font-bold text-4xl md:text-6xl tracking-widest rotate-[-18deg] select-none"
                  >
                    VERIFIED
                  </motion.span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" /> Verified on {verifiedAt}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {certificate.certificate_url && (
              <a
                href={certificate.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all"
              >
                <FileText size={18} /> Open Certificate <ExternalLink size={14} className="ml-1" />
              </a>
            )}
            <button onClick={onReset} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
              <X size={16} /> Verify another
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoCard({ index, icon: Icon, label, value, mono, highlight }: {
  index: number;
  icon: React.ElementType;
  label: string;
  value: string | null;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * (index + 1) }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all p-5 ${highlight ? 'border-primary-200 hover:border-primary-300' : 'border-gray-100 hover:border-primary-200'}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-primary-100' : 'bg-primary-50'}`}>
          <Icon className={`h-4 w-4 ${highlight ? 'text-primary-700' : 'text-primary-600'}`} />
        </div>
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`font-medium text-gray-900 ${mono ? 'font-mono' : ''} ${highlight ? 'text-lg' : 'text-sm'}`}>{value ?? '—'}</p>
    </motion.div>
  );
}

function NotFoundCard({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-rose-400 to-rose-500 shadow-2xl shadow-rose-500/20"
    >
      <motion.div
        animate={{ x: [0, -8, 8, -6, 6, 0] }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-white/90 backdrop-blur-xl p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-9 w-9 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          We couldn&apos;t find a certificate matching <span className="font-mono font-medium text-gray-700">&quot;{query}&quot;</span>. Please check the number and try again.
        </p>
        <button
          onClick={onReset}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/30 transition-all"
        >
          <Search size={16} /> Try Again
        </button>
      </motion.div>
    </motion.div>
  );
}

function StatusPill({ status }: { status: InternCertificate['status'] }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: 'Active', cls: 'bg-emerald-100 text-emerald-700' },
    revoked: { label: 'Revoked', cls: 'bg-rose-100 text-rose-700' },
    expired: { label: 'Expired', cls: 'bg-amber-100 text-amber-700' },
  };
  const s = map[status] ?? map.active;
  return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${s.cls}`}>{s.label}</span>;
}



function formatDate(date: string | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}
