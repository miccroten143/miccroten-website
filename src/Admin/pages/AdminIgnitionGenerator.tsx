import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Copy, Loader2, CheckCircle2, Zap, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateUniqueUid } from '../../ecommerce/ignitionServices';

const GENERATE_STEPS = [
  'GENERATING UID...',
  'CHECKING SUPABASE...',
  'CHECKING AVAILABILITY...',
  'UNIQUE UID CONFIRMED ✓',
];

export default function AdminIgnitionGenerator() {
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [generatedUid, setGeneratedUid] = useState('');

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setGeneratedUid('');
    setStep(0);

    const stepInterval = setInterval(() => {
      setStep((s) => Math.min(s + 1, GENERATE_STEPS.length - 1));
    }, 1000);

    try {
      const uid = await generateUniqueUid();
      clearInterval(stepInterval);
      setStep(GENERATE_STEPS.length - 1);
      setGeneratedUid(uid);
      toast.success('UID generated successfully!');
    } catch (err: any) {
      clearInterval(stepInterval);
      toast.error(err.message || 'Failed to generate UID');
    } finally {
      setGenerating(false);
    }
  };

  const copyUid = () => {
    navigator.clipboard.writeText(generatedUid);
    toast.success('UID copied to clipboard');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="text-primary-600" /> IGNITION 2K26 UID Generator
          </h1>
          <p className="text-sm text-gray-500">Generate unique kit UIDs for IGNITION 2K26 participants</p>
        </div>
      </div>

      {/* Generate button */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        {!generating && !generatedUid && (
          <button onClick={handleGenerate} className="btn btn-primary flex items-center gap-2">
            <Plus size={18} /> Generate UID
          </button>
        )}

        {/* Loading steps */}
        <AnimatePresence>
          {generating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {GENERATE_STEPS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
                  className="flex items-center gap-3"
                >
                  {i < step ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : i === step ? (
                    <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-200" />
                  )}
                  <span className={`text-sm font-medium ${i <= step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated UID result */}
        <AnimatePresence>
          {generatedUid && !generating && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }}>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">UID generated ✓</span>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 mb-4">
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Generated UID</p>
                <p className="text-3xl font-bold font-mono text-primary-700 tracking-wider">{generatedUid}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={copyUid} className="btn btn-secondary flex items-center gap-2">
                  <Copy size={16} /> Copy UID
                </button>
                <button onClick={handleGenerate} className="btn btn-primary flex items-center gap-2">
                  <RefreshCw size={16} /> Generate Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3">UID Format</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• UIDs are 12 characters long, starting with <code className="px-1.5 py-0.5 bg-gray-100 rounded font-mono text-primary-600">MT</code> followed by 10 random alphanumeric characters.</p>
          <p>• Each UID is checked for uniqueness against the database before being displayed.</p>
          <p>• Generated UIDs are saved with status <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">available</span>.</p>
          <p>• When a participant registers with a UID, its status changes to <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">registered</span>.</p>
        </div>
      </div>
    </div>
  );
}
