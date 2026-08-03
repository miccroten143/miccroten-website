import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Download, Truck, Package, MapPin, CreditCard, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StoreLayout } from '../components/StoreLayout';
import { EmptyState } from '../components/EmptyState';
import { fetchOrderById, fetchOrders, fetchShipmentByOrder, fetchPaymentsByOrder } from '../services';
import { useAuth } from '../AuthContext';
import { formatINR, formatDateTime, formatDate } from '../utils';
import type { Order, Shipment, Payment } from '../types';

export default function OrdersPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchOrders()
      .then((data) => {
        setOrders(data);
        if (id) {
          const found = data.find((o) => o.id === id);
          setSelected(found ?? null);
        }
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, id]);

  if (!user) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 max-w-md">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Package className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view orders</h2>
            <Link to="/login" className="btn btn-primary mt-4">Sign In</Link>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (id && selected) {
    return <OrderDetail order={selected} />;
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">My Orders</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Package className="text-primary-600" /> My Orders
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse h-32" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="When you place an order, it will appear here."
            actionLabel="Start Shopping"
            actionTo="/shop"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{order.order_number}</span>
                      <StatusBadge status={order.payment_status} />
                      {order.shipment_status && order.shipment_status !== 'pending' && (
                        <ShipmentBadge status={order.shipment_status} />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{formatDateTime(order.created_at)}</p>
                    <p className="text-sm text-gray-600 mt-1">{order.order_items?.length ?? 0} item(s)</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-bold text-primary-600">{formatINR(order.total)}</p>
                    </div>
                    <Link to={`/orders/${order.id}`} className="btn btn-secondary !py-2 !px-4 !text-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}

function OrderDetail({ order }: { order: Order }) {
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    fetchShipmentByOrder(order.id).then(setShipment).catch(() => { });
    fetchPaymentsByOrder(order.id).then(setPayments).catch(() => { });
  }, [order.id]);

  const downloadInvoice = () => {
    const items = order.order_items ?? [];
    const rows = items.map((item) => `${item.name}\t${item.quantity}\t₹${item.price}\t₹${item.price * item.quantity}`).join('\n');
    const invoice = `
MICCROTEN TECHNOLOGIES
======================
Invoice: ${order.order_number}
Date: ${formatDateTime(order.created_at)}

${rows}

Subtotal: ₹${order.subtotal}
Discount: -₹${order.discount}
GST (18%): ₹${order.gst}
Shipping: ${order.shipping === 0 ? 'FREE' : '₹' + order.shipping}
----------------------
Total: ₹${order.total}
Payment Status: ${order.payment_status.toUpperCase()}
Payment ID: ${order.razorpay_payment_id ?? 'N/A'}
    `.trim();

    const blob = new Blob([invoice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.order_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded');
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 md:p-8 mb-8 text-white shadow-lg"
          >
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-12 w-12 flex-shrink-0" />
              <div>
                <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
                <p className="text-emerald-50">Thank you for your purchase. A confirmation has been sent to your email.</p>
              </div>
            </div>
          </motion.div>
        )}

        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link to="/orders" className="hover:text-primary-600">My Orders</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{order.order_number}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatINR(item.price)}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatINR(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {order.address && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={20} /> Delivery Address</h2>
                <p className="text-gray-600 text-sm">
                  {(order.address as Record<string, string>).full_name}<br />
                  {(order.address as Record<string, string>).line1}
                  {(order.address as Record<string, string>).line2 ? `, ${(order.address as Record<string, string>).line2}` : ''}<br />
                  {(order.address as Record<string, string>).city}, {(order.address as Record<string, string>).state} - {(order.address as Record<string, string>).pincode}<br />
                  {(order.address as Record<string, string>).phone}
                </p>
              </div>
            )}

            {/* Tracking */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Truck size={20} /> Track Shipment</h2>
              <div className="flex items-center justify-between">
                {['confirmed', 'processing', 'shipped', 'delivered'].map((step, i) => {
                  const orderSteps = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
                  const currentIdx = orderSteps.indexOf(order.status);
                  const done = i <= currentIdx;
                  return (
                    <div key={step} className="flex-1 flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {done ? <CheckCircle2 size={16} /> : i + 1}
                      </div>
                      {i < 3 && <div className={`flex-1 h-0.5 ${done ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {shipment && (
                  <>
                    <div className="flex justify-between"><span className="text-gray-600">Courier</span><span className="font-medium">{shipment.courier || 'Pending'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Tracking Number</span><span className="font-mono text-xs">{shipment.tracking_number || 'Will be assigned shortly'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Shipment Status</span><span className="font-medium capitalize">{shipment.shipment_status.replace(/_/g, ' ')}</span></div>
                  </>
                )}
                <div className="flex justify-between"><span className="text-gray-600">Estimated Delivery</span><span className="font-medium">{order.estimated_delivery ? formatDate(order.estimated_delivery) : formatDate(new Date(Date.now() + 5 * 86400000).toISOString())}</span></div>
              </div>
            </div>

            {/* Payment History for this order */}
            {payments.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={20} /> Payment History</h2>
                <div className="space-y-3">
                  {payments.map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                      <div>
                        <p className="font-mono text-xs text-gray-600">{p.razorpay_payment_id || '—'}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(p.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatINR(p.amount)}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={20} /> Payment Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>- {formatINR(order.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-gray-600">GST</span><span>{formatINR(order.gst)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-3 mt-3 font-bold"><span>Total</span><span className="text-primary-600">{formatINR(order.total)}</span></div>
              </div>
              {order.razorpay_payment_id && <p className="text-xs text-gray-400 mt-3">Payment ID: {order.razorpay_payment_id}</p>}
            </div>

            <button onClick={downloadInvoice} className="btn btn-secondary w-full">
              <Download size={18} className="mr-2" /> Download Invoice
            </button>
            <Link to="/shop" className="btn btn-primary w-full">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-rose-100 text-rose-700',
    refunded: 'bg-gray-100 text-gray-700',
    cod: 'bg-blue-100 text-blue-700',
  };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[status] ?? colors.pending}`}>{status.toUpperCase()}</span>;
}

function ShipmentBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    delivered: 'bg-emerald-100 text-emerald-700',
    in_transit: 'bg-blue-100 text-blue-700',
    out_for_delivery: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-rose-100 text-rose-700',
  };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[status] ?? colors.pending}`}>{status.replace(/_/g, ' ').toUpperCase()}</span>;
}
