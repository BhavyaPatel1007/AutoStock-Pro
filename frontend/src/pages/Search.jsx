import { useState, useEffect, useContext } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import Pagination from '../components/ui/Pagination';
import Loading, { CardSkeleton } from '../components/ui/Loading';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import VehicleCard from '../components/ui/VehicleCard';

const CATEGORIES = ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'van', 'wagon', 'electric', 'hybrid'];

export default function Search() {
  const { isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const outlet = useOutletContext();
  const showToast = outlet?.showToast || (() => {});
  const [vehicles, setVehicles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', sortBy: 'created_at', sortOrder: 'desc' });
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [restockVehicle, setRestockVehicle] = useState(null);
  const [restockQty, setRestockQty] = useState(1);
  const [restockError, setRestockError] = useState('');
  const [purchasing, setPurchasing] = useState(null);

  const fetchVehicles = async (p = page, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const params = { page: p, limit: 12, sortBy: filters.sortBy, sortOrder: filters.sortOrder };
      if (filters.category) params.category = filters.category;
      if (search) params.search = search;
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);

      const { data } = await api.get('/vehicles', { params });
      setVehicles(data.data || []);
      setMeta(data.meta);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(page); }, [page, filters, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handlePurchase = async (vehicleId) => {
    setPurchasing(vehicleId);
    try {
      await api.post(`/vehicles/${vehicleId}/purchase`);
      showToast('Vehicle purchased successfully!', 'success');
      fetchVehicles(page, false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Purchase failed', 'error');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    setRestockError('');
    if (restockQty <= 0) { setRestockError('Quantity must be positive'); return; }
    try {
      await api.post(`/vehicles/${restockVehicle.id}/restock`, { quantity: restockQty });
      showToast('Vehicle restocked successfully!', 'success');
      setRestockVehicle(null);
      setRestockQty(1);
      fetchVehicles(page, false);
    } catch (err) {
      setRestockError(err.response?.data?.message || 'Restock failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle? This action cannot be undone.')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      showToast('Vehicle deleted', 'success');
      fetchVehicles(page, false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setFilters({ category: '', sortBy: 'created_at', sortOrder: 'desc' });
    setPage(1);
  };

  const hasActiveFilters = search || filters.category || minPrice || maxPrice;

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-400 mt-0.5">Search and manage your vehicle stock</p>
        </div>
        {isAdmin && (
          <Button variant="premium" size="md" onClick={() => navigate('/vehicles/new')}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Add Vehicle
          </Button>
        )}
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              name="search"
              placeholder="Search by make, model, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
            className="input-field sm:w-40"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <select
            value={`${filters.sortBy}:${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split(':');
              setFilters({ ...filters, sortBy, sortOrder });
              setPage(1);
            }}
            className="input-field sm:w-44"
          >
            <option value="created_at:desc">Newest first</option>
            <option value="created_at:asc">Oldest first</option>
            <option value="price:asc">Price: Low to high</option>
            <option value="price:desc">Price: High to low</option>
            <option value="make:asc">Make: A-Z</option>
            <option value="make:desc">Make: Z-A</option>
            <option value="quantity:asc">Qty: Low to high</option>
            <option value="quantity:desc">Qty: High to low</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input-field w-32"
              min="0"
            />
            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input-field w-32"
              min="0"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md">
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </Button>
            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="md" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No vehicles match your search</p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="mt-3" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {vehicles.map((v, i) => (
              <div key={v.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <VehicleCard
                  vehicle={v}
                  onPurchase={handlePurchase}
                  purchasing={purchasing === v.id}
                  adminActions={isAdmin ? (
                    <div className="flex gap-1.5 w-full">
                      <button
                        onClick={(e) => { e.stopPropagation(); setRestockVehicle(v); setRestockQty(1); setRestockError(''); }}
                        className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 hover:border-amber-400/50 active:scale-95 backdrop-blur-sm"
                      >
                        Restock
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${v.id}/edit`); }}
                        className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 bg-blue-500/20 text-blue-300 border border-blue-400/30 hover:bg-blue-500/30 hover:border-blue-400/50 active:scale-95 backdrop-blur-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }}
                        className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30 hover:border-red-400/50 active:scale-95 backdrop-blur-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                />
              </div>
            ))}
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}

      {/* Restock Modal */}
      <Modal open={restockVehicle !== null} onClose={() => setRestockVehicle(null)} title={`Restock ${restockVehicle?.make} ${restockVehicle?.model}`}>
        <form onSubmit={handleRestock} className="space-y-5">
          {restockError && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
              {restockError}
            </div>
          )}
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-sm text-slate-400">Current quantity</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{restockVehicle?.quantity}</p>
          </div>
          <Input
            label="Quantity to add"
            type="number"
            min="1"
            value={restockQty}
            onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setRestockVehicle(null)}>Cancel</Button>
            <Button type="submit" variant="premium">Restock</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
