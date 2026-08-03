import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, MapPin, CreditCard, ShoppingBag, Plus, Truck, Lock, ChevronRight, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StoreLayout } from '../components/StoreLayout';
import { EmptyState } from '../components/EmptyState';
import { useCartStore } from '../store';
import { useAuth } from '../AuthContext';
import {
  fetchAddresses, saveAddress, createOrder, generateOrderNumber,
  createRazorpayOrder, verifyRazorpayPayment, calculateShippingEstimate,
} from '../services';
import { formatINR, deliveryEstimate } from '../utils';
import type { Address, ShippingEstimate } from '../types';

type Step = 'address' | 'summary' | 'payment' | 'processing';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  razorpay_method?: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items, getSubtotal, getDiscount, getGst, getShipping, getTotal,
    coupon, clearCart,
  } = useCartStore();
  const [step, setStep] = useState<Step>('address');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [shippingEstimate, setShippingEstimate] = useState<ShippingEstimate | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchAddresses().then((addrs) => {
      setAddresses(addrs);
      const def = addrs.find((a) => a.is_default) ?? addrs[0];
      if (def) setSelectedAddress(def);
    }).catch(() => { });
  }, [user]);

  useEffect(() => {
    if (selectedAddress?.pincode) {
      setShippingEstimate(calculateShippingEstimate(selectedAddress.pincode, getSubtotal()));
    }
  }, [selectedAddress, getSubtotal]);

  if (items.length === 0) {
    return (
      <StoreLayout>
        <EmptyState
          title="Your cart is empty"
          description="Add products to your cart before checking out."
          actionLabel="Start Shopping"
          actionTo="/shop"
        />
      </StoreLayout>
    );
  }

  if (!user) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 max-w-md">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Lock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to checkout</h2>
            <p className="text-gray-500 mb-6">Please sign in to continue with your purchase.</p>
            <div className="flex flex-col gap-3">
              <Link to="/login" className="btn btn-primary">Sign In</Link>
              <Link to="/signup" className="btn btn-secondary">Create Account</Link>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  const handlePay = async () => {
    if (!selectedAddress || !user) return;
    setProcessing(true);
    setStep('processing');

    const total = getTotal();

    try {
      // 1. Create a pending order in the database first
      const orderNumber = generateOrderNumber();
      const estDelivery = new Date();
      estDelivery.setDate(estDelivery.getDate() + (shippingEstimate?.estimatedDays ?? 7));

      const order = await createOrder(
        {
          order_number: orderNumber,
          user_id: user.id,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'razorpay',
          subtotal: getSubtotal(),
          discount: getDiscount(),
          gst: getGst(),
          shipping: getShipping(),
          total,
          coupon_code: coupon?.code ?? null,
          address: selectedAddress as unknown as Record<string, unknown>,
          currency: 'INR',
          estimated_delivery: estDelivery.toISOString().slice(0, 10),
          courier: shippingEstimate?.courier ?? null,
        },
        items.map((i) => ({
          product_id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.images[0] ?? null,
        }))
      );

      // 2. Create a Razorpay order via the edge function
      const { orderId: razorpayOrderId } = await createRazorpayOrder(total);

      // 3. Open Razorpay Checkout
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay key is not configured. Please contact support.');
      }

      const paymentResult = await new Promise<RazorpayResponse>((resolve, reject) => {
        const options: Record<string, unknown> = {
          key: razorpayKey,
          amount: Math.round(total * 100),
          currency: 'INR',
          name: 'MICCROTEN Technologies',
          description: `Order ${orderNumber}`,
          order_id: razorpayOrderId,
          prefill: {
            name: selectedAddress.full_name,
            email: user.email ?? '',
            contact: selectedAddress.phone,
          },
          notes: {
            order_uuid: order.id,
            order_number: orderNumber,
          },
          theme: { color: '#2563EB' },
          handler: (response: RazorpayResponse) => resolve(response),
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled by user')),
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });

      // 4. Verify the payment signature on the server
      await verifyRazorpayPayment({
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
        order_uuid: order.id,
        user_id: user.id,
        amount: total,
        method: paymentResult.razorpay_method,
      });

      // 5. Clear cart and redirect to success page
      clearCart();
      navigate(`/orders/${order.id}?success=true&payment_id=${paymentResult.razorpay_payment_id}`);
    } catch (err: any) {
      setStep('payment');
      setProcessing(false);
      if (err?.message?.includes('cancelled')) {
        toast.error('Payment was cancelled. Please try again.');
      } else {
        toast.error(err?.message || 'Payment failed. Please try again.');
      }
    }
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link to="/cart" className="hover:text-primary-600">Cart</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Checkout</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <StepBadge num={1} label="Address" active={step === 'address'} done={step !== 'address'} />
          <div className="w-8 h-px bg-gray-300" />
          <StepBadge num={2} label="Summary" active={step === 'summary'} done={step === 'payment' || step === 'processing'} />
          <div className="w-8 h-px bg-gray-300" />
          <StepBadge num={3} label="Payment" active={step === 'payment' || step === 'processing'} done={false} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 'address' && (
                <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={20} /> Delivery Address</h2>
                    {addresses.length === 0 && !showAddForm && (
                      <p className="text-gray-500 mb-4">No saved addresses. Add one to continue.</p>
                    )}
                    <div className="space-y-3 mb-4">
                      {addresses.map((addr) => (
                        <label key={addr.id} className={`block border rounded-lg p-4 cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                          <div className="flex items-start gap-3">
                            <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="mt-1" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{addr.full_name} <span className="text-gray-500 font-normal">{addr.phone}</span></p>
                              <p className="text-sm text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}</p>
                              {addr.is_default && <span className="text-xs text-primary-600 font-medium">Default</span>}
                              <span className="ml-2 text-xs text-gray-500 capitalize">{addr.address_type}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {showAddForm ? (
                      <AddressForm
                        onSave={async (data) => {
                          try {
                            const saved = await saveAddress(data);
                            setAddresses([saved, ...addresses]);
                            setSelectedAddress(saved);
                            setShowAddForm(false);
                            toast.success('Address added');
                          } catch { toast.error('Failed to save address'); }
                        }}
                        onCancel={() => setShowAddForm(false)}
                      />
                    ) : (
                      <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 text-primary-600 font-medium text-sm hover:underline">
                        <Plus size={16} /> Add new address
                      </button>
                    )}
                    {shippingEstimate && selectedAddress && (
                      <div className="mt-4 p-4 bg-primary-50/50 rounded-lg flex items-center gap-3">
                        <Truck className="h-5 w-5 text-primary-600 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">Estimated delivery: {shippingEstimate.estimatedDelivery}</p>
                          <p className="text-gray-500">via {shippingEstimate.courier} ({shippingEstimate.estimatedDays} days)</p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => setStep('summary')}
                      disabled={!selectedAddress}
                      className="btn btn-primary w-full mt-6 disabled:opacity-40"
                    >
                      Continue to Summary
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'summary' && (
                <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="bg-white rounded-xl shadow-md p-6 mb-4">
                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ShoppingBag size={20} /> Order Summary</h2>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex gap-3">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.product.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatINR(item.product.price)}</p>
                          </div>
                          <p className="font-semibold text-gray-900">{formatINR(item.product.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedAddress && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Delivering to</h3>
                        <button onClick={() => setStep('address')} className="text-sm text-primary-600 hover:underline">Change</button>
                      </div>
                      <p className="text-sm text-gray-600">{selectedAddress.full_name}, {selectedAddress.line1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-2"><Truck size={16} /> Estimated delivery: {shippingEstimate?.estimatedDelivery ?? deliveryEstimate()}</p>
                    </div>
                  )}
                  <button onClick={() => setStep('payment')} className="btn btn-primary w-full">Continue to Payment</button>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={20} /> Payment Method</h2>
                    <p className="text-sm text-gray-500 mb-4">Secure payment via Razorpay — UPI, Cards, Net Banking & Wallets</p>
                    <div className="p-4 bg-primary-50/50 rounded-lg mb-6 flex items-center gap-3">
                      <Lock className="h-5 w-5 text-primary-600 flex-shrink-0" />
                      <p className="text-sm text-gray-600">Your payment is secured with 256-bit encryption. We never store your card details.</p>
                    </div>
                    <button onClick={handlePay} className="btn btn-primary w-full">
                      <Lock size={16} className="mr-2" />
                      Pay {formatINR(getTotal())} via Razorpay
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-3">You'll be redirected to Razorpay's secure checkout</p>
                  </div>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-md p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-6"
                  />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h2>
                  <p className="text-gray-500">Please do not close this window.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h2 className="font-bold text-gray-900 mb-4">Price Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal ({items.length} items)</span><span>{formatINR(getSubtotal())}</span></div>
                {getDiscount() > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>- {formatINR(getDiscount())}</span></div>}
                <div className="flex justify-between"><span className="text-gray-600">GST (18%)</span><span>{formatINR(getGst())}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className={getShipping() === 0 ? 'text-emerald-600' : ''}>{getShipping() === 0 ? 'FREE' : formatINR(getShipping())}</span></div>
              </div>

              <div className="flex justify-between border-t border-gray-100 pt-4 mt-4">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-primary-600">{formatINR(getTotal())}</span>
              </div>
              {coupon && <p className="text-xs text-emerald-600 mt-3">Coupon {coupon.code} applied</p>}
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

function StepBadge({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${done ? 'bg-emerald-500 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
        {done ? <Check size={16} /> : num}
      </div>
      <span className={`text-sm font-medium ${active || done ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
}

function AddressForm({ onSave, onCancel }: { onSave: (data: Omit<Address, 'id' | 'user_id' | 'created_at'>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    full_name: '', phone: '', alternate_number: '', line1: '', line2: '',
    landmark: '', city: '', district: '', state: '', pincode: '',
    is_default: false, address_type: 'home' as 'home' | 'work' | 'other',
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      country: 'India',
      type: 'both' as const,
    });
  };
  return (
    <form onSubmit={submit} className="border border-gray-200 rounded-lg p-4 space-y-3">
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
        <button type="submit" className="btn btn-primary !py-2 !text-sm flex-1">Save Address</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"><X size={16} /></button>
      </div>
    </form>
  );
}
