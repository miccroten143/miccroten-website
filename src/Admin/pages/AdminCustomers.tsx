import { useEffect, useState } from 'react';
import { Search, Mail, Package, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatINR, formatDate } from '../../ecommerce/utils';

interface Customer {
  id: string;
  email: string;
  created_at: string;
  orderCount: number;
  totalSpent: number;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data: users } = await supabase.auth.admin.listUsers();
        if (!users) { setLoading(false); return; }
        const { data: orders } = await supabase.from('orders').select('user_id, total');
        const orderMap = new Map<string, { count: number; total: number }>();
        (orders ?? []).forEach((o: { user_id: string; total: number }) => {
          const existing = orderMap.get(o.user_id) ?? { count: 0, total: 0 };
          existing.count += 1;
          existing.total += Number(o.total);
          orderMap.set(o.user_id, existing);
        });
        const list: Customer[] = (users.users ?? []).map((u) => ({
          id: u.id,
          email: u.email ?? '',
          created_at: u.created_at,
          orderCount: orderMap.get(u.id)?.count ?? 0,
          totalSpent: orderMap.get(u.id)?.total ?? 0,
        }));
        setCustomers(list);
      } catch {
        // admin.listUsers may not be available with anon key; fall back to orders-derived users
        try {
          const { data: orders } = await supabase.from('orders').select('user_id, total, created_at');
          const { data: profiles } = await supabase.from('orders').select('user_id');
          const map = new Map<string, Customer>();
          (orders ?? []).forEach((o: { user_id: string; total: number; created_at: string }) => {
            const ex = map.get(o.user_id) ?? { id: o.user_id, email: '—', created_at: o.created_at, orderCount: 0, totalSpent: 0 };
            ex.orderCount += 1;
            ex.totalSpent += Number(o.total);
            map.set(o.user_id, ex);
          });
          setCustomers(Array.from(map.values()));
        } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = customers.filter((c) => c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500">{customers.length} registered customers</p>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-left p-4">Orders</th>
                <th className="text-left p-4">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center p-8 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center p-8 text-gray-400">No customers found</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{c.email}</p>
                        <p className="text-xs text-gray-400 font-mono">{c.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{formatDate(c.created_at)}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-gray-700"><Package size={14} /> {c.orderCount}</span>
                  </td>
                  <td className="p-4 font-medium">{formatINR(c.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
