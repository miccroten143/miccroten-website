import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Search, Award, Copy, ExternalLink, RotateCcw,
  Calendar, Building2, Briefcase, FolderKanban, Users, Hash, FileText, Image as ImageIcon,
  UploadCloud, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchInternCertificates, createInternCertificate, updateInternCertificate, deleteInternCertificate,
  uploadCertificateImage,
} from '../../service/certificateService';
import { formatDate } from '../../ecommerce/utils';
import type { InternCertificate, InternCertificateInput, InternCertificateStatus } from '../../ecommerce/types';

const EMPTY_FORM: InternCertificateInput = {
  certificate_number: '',
  intern_name: '',
  photo_url: '',
  role: '',
  project: '',
  department: '',
  university: '',
  start_date: '',
  end_date: '',
  certificate_issue_date: '',
  certificate_url: '',
  certificate_image_url: '',
  status: 'active',
  remarks: '',
};

type SortKey = 'newest' | 'oldest' | 'name' | 'university' | 'status';

export default function AdminCertificates() {
  const [certs, setCerts] = useState<InternCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [editing, setEditing] = useState<InternCertificate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<InternCertificate | null>(null);

  const load = () => {
    setLoading(true);
    fetchInternCertificates()
      .then(setCerts)
      .catch(() => toast.error('Failed to load certificates'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = q
      ? certs.filter((c) =>
          [c.certificate_number, c.intern_name, c.university, c.role, c.status]
            .join(' ').toLowerCase().includes(q)
        )
      : [...certs];

    switch (sort) {
      case 'oldest': list.sort((a, b) => a.created_at.localeCompare(b.created_at)); break;
      case 'name': list.sort((a, b) => a.intern_name.localeCompare(b.intern_name)); break;
      case 'university': list.sort((a, b) => (a.university ?? '').localeCompare(b.university ?? '')); break;
      case 'status': list.sort((a, b) => a.status.localeCompare(b.status)); break;
      default: list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return list;
  }, [certs, search, sort]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certificate? This cannot be undone.')) return;
    try {
      await deleteInternCertificate(id);
      setCerts(certs.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success('Certificate deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSave = async (data: InternCertificateInput, id?: string) => {
    try {
      if (id) {
        const updated = await updateInternCertificate(id, data);
        setCerts(certs.map((c) => (c.id === id ? updated : c)));
        if (selected?.id === id) setSelected(updated);
        toast.success('Certificate updated');
      } else {
        const created = await createInternCertificate(data);
        setCerts([created, ...certs]);
        toast.success('Certificate created');
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Intern Certificates</h1>
          <p className="text-sm text-gray-500">{certs.length} total certificates</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn btn-primary !py-2 !text-sm"
        >
          <Plus size={18} className="mr-1" /> Add Certificate
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by number, name, university, role..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name (A-Z)</option>
          <option value="university">University (A-Z)</option>
          <option value="status">Status</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Award className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No certificates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c, i) => (
            <CertCard key={c.id} cert={c} index={i} onClick={() => setSelected(c)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <CertificateForm
            cert={editing}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditing(null); }}
          />
        )}
        {selected && (
          <CertificateModal
            cert={selected}
            onClose={() => setSelected(null)}
            onEdit={() => { setEditing(selected); setSelected(null); setShowForm(true); }}
            onDelete={() => handleDelete(selected.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CertCard({ cert, index, onClick }: { cert: InternCertificate; index: number; onClick: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -6 }}
      onClick={onClick}
      className="group text-left bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-primary-200 transition-all overflow-hidden flex"
    >
      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden bg-gray-100">
        {cert.photo_url ? (
          <img src={cert.photo_url} alt={cert.intern_name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
            <Users className="h-10 w-10 text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Award className="h-4 w-4 text-primary-600 flex-shrink-0" />
          <span className="font-mono text-xs text-gray-500 truncate">{cert.certificate_number}</span>
          <span className="ml-auto"><StatusBadge status={cert.status} /></span>
        </div>
        <h3 className="font-bold text-gray-900 truncate">{cert.intern_name}</h3>
        <p className="text-sm text-gray-500 truncate">{cert.role ?? '—'}</p>
        <div className="mt-2 space-y-1 text-xs text-gray-500">
          <p className="flex items-center gap-1.5 truncate"><Building2 size={12} className="flex-shrink-0" /> {cert.university ?? '—'}</p>
          <p className="flex items-center gap-1.5"><Calendar size={12} className="flex-shrink-0" /> {formatDate(cert.start_date)} — {formatDate(cert.end_date)}</p>
        </div>
      </div>
    </motion.button>
  );
}

function StatusBadge({ status }: { status: InternCertificateStatus }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    revoked: 'bg-rose-100 text-rose-700',
    expired: 'bg-amber-100 text-amber-700',
  };
  return <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${map[status] ?? map.active}`}>{status}</span>;
}

function CertificateForm({ cert, onSave, onClose }: {
  cert: InternCertificate | null;
  onSave: (data: InternCertificateInput, id?: string) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<InternCertificateInput>(() =>
    cert ? { ...EMPTY_FORM, ...stripTimestamps(cert) } : { ...EMPTY_FORM }
  );

  const set = <K extends keyof InternCertificateInput>(key: K, value: InternCertificateInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form, cert?.id);
  };

  const reset = () => setForm(cert ? { ...EMPTY_FORM, ...stripTimestamps(cert) } : { ...EMPTY_FORM });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">{cert ? 'Edit Certificate' : 'Add Certificate'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Certificate Number *"><input required value={form.certificate_number} onChange={(e) => set('certificate_number', e.target.value)} className={inputCls} placeholder="MCT-INT-2026-001" /></Field>
            <Field label="Intern Name *"><input required value={form.intern_name} onChange={(e) => set('intern_name', e.target.value)} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Role"><input value={form.role ?? ''} onChange={(e) => set('role', e.target.value)} className={inputCls} /></Field>
            <Field label="Department"><input value={form.department ?? ''} onChange={(e) => set('department', e.target.value)} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Project"><input value={form.project ?? ''} onChange={(e) => set('project', e.target.value)} className={inputCls} /></Field>
            <Field label="University / College"><input value={form.university ?? ''} onChange={(e) => set('university', e.target.value)} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Start Date"><input type="date" value={form.start_date ?? ''} onChange={(e) => set('start_date', e.target.value)} className={inputCls} /></Field>
            <Field label="End Date"><input type="date" value={form.end_date ?? ''} onChange={(e) => set('end_date', e.target.value)} className={inputCls} /></Field>
            <Field label="Certificate Issue Date"><input type="date" value={form.certificate_issue_date ?? ''} onChange={(e) => set('certificate_issue_date', e.target.value)} className={inputCls} /></Field>
          </div>
          <ImageDropzone label="Intern Photo" value={form.photo_url ?? ''} folder="intern-photos" onChange={(url) => set('photo_url', url)} />
          <ImageDropzone label="Certificate Photo" value={form.certificate_image_url ?? ''} folder="certificates" onChange={(url) => set('certificate_image_url', url)} />
          <Field label="Certificate URL (PDF / document link)"><input value={form.certificate_url ?? ''} onChange={(e) => set('certificate_url', e.target.value)} className={inputCls} placeholder="https://..." /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Status">
              <select value={form.status} onChange={(e) => set('status', e.target.value as InternCertificateStatus)} className={inputCls}>
                <option value="active">Active</option>
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
              </select>
            </Field>
            <Field label="Remarks"><input value={form.remarks ?? ''} onChange={(e) => set('remarks', e.target.value)} className={inputCls} /></Field>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" className="btn btn-primary flex-1">{cert ? 'Update' : 'Add'} Certificate</button>
            <button type="button" onClick={reset} className="px-4 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw size={16} /> Reset</button>
            <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function CertificateModal({ cert, onClose, onEdit, onDelete }: {
  cert: InternCertificate;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const copyNumber = () => {
    navigator.clipboard.writeText(cert.certificate_number);
    toast.success('Certificate number copied');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Certificate Details</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-40 flex-shrink-0">
              <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm h-40">
                {cert.photo_url ? (
                  <img src={cert.photo_url} alt={cert.intern_name} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
                    <Users className="h-10 w-10 text-gray-300" />
                  </div>
                )}
              </div>
              {cert.certificate_image_url && (
                <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm mt-3">
                  <img src={cert.certificate_image_url} alt="Certificate" loading="lazy" className="w-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{cert.intern_name}</h3>
                  <p className="text-sm text-gray-500">{cert.role ?? '—'}</p>
                </div>
                <StatusBadge status={cert.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                <ModalDetail icon={Hash} label="Certificate Number" value={cert.certificate_number} mono />
                <ModalDetail icon={Briefcase} label="Role" value={cert.role} />
                <ModalDetail icon={Building2} label="Department" value={cert.department} />
                <ModalDetail icon={Users} label="University" value={cert.university} />
                <ModalDetail icon={FolderKanban} label="Project" value={cert.project} />
                <ModalDetail icon={Calendar} label="Start Date" value={formatDate(cert.start_date)} />
                <ModalDetail icon={Calendar} label="End Date" value={formatDate(cert.end_date)} />
                <ModalDetail icon={Calendar} label="Issue Date" value={formatDate(cert.certificate_issue_date)} />
              </div>

              {cert.remarks && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Remarks</p>
                  <p className="text-sm text-gray-600">{cert.remarks}</p>
                </div>
              )}

              {cert.certificate_url && (
                <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-primary-600 hover:underline">
                  <FileText size={16} /> Open Certificate <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-6 border-t bg-gray-50">
          <button onClick={onEdit} className="btn btn-primary !py-2 !text-sm flex items-center gap-1.5"><Pencil size={16} /> Edit</button>
          <button onClick={onDelete} className="px-4 py-2 rounded-lg text-sm text-rose-600 border border-rose-200 hover:bg-rose-50 flex items-center gap-1.5"><Trash2 size={16} /> Delete</button>
          <button onClick={copyNumber} className="px-4 py-2 rounded-lg text-sm text-gray-700 border border-gray-200 hover:bg-gray-100 flex items-center gap-1.5"><Copy size={16} /> Copy Number</button>
          {cert.certificate_url && (
            <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg text-sm text-primary-600 border border-primary-200 hover:bg-primary-50 flex items-center gap-1.5"><ExternalLink size={16} /> Open</a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ModalDetail({ icon: Icon, label, value, mono }: { icon: React.ElementType; label: string; value: string | null; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-primary-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-medium text-gray-900 ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40';

function ImageDropzone({ label, value, folder, onChange }: {
  label: string;
  value: string;
  folder: 'intern-photos' | 'certificates';
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadCertificateImage(file, folder);
      onChange(url);
      toast.success(`${label} uploaded`);
    } catch (err: any) {
      toast.error('Upload failed. Make sure you are signed in.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (value) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 w-full h-40 bg-gray-50">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-medium text-gray-800 hover:bg-white flex items-center gap-1.5">
              <UploadCloud size={14} /> Replace
            </button>
            <button type="button" onClick={() => onChange('')} className="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-medium text-rose-600 hover:bg-white flex items-center gap-1.5">
              <X size={14} /> Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'}`}
      >
        {uploading ? (
          <><Loader2 className="h-7 w-7 text-primary-600 animate-spin" /><span className="text-sm text-gray-500">Uploading...</span></>
        ) : (
          <><UploadCloud className="h-7 w-7 text-gray-400" /><span className="text-sm text-gray-500">Click or drag to upload</span><span className="text-xs text-gray-400">PNG / JPG, max 5MB</span></>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
}

function stripTimestamps(c: InternCertificate): InternCertificateInput {
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = c;
  return rest;
}
