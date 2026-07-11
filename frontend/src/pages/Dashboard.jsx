import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import Button from '../components/ui/Button';

const categoryColors = {
  sedan: 'blue', suv: 'green', truck: 'orange', coupe: 'purple',
  convertible: 'pink', hatchback: 'teal', van: 'yellow', wagon: 'indigo',
  electric: 'emerald', hybrid: 'cyan',
};

export default function Dashboard() {
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, lowStock: 0, totalValue: 0, outOfStock: 0, avgPrice: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, vehiclesRes] = await Promise.all([
          api.get('/vehicles/stats'),
          api.get('/vehicles?limit=5'),
        ]);
        setStats(statsRes.data.data || { total: 0, lowStock: 0, totalValue: 0, outOfStock: 0, avgPrice: 0 });
        setRecent(vehiclesRes.data.data || []);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="card p-6 text-center"><p className="text-red-600">{error}</p><Button onClick={() => window.location.reload()} variant="secondary" className="mt-4">Retry</Button></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-gray-500">Low Stock (&le;2)</p>
          <p className={`text-3xl font-bold mt-1 ${stats.lowStock > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.lowStock}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-gray-500">Total Inventory Value</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm font-medium text-gray-500">Out of Stock</p>
          <p className={`text-3xl font-bold mt-1 ${stats.outOfStock > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.outOfStock}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-gray-500">Average Price</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            ${stats.avgPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-gray-500">Total Models</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{recent.length > 0 ? stats.total : '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-0">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Vehicles</h2>
          </div>
          {recent.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No vehicles yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recent.map((v) => (
                <div key={v.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/vehicles/${v.id}/edit`)}>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v.make} {v.model}</p>
                    <p className="text-xs text-gray-400">{v.category} &middot; ${v.price?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${v.quantity <= 2 ? 'text-red-600' : 'text-gray-600'}`}>Qty: {v.quantity}</span>
                    <Badge variant="default">{v.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/search')} className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
              <p className="font-medium text-gray-900 text-sm">Browse Inventory</p>
              <p className="text-xs text-gray-400 mt-1">Search and filter vehicles</p>
            </button>
            {isAdmin && (
              <>
                <button onClick={() => navigate('/vehicles/new')} className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                  <p className="font-medium text-gray-900 text-sm">Add Vehicle</p>
                  <p className="text-xs text-gray-400 mt-1">Register a new vehicle</p>
                </button>
                <button onClick={() => navigate('/admin')} className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                  <p className="font-medium text-gray-900 text-sm">Admin Panel</p>
                  <p className="text-xs text-gray-400 mt-1">Manage users and data</p>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
