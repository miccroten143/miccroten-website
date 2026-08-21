import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash, CheckCircle2, XCircle, Loader2, ArrowRight, User, Mail, Phone,
  Briefcase, Building2, FolderKanban, GraduationCap, Megaphone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyUid, registerParticipant, type RegistrationParams } from '../ignitionServices';

type VerificationState = 'idle' | 'verifying' | 'verified' | 'not_found' | 'already_registered';
type RegistrationState = 'idle' | 'submitting' | 'success';

const SUBMIT_STEPS = [
  'Processing Registration...',
  'Saving Registration...',
  'Confirming...',
];

export function IgnitionRegistration() {
  const [uid, setUid] = useState('');
  const [verifyState, setVerifyState] = useState<VerificationState>('idle');
  const [regState, setRegState] = useState<RegistrationState>('idle');
  const [submitStep, setSubmitStep] = useState(0);
  const [form, setForm] = useState({
    full_name: '', project_name: '', email: '', phone: '', role: '',
    college_company: '', department: '', source: '',
  });
  const [registrationId, setRegistrationId] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid.trim() || verifyState === 'verifying') return;
    setVerifyState('verifying');
    try {
      const result = await verifyUid(uid);
      if (result.valid) {
        setVerifyState('verified');
        toast.success('UID Verified!');
      } else if (result.reason === 'not_found') {
        setVerifyState('not_found');
      } else if (result.reason === 'already_registered') {
        setVerifyState('already_registered');
      }
    } catch {
      setVerifyState('not_found');
      toast.error('Failed to verify UID. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regState === 'submitting') return;
    if (!form.full_name || !form.project_name || !form.email || !form.phone || !form.role || !form.college_company || !form.source) {
      toast.error('Please fill all required fields');
      return;
    }
    setRegState('submitting');
    setSubmitStep(0);
    const stepInterval = setInterval(() => {
      setSubmitStep((s) => Math.min(s + 1, SUBMIT_STEPS.length - 1));
    }, 1200);
    try {
      const params: RegistrationParams = { uid: uid.trim(), ...form };
      const result = await registerParticipant(params);
      clearInterval(stepInterval);
      if (result.success && result.registrationId) {
        setRegistrationId(result.registrationId);
        setRegState('success');
        toast.success('Registration Successful!');
      } else {
        setRegState('idle');
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setRegState('idle');
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  };

  const reset = () => {
    setVerifyState('idle');
    setRegState('idle');
    setUid('');
    setRegistrationId('');
    setForm({ full_name: '', project_name: '', email: '', phone: '', role: '', college_company: '', department: '', source: '' });
  };

  return (
    <div id="ignition-register" className="scroll-mt-20">
      <AnimatePresence mode="wait">
        {verifyState !== 'verified' && regState !== 'success' && (
          <motion.div key="verification" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">READY TO ENTER?</h3>
              <p className="text-gray-400 mb-2">Got your IGNITION 2K26 kit?</p>
              <p className="text-gray-500 text-sm">Find the UID provided with your kit and verify it below to begin your registration.</p>
            </div>
            <form onSubmit={handleVerify} className="max-w-xl mx-auto">
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={uid}
                  onChange={(e) => {
                    setUid(e.target.value);
                    if (verifyState === 'not_found' || verifyState === 'already_registered') setVerifyState('idle');
                  }}
                  placeholder="Enter Your Kit UID"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-md border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all font-mono tracking-wider"
                  disabled={verifyState === 'verifying'}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={verifyState === 'verifying' || !uid.trim()}
                className="w-full mt-4 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifyState === 'verifying' ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Checking your kit...</>
                ) : (
                  <>Verify UID <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </form>
            <AnimatePresence>
              {verifyState === 'not_found' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 max-w-xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-rose-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-rose-300">Invalid UID</p>
                    <p className="text-sm text-rose-400/80">Please check your kit UID and try again.</p>
                  </div>
                </motion.div>
              )}
              {verifyState === 'already_registered' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 max-w-xl mx-auto p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-300">Already Registered</p>
                    <p className="text-sm text-amber-400/80">This UID has already been registered.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {verifyState === 'verified' && regState !== 'success' && (
          <motion.div key="form" initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
            <div className="max-w-xl mx-auto mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-emerald-300">UID Verified</p>
                <p className="text-sm text-emerald-400/80 font-mono">{uid}</p>
              </div>
              <button onClick={reset} className="text-sm text-gray-400 hover:text-white transition-colors">Change</button>
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">COMPLETE YOUR REGISTRATION</h3>
              <p className="text-gray-400 text-sm">Fill in your details to join IGNITION 2K26</p>
            </div>
            <form onSubmit={handleRegister} className="max-w-xl mx-auto space-y-4">
              <FormField icon={User} label="Full Name" required>
                <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Your full name" className={inputCls} required disabled={regState === 'submitting'} />
              </FormField>
              <FormField icon={FolderKanban} label="Project Name" required>
                <input type="text" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} placeholder="Your project name" className={inputCls} required disabled={regState === 'submitting'} />
              </FormField>
              <FormField icon={Mail} label="Email ID" required>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your.email@example.com" className={inputCls} required disabled={regState === 'submitting'} />
              </FormField>
              <FormField icon={Phone} label="Phone Number" required>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit phone number" className={inputCls} required disabled={regState === 'submitting'} />
              </FormField>
              <FormField icon={Briefcase} label="Role" required>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls} required disabled={regState === 'submitting'}>
                  <option value="" className="bg-black text-white">Select your role</option>
                  <option value="Student" className="bg-black text-white">Student</option>
                  <option value="Working Professional" className="bg-black text-white">Working Professional</option>
                  <option value="Entrepreneur / Founder" className="bg-black text-white">Entrepreneur / Founder</option>
                  <option value="Job Seeker" className="bg-black text-white">Job Seeker</option>
                  <option value="Intern" className="bg-black text-white">Intern</option>
                  <option value="Educator / Faculty" className="bg-black text-white">Educator / Faculty</option>
                  <option value="Other" className="bg-black text-white">Other</option>
                </select>
              </FormField>
              <FormField icon={Building2} label="Name of College / School / Company" required>
                <input type="text" value={form.college_company} onChange={(e) => setForm({ ...form, college_company: e.target.value })} placeholder="Your college, school, or company name" className={inputCls} required disabled={regState === 'submitting'} />
              </FormField>
              <FormField icon={GraduationCap} label="Department (Optional)">
                <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Your department" className={inputCls} disabled={regState === 'submitting'} />
              </FormField>
              <FormField icon={Megaphone} label="How did you get to know about IGNITION 2K26?" required>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputCls} required disabled={regState === 'submitting'}>
                  <option value="" className="bg-black text-white">Select source</option>
                  <option value="Instagram" className="bg-black text-white">Instagram</option>
                  <option value="YouTube" className="bg-black text-white">YouTube</option>
                  <option value="Google" className="bg-black text-white">Google</option>
                  <option value="College" className="bg-black text-white">College</option>
                  <option value="Company" className="bg-black text-white">Company</option>
                  <option value="Other" className="bg-black text-white">Other</option>
                </select>
              </FormField>
              <button type="submit" disabled={regState === 'submitting'} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {regState === 'submitting' ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> {SUBMIT_STEPS[submitStep]}</>
                ) : (
                  <>Register for IGNITION 2K26 <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {regState === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="max-w-xl mx-auto text-center relative">
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }} className="text-6xl mb-4">🎉</motion.div>
            <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-bold text-white mb-2">Registration Successful!</motion.h3>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg text-primary-300 mb-6">Welcome to IGNITION 2K26</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 rounded-2xl bg-gradient-to-r from-primary-600/20 to-primary-500/10 border border-primary-400/30 backdrop-blur-md mb-6">
              <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Registration ID</p>
              <p className="text-3xl font-bold font-mono text-primary-300">{registrationId}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-2 text-gray-400 text-sm mb-8">
              <p>Your registration has been successfully completed.</p>
              <p>A confirmation email has been sent to your registered email address.</p>
              <p className="text-amber-400">Keep your Registration ID safe.</p>
            </motion.div>
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} onClick={reset} className="px-6 py-3 rounded-xl font-medium text-gray-300 bg-white/5 border border-gray-700 hover:bg-white/10 transition-all">Register Another UID</motion.button>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div key={i} className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full" style={{ background: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'][i % 4] }} initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 400 - 100, opacity: 0, scale: 0 }} transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls = 'w-full pl-11 pr-4 py-3 bg-white/5 backdrop-blur-md border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all disabled:opacity-50';

function FormField({ icon: Icon, label, required, children }: { icon: React.ElementType; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label} {required && <span className="text-rose-400">*</span>}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        {children}
      </div>
    </div>
  );
}
