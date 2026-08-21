import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X, ArrowRight, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { StoreLayout } from '../components/StoreLayout';
import { EmptyState } from '../components/EmptyState';
import { useCartStore } from '../store';
import { validateCoupon } from '../services';
import { formatINR } from '../utils';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items, updateQuantity, removeItem, clearCart,
    getSubtotal, getDiscount, getGst, getShipping, getTotal,
    coupon, applyCoupon, removeCoupon,
  } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      const coupon = await validateCoupon(couponCode);
      if (!coupon) {
        toast.error('Invalid or expired coupon code');
        return;
      }
      const subtotal = getSubtotal();
      if (subtotal < coupon.min_order) {
        toast.error(`Minimum order of ${formatINR(coupon.min_order)} required`);
        return;
      }
      let discount = 0;
      if (coupon.type === 'fixed') {
        discount = Math.min(coupon.value, subtotal);
      } else {
        discount = Math.round((subtotal * coupon.value) / 100);
        if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
      }
      applyCoupon(coupon.code.toUpperCase(), discount, coupon.type, coupon.value);
      toast.success(`Coupon applied! You saved ${formatINR(discount)}`);
      setCouponCode('');
    } catch {
      toast.error('Failed to apply coupon');
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <StoreLayout>
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our products!"
          actionLabel="Start Shopping"
          actionTo="/shop"
        />
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Cart</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="text-primary-600" /> Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white rounded-xl shadow-md p-4 flex gap-4"
                >
                  <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-24 h-24 rounded-lg object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">{item.product.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-1">{item.product.short_description}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{formatINR(item.product.price)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 text-gray-600 hover:bg-gray-50">
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 text-gray-600 hover:bg-gray-50">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => { removeItem(item.product.id); toast.success('Removed from cart'); }} className="text-rose-500 hover:text-rose-600 p-1.5">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="font-bold text-gray-900">{formatINR(item.product.price * item.quantity)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex justify-between">
              <Link to="/shop" className="text-primary-600 font-medium flex items-center gap-1 hover:underline">
                <ArrowRight size={16} className="rotate-180" /> Continue Shopping
              </Link>
              <button onClick={() => { clearCart(); toast.success('Cart cleared'); }} className="text-sm text-gray-500 hover:text-rose-500">
                Clear cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

              <form onSubmit={handleApplyCoupon} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Coupon Code</label>
                {coupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                      <Tag size={16} /> {coupon.code}
                    </span>
                    <button type="button" onClick={() => { removeCoupon(); toast.success('Coupon removed'); }} className="text-emerald-600 hover:text-emerald-800">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 uppercase"
                    />
                    <button type="submit" disabled={applying} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                      Apply
                    </button>
                  </div>
                )}
              </form>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <Row label="Subtotal" value={formatINR(getSubtotal())} />
                {getDiscount() > 0 && <Row label="Discount" value={`- ${formatINR(getDiscount())}`} color="text-emerald-600" />}
                <Row label="GST (18%)" value={formatINR(getGst())} />
                <Row label="Shipping" value={getShipping() === 0 ? 'FREE' : formatINR(getShipping())} color={getShipping() === 0 ? 'text-emerald-600' : ''} />
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">{formatINR(getTotal())}</span>
              </div>

              <button onClick={() => navigate('/checkout')} className="btn btn-primary w-full mt-6">
                Proceed to Checkout <ArrowRight size={18} className="ml-2" />
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">Secure payment via Razorpay</p>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

function Row({ label, value, color = '' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}
