import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Lock, Mail} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      if (data.user) {
        setAuth(true, { username: data.user?.email ?? '' });
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#d5d5f7] to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center mb-8"
          >
            {/* <Zap className="w-12 h-12 text-brand-primary" /> */}
            <img src="/Admin/assets/light-mode-logo.png" alt=""  height={"95px"} width={"95px"} className='mt-2 ml-5'/>
            <h1 className="text-3xl font-bold text-gray-900 mr-6">MICCROTEN</h1>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg",
                    "text-gray-900 placeholder-gray-500 outline-none transition-all",
                    "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  )}
                  placeholder="Email address"
                  required
                />
                <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg",
                    "text-gray-900 placeholder-gray-500 outline-none transition-all",
                    "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  )}
                  placeholder="Password"
                  required
                  minLength={8}
                />
                <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center"
            >
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.rememberMe}
                    onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                  />
                  <div className={cn(
                    "w-10 h-6 bg-gray-200 rounded-full transition-all",
                    form.rememberMe && "bg-blue-600"
                  )}>
                    <div className={cn(
                      "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all",
                      form.rememberMe && "translate-x-4"
                    )} />
                  </div>
                </div>
                <span className="ml-3 text-sm text-gray-600">Remember me</span>
              </label>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3 px-4 bg-blue-500 rounded-lg text-white font-medium",
                "transition-all hover:bg-blue-800",
                "focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-8 relative">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full"></div>
                    <Clock className="animate-spin h-8 w-8 text-white" />
                  </div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}