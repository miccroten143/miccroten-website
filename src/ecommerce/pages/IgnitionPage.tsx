import { useEffect, useState } from 'react';
import eventImage from '../../../public/assets/event.png';
import { motion } from 'framer-motion';
import {
  Zap, ShoppingBag, Trophy, ArrowRight, Lock, Mail, Calendar, Upload,
  Home, Store, Wrench, Lightbulb, GraduationCap, Rocket, Target,
} from 'lucide-react';
import { PremiumLoader } from '../components/PremiumLoader';
import { IgnitionRegistration } from '../components/IgnitionRegistration';

export default function IgnitionPage() {
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <PremiumLoader isLoading={pageLoading} text="Preparing IGNITE 2K26..." />
      {!pageLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.98 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.5, ease: 'easeOut' }} 
          className="min-h-screen bg-gray-950 relative overflow-hidden"
        >
          {/* Dark Blurred Background Image - Applies to entire page */}
          <div className="fixed inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${eventImage})`,
                filter: 'blur(4px) brightness(1.5)',
                transform: 'scale(1.1)',
              }}
            />
            {/* Additional dark overlay */}
            <div className="absolute inset-0 bg-black/70" />
          </div>

          {/* Grid pattern overlay */}
          <div
            className="fixed inset-0 opacity-[0.03] pointer-events-none z-[1]"
            style={{
              backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          {/* Content with relative positioning */}
          <div className="relative z-[2]">
            <IgnitionTopNav />
            <EventHero />
            <HowItWorks />
            <PrizeSection />
            <HowToParticipate />
            <MarketingSection />
            <WhyParticipate />
            <WhoCanParticipate />
            <ProjectRequirement />
            <DeadlineMessage />
            <ProjectSubmissionLocked />
            <RegistrationSection />
            <FinalCTA />
            <IgnitionFooter />
          </div>
        </motion.div>
      )}
    </>
  );
}

function IgnitionTopNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/assets/footer-logo.png" alt="MICCROTEN" className="h-10 w-10 object-contain" />
          <span className="text-white font-bold font-poppins">MICCROTEN</span>
        </a>
        <nav className="flex items-center gap-2 md:gap-3">
          <a href="/" className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
            <Home size={16} /> <span className="hidden sm:inline">Home</span>
          </a>
          <a href="/shop" className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/30 transition-all">
            <Store size={16} /> <span className="hidden sm:inline">Store</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

function EventHero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Removed individual background image since it's now global */}
      <motion.div className="absolute -top-10 -left-8 w-56 h-56 rounded-full bg-primary-500/20 blur-3xl" animate={{ y: [0, 18, 0], x: [0, 12, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-primary-600/15 blur-3xl" animate={{ y: [0, -20, 0], x: [0, -14, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
      <div className="relative container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-400/30 backdrop-blur-md mb-6">
          <Zap className="h-4 w-4 text-primary-400" />
          <span className="text-sm font-medium text-primary-300">Electronics Project Competition 2026</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-7xl font-bold font-poppins text-white mb-4">IGNITE <span className="text-gradient">2K26</span></motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-xl md:text-2xl font-bold text-primary-300 mb-8 tracking-wide">BUILD. INNOVATE. COMPETE. WIN.</motion.p>
        <div className="space-y-4 max-w-3xl">
          {[
            "IGNITE 2K26 is more than an electronics competition. It is a challenge to turn a kit of electronic components into an idea that works, solves a problem, and stands out.",
            "Get your IGNITE 2K26 kit from MICCROTEN, discover the components inside, and start building. Every kit comes with a unique UID that unlocks your opportunity to participate.",
            "Once you have your kit, register for IGNITE 2K26 using the UID provided with it. Then comes the real challenge — transform the components into your own project and show us what you can create.",
            "Build something useful. Build something innovative. Build something unexpected. Your project doesn't have to be complicated — it needs to demonstrate creativity, implementation, and the ability to turn an idea into reality.",
          ].map((para, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="text-gray-300 leading-relaxed">{para}</motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'ORDER YOUR KIT', desc: 'Purchase the IGNITE 2K26 electronics kit from the MICCROTEN Store.' },
    { num: '02', title: 'GET YOUR UID', desc: 'Your kit contains a unique UID.' },
    { num: '03', title: 'VERIFY YOUR UID', desc: 'Enter the UID on the website.' },
    { num: '04', title: 'REGISTER', desc: 'Complete your participant details.' },
    { num: '05', title: 'BUILD YOUR PROJECT', desc: 'Create your innovative project using the kit.' },
    { num: '06', title: 'COMPETE & WIN', desc: 'Submit your project when submission opens.' },
  ];
  return (
    <section className="py-20 bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold font-poppins text-white text-center mb-12">HOW IT <span className="text-gradient">WORKS</span></motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative p-6 rounded-xl bg-white/10 backdrop-blur-md border border-gray-800 hover:border-primary-500 hover:bg-blue-700/30 transition-all">
              <span className="text-4xl font-bold text-primary-600/40 font-mono">{step.num}</span>
              <h3 className="text-lg font-bold text-white mt-2 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrizeSection() {
  const prizes = [
    { emoji: '🏆', label: '1st PRIZE', amount: '₹1,00,000', color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-400/30', text: 'text-amber-300' },
    { emoji: '🥈', label: '2nd PRIZE', amount: '₹50,000', color: 'from-gray-400/20 to-gray-500/10', border: 'border-gray-300/30', text: 'text-gray-200' },
  ];
  return (
    <section className="py-20 bg-gray-950/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl md:text-4xl font-bold font-poppins text-white text-center mb-12 max-w-2xl mx-auto">THE BIGGER YOU DREAM,<br />THE BIGGER YOU CAN <span className="text-gradient">WIN.</span></motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {prizes.map((prize, i) => (
            <motion.div key={prize.label} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} whileHover={{ scale: 1.04 }} className={`relative p-8 rounded-2xl bg-gradient-to-br ${prize.color} border ${prize.border} backdrop-blur-md text-center overflow-hidden`}>
              <div className="absolute inset-0 opacity-10"><div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white blur-3xl" /></div>
              <div className="relative">
                <div className="text-5xl mb-4">{prize.emoji}</div>
                <p className={`text-sm font-bold uppercase tracking-wider ${prize.text} mb-2`}>{prize.label}</p>
                <p className={`text-4xl md:text-5xl font-bold ${prize.text}`}>{prize.amount}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowToParticipate() {
  const steps = [
    { num: '01', title: 'GET THE KIT', desc: 'Order the IGNITE 2K26 electronics kit from the MICCROTEN Store.', cta: true },
    { num: '02', title: 'FIND YOUR UID', desc: 'Your kit comes with a unique UID. Keep this UID safe. You need it to register.' },
    { num: '03', title: 'REGISTER', desc: 'Enter your UID. Verify your UID. Complete your participant details.' },
    { num: '04', title: 'BUILD YOUR PROJECT', desc: 'Use the components from your kit to create your own project. Think beyond the obvious. Create something useful, innovative, creative, and technically impressive.' },
    { num: '05', title: 'SUBMIT BEFORE THE DEADLINE', desc: 'Complete your project and submit it before the final submission deadline.', note: 'Submission deadline will be announced soon.' },
    { num: '06', title: 'COMPETE & WIN', desc: 'The best projects will have the opportunity to win ₹1,00,000 and ₹50,000.' },
  ];
  return (
    <section className="py-20 bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold font-poppins text-white text-center mb-12">HOW TO ENTER <span className="text-gradient">IGNITE 2K26</span></motion.h2>
        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} whileHover={{ scale: 1.04 }} transition={{ delay: i * 0.08 }} className="flex gap-6 p-6 rounded-xl bg-white/10 backdrop-blur-md border border-gray-800 hover:border-primary-300 hover:bg-blue-900/30 transition-all">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary-600/20 flex items-center justify-center"><span className="text-xl font-bold font-mono text-primary-400">{step.num}</span></div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                {step.note && <p className="mt-2 text-sm text-amber-400 bg-amber-500/10 inline-block px-3 py-1 rounded-lg">{step.note}</p>}
                {step.cta && (
                  <a href="/shop" className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/30 transition-all text-sm">
                    <ShoppingBag size={16} /> ORDER YOUR KIT <ArrowRight size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketingSection() {
  return (
    <section className="py-20 bg-gray-950/60 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-600/10 blur-3xl" /></div>
      <div className="relative container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl md:text-4xl font-bold font-poppins text-white mb-8">YOUR IDEA COULD BE THE <span className="text-gradient">NEXT BIG THING.</span></motion.h2>
        <div className="space-y-4">
          {[
            "You don't need an expensive laboratory. You don't need a huge team. You need an idea, the right components, and the courage to build it.",
            "Take the challenge. Build your project. Put your skills to the test.",
            "Who knows? The project you build with your kit could take you all the way to the ₹1,00,000 first prize.",
          ].map((text, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-lg text-gray-300 leading-relaxed">{text}</motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyParticipate() {
  const cards = [
    { icon: Wrench, title: 'BUILD', desc: 'Turn components into a working project.' },
    { icon: Lightbulb, title: 'INNOVATE', desc: 'Solve a problem with your own idea.' },
    { icon: GraduationCap, title: 'LEARN', desc: 'Gain practical experience in electronics and project development.' },
    { icon: Rocket, title: 'SHOWCASE', desc: 'Put your skills and creativity in front of others.' },
    { icon: Target, title: 'COMPETE', desc: 'Challenge yourself against other participants.' },
    { icon: Trophy, title: 'WIN', desc: 'Compete for ₹1,00,000 and ₹50,000 prizes.' },
  ];
  return (
    <section className="py-20 bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold font-poppins text-white text-center mb-12">WHY SHOULD YOU <span className="text-gradient">PARTICIPATE?</span></motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cards.map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }} className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-gray-800 hover:border-primary-300 hover:bg-blue-900/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary-600/20 flex items-center justify-center mb-4"><card.icon className="h-6 w-6 text-primary-400" /></div>
              <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-gray-400">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoCanParticipate() {
  const groups = ['Students', 'Electronics enthusiasts', 'Makers', 'Developers', 'Engineering students', 'Hobbyists', 'Innovators', 'Technology enthusiasts'];
  return (
    <section className="py-20 bg-gray-950/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold font-poppins text-white mb-6">WHO IS THIS <span className="text-gradient">FOR?</span></motion.h2>
        <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-300 mb-8 max-w-2xl mx-auto">IGNITE 2K26 is designed for people who love building and experimenting with technology.</motion.p>
        <div className="flex flex-wrap justify-center gap-3">
          {groups.map((g, i) => (
            <motion.span key={g} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="px-4 py-2 rounded-lg bg-white/10 border border-gray-800 text-gray-300 text-sm font-medium backdrop-blur-sm">{g}</motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectRequirement() {
  return (
    <section className="py-20 bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold font-poppins text-white mb-6">YOUR KIT. YOUR IDEA. <span className="text-gradient">YOUR PROJECT.</span></motion.h2>
        <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-300 mb-4 max-w-2xl mx-auto">Your project should be built using the components provided in the IGNITE 2K26 kit, according to the official competition guidelines.</motion.p>
        <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-sm text-amber-400 bg-amber-500/10 inline-block px-4 py-2 rounded-lg backdrop-blur-sm">Detailed project guidelines will be announced soon.</motion.p>
      </div>
    </section>
  );
}

function DeadlineMessage() {
  return (
    <section className="py-20 bg-gray-950/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-400/30 backdrop-blur-md mb-6">
          <Calendar className="h-4 w-4 text-primary-400" /><span className="text-sm font-medium text-primary-300">PROJECT SUBMISSION</span>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-white mb-4">Don't wait until the last moment.</motion.h2>
        <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-300 mb-2">Build early. Test thoroughly. Submit before the final deadline.</motion.p>
        <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-amber-400 font-medium mb-2">Submission deadline will be announced soon.</motion.p>
        <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-sm text-gray-400 flex items-center justify-center gap-2"><Mail size={14} /> All registered participants will receive an email notification when project submission opens and when the final deadline is announced.</motion.p>
      </div>
    </section>
  );
}

function ProjectSubmissionLocked() {
  return (
    <section className="py-20 bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-white mb-6">READY TO SHOW THE WORLD WHAT YOU BUILT?</motion.h2>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6 backdrop-blur-sm">
          <Lock className="h-5 w-5 text-amber-400" /><span className="text-lg font-bold text-amber-300">Submission Opens Soon</span>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-300 mb-2">The project submission date has not been announced yet.</motion.p>
        <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-gray-400 mb-8">If you register for IGNITE 2K26, we'll notify you through email when submissions open.</motion.p>
        <button disabled className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium text-gray-500 bg-gray-800 border border-gray-700 cursor-not-allowed opacity-60"><Upload size={18} /> Upload Your Project</button>
      </div>
    </section>
  );
}

function RegistrationSection() {
  return (
    <section className="py-20 bg-gray-950/60 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-primary-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-primary-500/10 blur-3xl" />
      </div>
      <div className="relative container mx-auto px-4 md:px-6 lg:px-8"><IgnitionRegistration /></div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl md:text-4xl font-bold font-poppins text-white mb-4">READY TO TAKE THE <span className="text-gradient">CHALLENGE?</span></motion.h2>
        <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-300 mb-8">Get the kit. Build your idea. Compete for ₹1,00,000.</motion.p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.a href="/shop" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} whileHover={{ scale: 1.08 }} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg shadow-primary-500/40 transition-all"><ShoppingBag className="h-5 w-5" /> ORDER YOUR KIT</motion.a>
          <motion.a href="#ignition-register" whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-primary-200 bg-white/10 backdrop-blur-md border border-primary-400/30 hover:bg-white/15 transition-all"><Zap className="h-5 w-5" /> REGISTER NOW</motion.a>
        </div>
      </div>
    </section>
  );
}

function IgnitionFooter() {
  return (
    <footer className="bg-gray-950/80 backdrop-blur-sm border-t border-gray-800 py-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/assets/footer-logo.png" alt="MICCROTEN" className="h-8 w-8 object-contain" />
          <span className="text-white font-bold font-poppins">MICCROTEN</span>
        </div>
        <p className="text-gray-500 text-sm mb-2">IGNITE 2K26 — Electronics Project Competition</p>
        <p className="text-gray-600 text-xs">© 2025 MICCROTEN Technologies. All rights reserved.</p>
      </div>
    </footer>
  );
}