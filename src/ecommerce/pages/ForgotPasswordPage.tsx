import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset link sent');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/60">
          <Link to="/" className="flex items-center justify-center gap-2 mb-6">
            <img src="/assets/logo.png" alt="MICCROTEN" height="88px" width="88px" />
            <span className="text-xl font-bold text-primary-700">MICCROTEN</span>
          </Link>

          {sent ? (
            <div className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
              <p className="text-gray-500 mb-6">We've sent a password reset link to <strong>{email}</strong></p>
              <Link to="/login" className="btn btn-primary">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Forgot password?</h1>
              <p className="text-gray-500 text-center text-sm mb-6">Enter your email to receive a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400" />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Reset Link'} {!loading && <ArrowRight size={18} className="ml-2" />}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6">
                Remember your password? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
