import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Printer, Eye, RefreshCw, Truck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAdminOrders, updateOrder, fetchShipmentByOrder, fetchTrackingEvents, syncTrackingFromBackend } from '../../ecommerce/services';
import { formatINR, formatDateTime, formatDate } from '../../ecommerce/utils';
import type { Order, OrderStatus, Shipment, TrackingEvent } from '../../ecommerce/types';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];

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

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    fetchAdminOrders().then(setOrders).catch(() => toast.error('Failed to load orders')).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusUpdate = async (id: string, status: OrderStatus) => {
    try {
      const updated = await updateOrder(id, { status });
      setOrders(orders.map((o) => (o.id === id ? updated : o)));
      if (selected?.id === id) setSelected({ ...selected, status });
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">{orders.length} total orders</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order number..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40">
          <option value="all">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-4">Order #</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Items</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Payment</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Shipping</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center p-8 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center p-8 text-gray-400">No orders found</td></tr>
              ) : filtered.map((o) => (
                <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{o.order_number}</td>
                  <td className="p-4 text-gray-600">{formatDateTime(o.created_at)}</td>
                  <td className="p-4 text-gray-600">{o.order_items?.length ?? 0}</td>
                  <td className="p-4 font-medium">{formatINR(o.total)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusUpdate(o.id, e.target.value as OrderStatus)}
                      className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                    >
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      o.shipment_status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      o.shipment_status === 'cancelled' || o.shipment_status === 'rto' ? 'bg-rose-100 text-rose-700' :
                      o.shipment_status === 'in_transit' || o.shipment_status === 'out_for_delivery' || o.shipment_status === 'picked_up' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {FRIENDLY_STATUS[o.shipment_status] ?? o.shipment_status?.replace(/_/g, ' ') ?? '—'}
                    </span>
                    {o.courier && <p className="text-xs text-gray-400 mt-1">{o.courier}</p>}
                  </td>
                  <td className="p-4">
                    <button onClick={() => setSelected(o)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="View">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchShipmentByOrder(order.id).then(setShipment).catch(() => {});
    fetchTrackingEvents(order.id).then(setTrackingEvents).catch(() => {});
  }, [order.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleSyncTracking = async () => {
    setSyncing(true);
    try {
      await syncTrackingFromBackend(order.id);
      const [ship, events] = await Promise.all([
        fetchShipmentByOrder(order.id),
        fetchTrackingEvents(order.id),
      ]);
      setShipment(ship);
      setTrackingEvents(events);
      toast.success('Tracking synced successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync tracking');
    } finally {
      setSyncing(false);
    }
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
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{order.order_number}</h2>
            <p className="text-sm text-gray-500">{formatDateTime(order.created_at)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSyncTracking} disabled={syncing} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg disabled:opacity-50" aria-label="Sync tracking">
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> Sync Tracking
            </button>
            <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Print">
              <Printer size={20} />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Items</h3>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-100">
                  {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatINR(item.price)}</p>
                  </div>
                  <p className="font-semibold">{formatINR(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {order.address && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Delivery Address</h3>
              <p className="text-sm text-gray-600">
                {(order.address as Record<string, string>).full_name}<br />
                {(order.address as Record<string, string>).line1}<br />
                {(order.address as Record<string, string>).city}, {(order.address as Record<string, string>).state} - {(order.address as Record<string, string>).pincode}<br />
                {(order.address as Record<string, string>).phone}
              </p>
            </div>
          )}

          {/* Shipping Information */}
          <div className="border-t pt-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Truck size={18} /> Shipping Information</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Shiprocket Order ID</span><span className="font-mono text-xs">{shipment?.shiprocket_order_id || order.shiprocket_order_id || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipment ID</span><span className="font-mono text-xs">{shipment?.shipment_id || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">AWB Code</span><span className="font-mono text-xs">{shipment?.awb_code || order.tracking_number || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Courier</span><span className="font-medium">{shipment?.courier_name || shipment?.courier || order.courier || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping Status</span><span className="font-medium">{shipment ? (FRIENDLY_STATUS[shipment.shipment_status] ?? shipment.shipment_status.replace(/_/g, ' ')) : 'Processing'}</span></div>
              {shipment?.tracking_message && (
                <div className="flex justify-between"><span className="text-gray-600">Latest Update</span><span className="font-medium text-right">{shipment.tracking_message}</span></div>
              )}
              <div className="flex justify-between"><span className="text-gray-600">Estimated Delivery</span><span className="font-medium">{(shipment?.estimated_delivery || order.estimated_delivery) ? formatDate(shipment?.estimated_delivery || order.estimated_delivery || '') : '—'}</span></div>
              {shipment?.tracking_last_synced_at && (
                <div className="flex justify-between"><span className="text-gray-600 flex items-center gap-1"><Clock size={12} /> Last Sync</span><span className="text-xs text-gray-500">{formatDateTime(shipment.tracking_last_synced_at)}</span></div>
              )}
            </div>
          </div>

          {/* Tracking Events */}
          {trackingEvents.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Tracking Timeline</h3>
              <div className="space-y-2">
                {trackingEvents.slice().reverse().map((ev) => (
                  <div key={ev.id} className="flex items-start gap-3 text-sm border-b border-gray-50 pb-2">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{ev.activity || ev.status}</p>
                      {ev.location && <p className="text-xs text-gray-500">{ev.location}</p>}
                      <p className="text-xs text-gray-400">{ev.event_timestamp ? formatDateTime(ev.event_timestamp) : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Payment</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Method</span><span>{order.payment_method ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Payment ID</span><span className="font-mono text-xs">{order.payment_id ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Status</span><span className="font-medium">{order.payment_status}</span></div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-gray-900 mb-2">Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>- {formatINR(order.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-600">GST</span><span>{formatINR(order.gst)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span className="text-primary-600">{formatINR(order.total)}</span></div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
