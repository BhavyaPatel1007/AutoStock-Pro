import { useState, useEffect, useContext } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BG_IMAGES } from '../constants/images';
import api from '../api/axios';
import Loading, { CardSkeleton } from '../components/ui/Loading';
import Button from '../components/ui/Button';
import VehicleCard from '../components/ui/VehicleCard';

export default function Dashboard() {
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const outlet = useOutletContext();
  const showToast = outlet?.showToast || (() => {});
  const [stats, setStats] = useState({ total: 0, lowStock: 0, totalValue: 0, outOfStock: 0, avgPrice: 0 });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, vehiclesRes] = await Promise.all([
          api.get('/vehicles/stats'),
          api.get('/vehicles?limit=12'),
        ]);
        setStats(statsRes.data.data || { total: 0, lowStock: 0, totalValue: 0, outOfStock: 0, avgPrice: 0 });
        setVehicles(vehiclesRes.data.data || []);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePurchase = async (vehicleId) => {
    try {
      await api.post(`/vehicles/${vehicleId}/purchase`);
      showToast('Vehicle purchased successfully!', 'success');
      const res = await api.get('/vehicles?limit=12');
      setVehicles(res.data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Purchase failed', 'error');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <p className="text-slate-600 font-medium mb-4">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12 shadow-blue-xl">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMAGES.dashboard})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/80 to-blue-900/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
            <span className="text-emerald-400/80 text-xs font-medium tracking-wider uppercase">Inventory Overview</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-blue-200/70 text-lg max-w-xl leading-relaxed">
            {isAdmin
              ? 'Manage your dealership inventory, track stock levels, and process purchases.'
              : 'Browse our inventory, search for vehicles, and make purchases.'}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="premium" size="lg" onClick={() => navigate('/search')}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Inventory
            </Button>
            {isAdmin && (
              <Button variant="secondary" size="lg" onClick={() => navigate('/vehicles/new')} className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 4v16m8-8H4" />
                </svg>
                Add Vehicle
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Vehicles', value: stats.total, icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M8 3h8M4 11h16', color: 'from-blue-500 to-blue-600' },
            { label: 'Low Stock', value: stats.lowStock, icon: 'M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: stats.lowStock > 0 ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-emerald-600' },
            { label: 'Out of Stock', value: stats.outOfStock, icon: 'M6 18L18 6M6 6l12 12', color: stats.outOfStock > 0 ? 'from-red-500 to-rose-600' : 'from-emerald-500 to-emerald-600' },
            { label: 'Total Value', value: `$${(stats.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-blue-500 to-blue-600' },
          ].map((stat, i) => (
            <div key={stat.label} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d={stat.icon} />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Featured Vehicles</h2>
            <p className="text-sm text-slate-400 mt-0.5">Browse our latest inventory</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/search')} className="gap-1.5">
            View All
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM5 17h14M5 17l-2-8h16l-2 8" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">No vehicles in inventory</p>
            <p className="text-slate-300 text-sm mt-1">Add your first vehicle to get started</p>
            {isAdmin && (
              <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate('/vehicles/new')}>
                Add Vehicle
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {vehicles.map((v, i) => (
              <div key={v.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <VehicleCard
                  vehicle={v}
                  onPurchase={handlePurchase}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
