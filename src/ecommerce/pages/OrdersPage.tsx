import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Download, Truck, Package, MapPin, CreditCard, ChevronRight,
  ExternalLink, RefreshCw, Clock, Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StoreLayout } from '../components/StoreLayout';
import { EmptyState } from '../components/EmptyState';
import {
  fetchOrderById, fetchOrders, fetchShipmentByOrder, fetchPaymentsByOrder,
  fetchTrackingEvents, syncTrackingFromBackend,
} from '../services';
import { useAuth } from '../AuthContext';
import { formatINR, formatDateTime, formatDate } from '../utils';
import { supabase } from '../../Admin/lib/supabase';
import type { Order, Shipment, Payment, TrackingEvent } from '../types';

const TIMELINE_STEPS = [
  { key: 'order_placed', label: 'Order Placed' },
  { key: 'payment_confirmed', label: 'Payment Confirmed' },
  { key: 'created', label: 'Shipment Created' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const STEP_INDEX: Record<string, number> = {
  order_placed: 0,
  payment_confirmed: 1,
  created: 2,
  picked_up: 3,
  in_transit: 4,
  out_for_delivery: 5,
  delivered: 6,
};

const FRIENDLY_STATUS: Record<string, string> = {
  pending: 'Processing',
  created: 'Shipment Created',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rto: 'Return Initiated (RTO)',
};

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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-gray-900">{order.order_number}</span>
                      <StatusBadge status={order.payment_status} />
                      {order.shipment_status && order.shipment_status !== 'pending' && (
                        <ShipmentBadge status={order.shipment_status} />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{formatDateTime(order.created_at)}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-gray-600">{order.order_items?.length ?? 0} item(s)</span>
                      {order.courier && (
                        <span className="text-gray-500 flex items-center gap-1"><Truck size={14} /> {order.courier}</span>
                      )}
                      {order.tracking_number && (
                        <span className="text-gray-500 font-mono text-xs">AWB: {order.tracking_number}</span>
                      )}
                      {order.estimated_delivery && (
                        <span className="text-gray-500 flex items-center gap-1"><Clock size={14} /> ETA: {formatDate(order.estimated_delivery)}</span>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-700">
                        Shipping: {FRIENDLY_STATUS[order.shipment_status] ?? order.shipment_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-bold text-primary-600">{formatINR(order.total)}</p>
                    </div>
                    <Link to={`/orders/${order.id}`} className="btn btn-secondary !py-2 !px-4 !text-sm flex items-center gap-1.5">
                      <Navigation size={14} /> Track Order
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
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchShipmentByOrder(order.id).then(setShipment).catch(() => { });
    fetchPaymentsByOrder(order.id).then(setPayments).catch(() => { });
    fetchTrackingEvents(order.id).then(setTrackingEvents).catch(() => { });

    // Realtime subscription for tracking updates
    const channel = supabase
      .channel(`order-tracking-${order.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'order_tracking_events', filter: `order_id=eq.${order.id}` },
        () => {
          fetchTrackingEvents(order.id).then(setTrackingEvents).catch(() => { });
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'shipments', filter: `order_id=eq.${order.id}` },
        (payload) => {
          if (payload.new) setShipment(payload.new as Shipment);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id]);

  const handleSyncTracking = async () => {
    setSyncing(true);
    try {
      await syncTrackingFromBackend(order.id);
      await Promise.all([
        fetchShipmentByOrder(order.id).then(setShipment),
        fetchTrackingEvents(order.id).then(setTrackingEvents),
      ]);
      toast.success('Tracking updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync tracking');
    } finally {
      setSyncing(false);
    }
  };

  const downloadInvoice = () => {
    const items = order.order_items ?? [];
    const rows = items.map((item) => `${item.name}\t${item.quantity}\t\u20B9${item.price}\t\u20B9${item.price * item.quantity}`).join('\n');
    const invoice = `
MICCROTEN TECHNOLOGIES
======================
Invoice: ${order.order_number}
Date: ${formatDateTime(order.created_at)}

${rows}

Subtotal: \u20B9${order.subtotal}
Discount: -\u20B9${order.discount}
GST (18%): \u20B9${order.gst}
Shipping: ${order.shipping === 0 ? 'FREE' : '\u20B9' + order.shipping}
----------------------
Total: \u20B9${order.total}
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

  // Determine current timeline step
  const currentStepIdx = shipment
    ? STEP_INDEX[shipment.shipment_status] ?? 1
    : STEP_INDEX[order.status] ?? 0;

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

            {/* Tracking Timeline */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><Truck size={20} /> Track Shipment</h2>
                <button
                  onClick={handleSyncTracking}
                  disabled={syncing}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>

              {/* Shipping info summary */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Shipping Status</p>
                  <p className="font-medium text-gray-900">{shipment ? (FRIENDLY_STATUS[shipment.shipment_status] ?? shipment.shipment_status.replace(/_/g, ' ')) : 'Processing'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Courier</p>
                  <p className="font-medium text-gray-900">{shipment?.courier_name || shipment?.courier || order.courier || 'Pending'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">AWB Number</p>
                  <p className="font-mono text-xs text-gray-700">{shipment?.awb_code || shipment?.tracking_number || order.tracking_number || 'Will be assigned shortly'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Estimated Delivery</p>
                  <p className="font-medium text-gray-900">{(shipment?.estimated_delivery || order.estimated_delivery) ? formatDate(shipment?.estimated_delivery || order.estimated_delivery || '') : 'Calculating...'}</p>
                </div>
              </div>

              {/* Timeline */}
              <TrackingTimeline
                currentStep={currentStepIdx}
                events={trackingEvents}
                shipment={shipment}
                orderCreatedAt={order.created_at}
              />

              {/* Tracking on Shiprocket link */}
              {shipment?.tracking_url && (
                <a
                  href={shipment.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-primary-600 hover:underline"
                >
                  <ExternalLink size={14} /> Track on Shiprocket
                </a>
              )}

              {/* No AWB yet message */}
              {shipment && !shipment.awb_code && shipment.shipment_status !== 'delivered' && shipment.shipment_status !== 'cancelled' && (
                <p className="mt-4 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                  Shipment created. Tracking information will be available once the courier is assigned.
                </p>
              )}
            </div>

            {/* Payment History */}
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

function TrackingTimeline({
  currentStep, events, shipment, orderCreatedAt,
}: {
  currentStep: number;
  events: TrackingEvent[];
  shipment: Shipment | null;
  orderCreatedAt: string;
}) {
  return (
    <div className="relative">
      {TIMELINE_STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        const future = i > currentStep;

        // Find matching event
        const matchingEvent = events.find((e) => {
          const eventStepIdx = STEP_INDEX[e.status];
          if (eventStepIdx === undefined) {
            // Map by shipment status
            if (e.status === step.key) return true;
          }
          return eventStepIdx === i;
        });

        const timestamp = matchingEvent?.event_timestamp
          ? formatDateTime(matchingEvent.event_timestamp)
          : (i === 0 ? formatDateTime(orderCreatedAt) : null);
        const location = matchingEvent?.location;

        return (
          <div key={step.key} className="flex gap-4 relative">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  done ? 'bg-emerald-500 text-white' :
                  active ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                  'bg-gray-200 text-gray-400'
                }`}
              >
                {done ? <CheckCircle2 size={16} /> : active ? <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" /> : i + 1}
              </motion.div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`w-0.5 h-12 ${done ? 'bg-emerald-500' : 'bg-gray-200'}`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 ${future ? 'opacity-50' : ''}`}>
              <p className={`text-sm font-medium ${
                done ? 'text-gray-900' :
                active ? 'text-primary-600' :
                'text-gray-500'
              }`}>
                {step.label}
                {active && <span className="ml-2 text-xs text-primary-500 font-normal">(Current)</span>}
              </p>
              {timestamp && <p className="text-xs text-gray-400 mt-0.5">{timestamp}</p>}
              {location && <p className="text-xs text-gray-500 mt-0.5">{location}</p>}
              {matchingEvent?.activity && active && (
                <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded px-2 py-1">{matchingEvent.activity}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
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
    picked_up: 'bg-blue-100 text-blue-700',
    created: 'bg-cyan-100 text-cyan-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-rose-100 text-rose-700',
    rto: 'bg-rose-100 text-rose-700',
  };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[status] ?? colors.pending}`}>{(FRIENDLY_STATUS[status] ?? status.replace(/_/g, ' ')).toUpperCase()}</span>;
}
