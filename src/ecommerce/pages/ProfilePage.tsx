import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Package, Heart, LogOut, Plus, Trash2, Check, X, Lock, Mail, Phone,
  Pencil, CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StoreLayout } from '../components/StoreLayout';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../AuthContext';
import {
  fetchAddresses, saveAddress, updateAddress, deleteAddress, setDefaultAddress,
  fetchOrders, fetchPayments, fetchProfile, updateProfile,
} from '../services';
import { useWishlistStore } from '../store';
import { formatINR, formatDate } from '../utils';
import { supabase } from '../../Admin/lib/supabase';
import type { Address, Order, Payment, Profile } from '../types';

type Tab = 'overview' | 'addresses' | 'orders' | 'payments' | 'security';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  useEffect(() => {
    if (!user) return;
    fetchAddresses().then(setAddresses).catch(() => { });
    fetchOrders().then(setOrders).catch(() => setOrders([]));
    fetchPayments().then(setPayments).catch(() => setPayments([]));
    fetchProfile().then(setProfile).catch(() => { });
  }, [user]);

  if (!user) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 max-w-md">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <User className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view your profile</h2>
            <Link to="/login" className="btn btn-primary mt-4">Sign In</Link>
          </div>
        </div>
      </StoreLayout>
    );
  }

  const handleDeleteAddress = async (id: number) => {
    try {
      await deleteAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      setAddresses(addresses.map((a) => ({ ...a, is_default: a.id === id })));
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to set default address');
    }
  };

  const handleSaveAddress = async (data: Omit<Address, 'id' | 'user_id' | 'created_at'>, id?: number) => {
    try {
      if (id) {
        const updated = await updateAddress(id, data);
        setAddresses(addresses.map((a) => (a.id === id ? updated : a)));
        toast.success('Address updated');
      } else {
        const saved = await saveAddress(data);
        setAddresses([saved, ...addresses]);
        toast.success('Address added');
      }
      setShowForm(false);
      setEditingAddress(null);
    } catch {
      toast.error('Failed to save address');
    }
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user.email}</p>
                  <p className="text-xs text-gray-500">Member</p>
                </div>
              </div>
              <nav className="space-y-1">
                <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} icon={User}>Overview</TabButton>
                <TabButton active={tab === 'orders'} onClick={() => setTab('orders')} icon={Package}>Orders ({orders.length})</TabButton>
                <TabButton active={tab === 'payments'} onClick={() => setTab('payments')} icon={CreditCard}>Payment History</TabButton>
                <TabButton active={tab === 'addresses'} onClick={() => setTab('addresses')} icon={MapPin}>Addresses ({addresses.length})</TabButton>
                <TabButton active={tab === 'security'} onClick={() => setTab('security')} icon={Lock}>Security</TabButton>
                <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                  <Heart size={18} /> Wishlist ({wishlistCount})
                </Link>
                <button onClick={() => { signOut(); toast.success('Signed out'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 text-sm">
                  <LogOut size={18} /> Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {tab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StatCard label="Total Orders" value={orders.length} icon={Package} />
                    <StatCard label="Saved Addresses" value={addresses.length} icon={MapPin} />
                    <StatCard label="Wishlist Items" value={wishlistCount} icon={Heart} />
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Account Details</h2>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-900">{profile?.full_name || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email Address</p>
                          <p className="font-medium text-gray-900">{profile?.email || user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium text-gray-900">{profile?.phone_number || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {tab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {orders.length === 0 ? (
                    <EmptyState title="No orders yet" description="Your order history will appear here." actionLabel="Start Shopping" actionTo="/shop" />
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <Link key={order.id} to={`/orders/${order.id}`} className="block bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-900">{order.order_number}</p>
                              <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                              <span className="text-xs text-gray-500 capitalize">{order.status.replace(/_/g, ' ')}</span>
                            </div>
                            <p className="font-bold text-primary-600">{formatINR(order.total)}</p>
                          </div>
                        </Link>
                      ))}
                      {orders.length > 5 && <Link to="/orders" className="block text-center text-primary-600 font-medium py-2">View all orders</Link>}
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'payments' && (
                <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="font-bold text-gray-900 mb-4">Payment History</h2>
                  {payments.length === 0 ? (
                    <EmptyState title="No payments yet" description="Your payment history will appear here after your first order." />
                  ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-gray-600">
                            <tr>
                              <th className="text-left p-4">Amount</th>
                              <th className="text-left p-4">Payment ID</th>
                              <th className="text-left p-4">Method</th>
                              <th className="text-left p-4">Status</th>
                              <th className="text-left p-4">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.map((p) => (
                              <tr key={p.id} className="border-t border-gray-100">
                                <td className="p-4 font-medium">{formatINR(p.amount)}</td>
                                <td className="p-4 font-mono text-xs text-gray-600">{p.razorpay_payment_id || '—'}</td>
                                <td className="p-4 text-gray-600 capitalize">{p.method || '—'}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                    p.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                                    p.status === 'refunded' ? 'bg-gray-100 text-gray-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>{p.status}</span>
                                </td>
                                <td className="p-4 text-gray-600">{formatDate(p.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'addresses' && (
                <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-gray-900">Saved Addresses</h2>
                    <button onClick={() => { setEditingAddress(null); setShowForm(!showForm); }} className="flex items-center gap-2 text-primary-600 font-medium text-sm hover:underline">
                      <Plus size={16} /> Add new
                    </button>
                  </div>
                  {showForm && (
                    <AddressForm
                      address={editingAddress}
                      onSave={(data, id) => handleSaveAddress(data, id)}
                      onCancel={() => { setShowForm(false); setEditingAddress(null); }}
                    />
                  )}
                  {addresses.length === 0 && !showForm ? (
                    <EmptyState title="No saved addresses" description="Add an address for faster checkout." />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="bg-white rounded-xl shadow-md p-5 relative">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{addr.full_name}</p>
                              <span className="text-xs text-gray-500 capitalize">{addr.address_type}</span>
                            </div>
                            {addr.is_default && <span className="text-xs text-primary-600 font-medium flex items-center gap-1"><Check size={12} /> Default</span>}
                          </div>
                          <p className="text-sm text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                          <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                          {addr.landmark && <p className="text-sm text-gray-500 mt-1">Landmark: {addr.landmark}</p>}
                          <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>
                          <div className="flex gap-3 mt-3">
                            <button onClick={() => { setEditingAddress(addr); setShowForm(true); }} className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
                              <Pencil size={14} /> Edit
                            </button>
                            {!addr.is_default && (
                              <button onClick={() => handleSetDefault(addr.id)} className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1">
                                <Check size={14} /> Set Default
                              </button>
                            )}
                            <button onClick={() => handleDeleteAddress(addr.id)} className="text-rose-500 hover:text-rose-600 text-sm flex items-center gap-1">
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SecuritySection email={user.email ?? ''} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

function TabButton({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
      <Icon size={18} /> {children}
    </button>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

interface AddressFormProps {
  address: Address | null;
  onSave: (data: Omit<Address, 'id' | 'user_id' | 'created_at'>, id?: number) => void;
  onCancel: () => void;
}

function AddressForm({ address, onSave, onCancel }: AddressFormProps) {
  const [form, setForm] = useState({
    full_name: address?.full_name ?? '',
    phone: address?.phone ?? '',
    alternate_number: address?.alternate_number ?? '',
    line1: address?.line1 ?? '',
    line2: address?.line2 ?? '',
    landmark: address?.landmark ?? '',
    city: address?.city ?? '',
    district: address?.district ?? '',
    state: address?.state ?? '',
    pincode: address?.pincode ?? '',
    is_default: address?.is_default ?? false,
    address_type: address?.address_type ?? 'home' as 'home' | 'work' | 'other',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      country: 'India',
      type: 'both' as const,
    }, address?.id);
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-xl shadow-md p-5 space-y-3 mb-4">
      <div className="grid grid-cols-2 gap-3">
        <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Full name" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/40" />
        <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Mobile number" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/40" />
      </div>
      <input value={form.alternate_number} onChange={(e) => setForm({ ...form, alternate_number: e.target.value })} placeholder="Alternate number (optional)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/40" />
      <input required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="House / Flat No." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/40" />
      <input required value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} placeholder="Area / Street" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/40" />
      <input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="Landmark (optional)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/40" />
      <div className="grid grid-cols-2 gap-3">
        <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/40" />
        <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="District" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/40" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/40" />
        <input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="Pincode" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/40" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
        <select value={form.address_type} onChange={(e) => setForm({ ...form, address_type: e.target.value as 'home' | 'work' | 'other' })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/40">
          <option value="home">Home</option>
          <option value="work">Work</option>
          <option value="other">Other</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} /> Set as default
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary !py-2 !text-sm flex-1">{address ? 'Update' : 'Save'} Address</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"><X size={16} /></button>
      </div>
    </form>
  );
}

function SecuritySection({ email }: { email: string }) {
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      toast.success('Password updated');
      setNewPass('');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Lock size={20} /> Change Password</h2>
      <p className="text-sm text-gray-500 mb-4">Account: {email}</p>
      <form onSubmit={handleChangePass} className="space-y-4 max-w-md">
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="New password (min 8 chars)"
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary disabled:opacity-50">{loading ? 'Updating...' : 'Update Password'}</button>
      </form>
    </div>
  );
}
