import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Hash, CheckCircle2, Copy, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAllUids, fetchIgnitionStats, type IgnitionUid } from '../../ecommerce/ignitionServices';
import { formatDate, formatDateTime } from '../../ecommerce/utils';

export default function AdminIgnitionDashboard() {
  const [uids, setUids] = useState<IgnitionUid[]>([]);
  const [stats, setStats] = useState({ total: 0, available: 0, registered: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uidList, statsData] = await Promise.all([
        fetchAllUids(),
        fetchIgnitionStats(),
      ]);
      setUids(uidList);
      setStats(statsData);
    } catch {
      toast.error('Failed to load IGNITION data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return uids.filter((u) => {
      const matchSearch = u.uid.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [uids, search, statusFilter]);

  const copyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    toast.success('UID copied');
  };

  const statCards = [
    { label: 'Total UIDs', value: stats.total, icon: Hash, color: 'text-primary-600 bg-primary-50' },
    { label: 'Available UIDs', value: stats.available, icon: Zap, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Registered UIDs', value: stats.registered, icon: CheckCircle2, color: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="text-primary-600" /> IGNITION 2K26 Dashboard
        </h1>
        <p className="text-sm text-gray-500">UID management and statistics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statCards.map((stat, i) => (
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
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by UID..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="registered">Registered</option>
        </select>
      </div>

      {/* UID Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-4">UID</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Created At</th>
                <th className="text-left p-4">Registered At</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center p-8 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-8 text-gray-400">No UIDs found</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-mono font-medium text-gray-900">{u.uid}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        u.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{formatDate(u.created_at)}</td>
                    <td className="p-4 text-gray-600">{u.registered_at ? formatDateTime(u.registered_at) : '—'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => copyUid(u.uid)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        aria-label="Copy UID"
                      >
                        <Copy size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
