import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Users, IndianRupee, TrendingUp, Clock,
  Download, FileSpreadsheet, Search, Filter, CheckCircle, XCircle,
  Clock as ClockIcon, RotateCcw,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatINR, formatDate, formatDateTime } from '../../ecommerce/utils';
import type { Order, Payment, Profile } from '../../ecommerce/types';

/* ----------------------------- Types ----------------------------- */
interface RevenueStats {
  today: number;
  monthly: number;
  yearly: number;
  total: number;
}

interface OrderStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  refunds: number;
}

interface PaymentRow {
  payment: Payment;
  order: Order | null;
  customerEmail: string;
  productName: string;
}

type ChartView = 'daily' | 'weekly' | 'monthly' | 'yearly';
type StatusFilter = 'all' | 'paid' | 'failed' | 'pending' | 'refunded' | 'cod';

/* --------------------------- Helpers ----------------------------- */
const startOfDay = (d: Date): Date => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const isSameYear = (a: Date, b: Date): boolean => a.getFullYear() === b.getFullYear();

const monthName = (m: number): string =>
  new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(2000, m, 1));

const truncate = (s: string, n = 8): string =>
  s.length > n ? `${s.slice(0, n)}…` : s;

const statusBadge = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-700';
    case 'failed':
      return 'bg-rose-100 text-rose-700';
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    case 'refunded':
      return 'bg-purple-100 text-purple-700';
    case 'cod':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return CheckCircle;
    case 'failed':
      return XCircle;
    case 'pending':
      return ClockIcon;
    case 'refunded':
      return RotateCcw;
    default:
      return ClockIcon;
  }
};

/* ---------------------- CSV / Excel export ----------------------- */
function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildCsv(rows: PaymentRow[]): string {
  const headers = [
    'Order ID',
    'Customer',
    'Product',
    'Amount',
    'Razorpay Payment ID',
    'Date',
    'Status',
  ];
  const escape = (v: string): string => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(',')];
  for (const r of rows) {
    const p = r.payment;
    lines.push(
      [
        escape(p.order_id ?? ''),
        escape(r.customerEmail),
        escape(r.productName),
        escape(String(p.amount ?? 0)),
        escape(p.razorpay_payment_id ?? ''),
        escape(formatDateTime(p.created_at)),
        escape(p.status),
      ]
        .join(',')
    );
  }
  return lines.join('\n');
}

function exportCsv(rows: PaymentRow[]): void {
  const csv = buildCsv(rows);
  // Prepend BOM so Excel detects UTF-8
  downloadFile(`\uFEFF${csv}`, `payments-${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

function exportExcel(rows: PaymentRow[]): void {
  // Excel can open an HTML table saved with .xls extension
  const headers = ['Order ID', 'Customer', 'Product', 'Amount', 'Razorpay Payment ID', 'Date', 'Status'];
  const escapeHtml = (s: string): string =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const head = `<tr>${headers.map((h) => `<th style="background:#f3f4f6;font-weight:bold;">${escapeHtml(h)}</th>`).join('')}</tr>`;
  const body = rows
    .map((r) => {
      const p = r.payment;
      return `<tr>
        <td>${escapeHtml(p.order_id ?? '')}</td>
        <td>${escapeHtml(r.customerEmail)}</td>
        <td>${escapeHtml(r.productName)}</td>
        <td>${escapeHtml(String(p.amount ?? 0))}</td>
        <td>${escapeHtml(p.razorpay_payment_id ?? '')}</td>
        <td>${escapeHtml(formatDateTime(p.created_at))}</td>
        <td>${escapeHtml(p.status)}</td>
      </tr>`;
    })
    .join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1">${head}${body}</table></body></html>`;
  downloadFile(html, `payments-${Date.now()}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
}

/* ----------------------------- Component ----------------------------- */
export default function AdminDashboardStats() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  // Filters
  const [chartView, setChartView] = useState<ChartView>('daily');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>(''); // YYYY-MM

  useEffect(() => {
    (async () => {
      try {
        const [ordersRes, paymentsRes, profilesRes] = await Promise.all([
          supabase.from('orders').select('*, order_items(*)'),
          supabase.from('payments').select('*'),
          supabase.from('profiles').select('*'),
        ]);

        const orderList = (ordersRes.data ?? []) as Order[];
        const paymentList = (paymentsRes.data ?? []) as Payment[];
        const profileList = (profilesRes.data ?? []) as Profile[];

        const profileMap: Record<string, Profile> = {};
        for (const p of profileList) {
          profileMap[p.id] = p;
        }

        setOrders(orderList);
        setPayments(paymentList);
        setProfiles(profileMap);
      } catch {
        // graceful fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* -------- Derived: revenue + order stats -------- */
  const revenue: RevenueStats = useMemo(() => {
    const now = new Date();
    let today = 0;
    let monthly = 0;
    let yearly = 0;
    let total = 0;
    for (const o of orders) {
      const amt = Number(o.total) || 0;
      const d = new Date(o.created_at);
      total += amt;
      if (isSameDay(d, now)) today += amt;
      if (isSameMonth(d, now)) monthly += amt;
      if (isSameYear(d, now)) yearly += amt;
    }
    return { today, monthly, yearly, total };
  }, [orders]);

  const orderStats: OrderStats = useMemo(() => {
    let successful = 0;
    let failed = 0;
    let pending = 0;
    let refunds = 0;
    for (const p of payments) {
      switch (p.status) {
        case 'paid':
          successful += 1;
          break;
        case 'failed':
          failed += 1;
          break;
        case 'pending':
          pending += 1;
          break;
        case 'refunded':
          refunds += 1;
          break;
        default:
          break;
      }
    }
    return { total: orders.length, successful, failed, pending, refunds };
  }, [orders, payments]);

  /* -------- Derived: chart data -------- */
  const chartData = useMemo<{ label: string; value: number }[]>(() => {
    const now = new Date();
    const orderById = new Map<string, Order>();
    for (const o of orders) orderById.set(o.id, o);

    // Revenue keyed to a payment's order total (or payment amount fallback)
    const revenueOf = (p: Payment): number => {
      const o = p.order_id ? orderById.get(p.order_id) : null;
      return o ? Number(o.total) || 0 : Number(p.amount) || 0;
    };

    if (chartView === 'daily') {
      const days: { label: string; value: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().slice(0, 10);
        const dayRev = payments
          .filter((p) => p.status === 'paid' && p.created_at.slice(0, 10) === dayStr)
          .reduce((s, p) => s + revenueOf(p), 0);
        days.push({
          label: d.toLocaleDateString('en', { weekday: 'short' }),
          value: dayRev,
        });
      }
      return days;
    }

    if (chartView === 'weekly') {
      const weeks: { label: string; value: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const end = new Date();
        end.setDate(end.getDate() - i * 7);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        const startStr = start.toISOString().slice(0, 10);
        const endStr = end.toISOString().slice(0, 10);
        const weekRev = payments
          .filter(
            (p) =>
              p.status === 'paid' &&
              p.created_at.slice(0, 10) >= startStr &&
              p.created_at.slice(0, 10) <= endStr
          )
          .reduce((s, p) => s + revenueOf(p), 0);
        weeks.push({
          label: `${start.getDate()}/${start.getMonth() + 1}`,
          value: weekRev,
        });
      }
      return weeks;
    }

    if (chartView === 'monthly') {
      const months: { label: string; value: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const monthRev = payments
          .filter((p) => {
            if (p.status !== 'paid') return false;
            const pd = new Date(p.created_at);
            return pd.getFullYear() === y && pd.getMonth() === m;
          })
          .reduce((s, p) => s + revenueOf(p), 0);
        months.push({ label: monthName(m), value: monthRev });
      }
      return months;
    }

    // yearly
    const years: { label: string; value: number }[] = [];
    const currentYear = now.getFullYear();
    for (let i = 4; i >= 0; i--) {
      const y = currentYear - i;
      const yearRev = payments
        .filter((p) => {
          if (p.status !== 'paid') return false;
          return new Date(p.created_at).getFullYear() === y;
        })
        .reduce((s, p) => s + revenueOf(p), 0);
      years.push({ label: String(y), value: yearRev });
    }
    return years;
  }, [chartView, payments, orders]);

  const maxRevenue = Math.max(...chartData.map((d) => d.value), 1);

  /* -------- Derived: payment history rows -------- */
  const orderById = useMemo(() => {
    const m = new Map<string, Order>();
    for (const o of orders) m.set(o.id, o);
    return m;
  }, [orders]);

  const paymentRows: PaymentRow[] = useMemo(() => {
    return payments.map((p) => {
      const order = p.order_id ? orderById.get(p.order_id) ?? null : null;
      const profile = profiles[p.user_id];
      const customerEmail = profile?.email ?? truncate(p.user_id);
      const productName = order?.order_items?.[0]?.name ?? '—';
      return { payment: p, order, customerEmail, productName };
    });
  }, [payments, orderById, profiles]);

  const filteredRows: PaymentRow[] = useMemo(() => {
    return paymentRows.filter((r) => {
      const p = r.payment;
      // status
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      // search (email or order id or razorpay id)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hay = `${r.customerEmail} ${p.order_id ?? ''} ${p.razorpay_payment_id ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // month filter (YYYY-MM)
      if (monthFilter) {
        const pd = new Date(p.created_at);
        const ym = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}`;
        if (ym !== monthFilter) return false;
      }
      // date range
      const pd = new Date(p.created_at);
      if (dateFrom) {
        const from = startOfDay(new Date(dateFrom));
        if (pd < from) return false;
      }
      if (dateTo) {
        const to = startOfDay(new Date(dateTo));
        to.setDate(to.getDate() + 1); // inclusive end
        if (pd >= to) return false;
      }
      return true;
    });
  }, [paymentRows, statusFilter, searchQuery, monthFilter, dateFrom, dateTo]);

  /* -------- Card configs -------- */
  const revenueCards = [
    { label: "Today's Revenue", value: formatINR(revenue.today), icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Monthly Revenue', value: formatINR(revenue.monthly), icon: TrendingUp, color: 'text-primary-600 bg-primary-50' },
    { label: 'Yearly Revenue', value: formatINR(revenue.yearly), icon: IndianRupee, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Revenue', value: formatINR(revenue.total), icon: IndianRupee, color: 'text-purple-600 bg-purple-50' },
  ];

  const orderStatCards = [
    { label: 'Total Orders', value: orderStats.total, icon: Package, color: 'text-primary-600 bg-primary-50' },
    { label: 'Successful Payments', value: orderStats.successful, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Failed Payments', value: orderStats.failed, icon: XCircle, color: 'text-rose-600 bg-rose-50' },
    { label: 'Pending Payments', value: orderStats.pending, icon: ClockIcon, color: 'text-amber-600 bg-amber-50' },
    { label: 'Refunds', value: orderStats.refunds, icon: RotateCcw, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Customers', value: new Set(orders.map((o) => o.user_id)).size, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
  ];

  const chartViews: { key: ChartView; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  const statusOptions: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All Statuses' },
    { key: 'paid', label: 'Paid' },
    { key: 'failed', label: 'Failed' },
    { key: 'pending', label: 'Pending' },
    { key: 'refunded', label: 'Refunded' },
    { key: 'cod', label: 'COD' },
  ];

  /* ----------------------------- Render ----------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Clock className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Store overview, revenue analytics & payment history</p>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {revenueCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <TrendingUp className="h-4 w-4 text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Order / payment stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {orderStatCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <h2 className="font-bold text-gray-900">Revenue Overview</h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {chartViews.map((v) => (
              <button
                key={v.key}
                onClick={() => setChartView(v.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  chartView === v.key
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 h-56">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.value / maxRevenue) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg min-h-[4px] relative group"
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatINR(d.value)}
                </span>
              </motion.div>
              <span className="text-xs text-gray-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-3">
          <h2 className="font-bold text-gray-900">Payment History</h2>
          <div className="flex gap-2">
            <button
              onClick={() => exportCsv(filteredRows)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" /> CSV
            </button>
            <button
              onClick={() => exportExcel(filteredRows)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer / order / payment id"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
            >
              {statusOptions.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-2">Order ID</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Product</th>
                <th className="py-3 px-2">Amount</th>
                <th className="py-3 px-2">Razorpay Payment ID</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-8">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, i) => {
                  const p = r.payment;
                  const StatusIcon = statusIcon(p.status);
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.4) }}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 px-2 font-mono text-xs text-gray-700">
                        {p.order_id ? truncate(p.order_id, 12) : '—'}
                      </td>
                      <td className="py-3 px-2 text-gray-700">{r.customerEmail}</td>
                      <td className="py-3 px-2 text-gray-700 max-w-[180px] truncate" title={r.productName}>
                        {r.productName}
                      </td>
                      <td className="py-3 px-2 font-medium text-gray-900">{formatINR(p.amount)}</td>
                      <td className="py-3 px-2 font-mono text-xs text-gray-500">
                        {p.razorpay_payment_id ? truncate(p.razorpay_payment_id, 14) : '—'}
                      </td>
                      <td className="py-3 px-2 text-gray-500 whitespace-nowrap">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusBadge(
                            p.status
                          )}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {p.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
