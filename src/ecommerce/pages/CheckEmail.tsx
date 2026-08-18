import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../Admin/lib/supabase';

export default function CheckEmail() {
  const { state } = useLocation();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!state?.email) {
      toast.error('Please sign up again to resend the verification email');
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: state.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      toast.success('Verification email resent successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/60 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</h1>

        <p className="text-gray-600 mb-2">We've sent a verification email to</p>

        <p className="font-semibold text-primary-600 mb-4">
          {state?.email}
        </p>

        <p className="text-gray-500 text-sm mb-6">
          Please open your inbox and click the verification link before logging in. Check your spam folder if you don't see it.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleResend}
            disabled={resending}
            className="btn btn-secondary w-full disabled:opacity-50"
          >
            {resending ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" /> Resending...
              </>
            ) : (
              <>
                <RefreshCw size={18} className="mr-2" /> Resend Verification Email
              </>
            )}
          </button>

          <Link to="/login" className="btn btn-primary w-full">
            Go to Login <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
