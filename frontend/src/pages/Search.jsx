import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const CATEGORIES = ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'van', 'wagon', 'electric', 'hybrid'];

const columns = [
  { key: 'make', label: 'Make', render: (row) => <span className="font-medium text-gray-900">{row.make}</span> },
  { key: 'model', label: 'Model' },
  { key: 'category', label: 'Category', render: (row) => <Badge variant={row.category}>{row.category}</Badge> },
  { key: 'price', label: 'Price', render: (row) => `$${row.price?.toLocaleString()}` },
  { key: 'quantity', label: 'Qty', render: (row) => <span className={`font-medium ${row.quantity <= 2 ? 'text-red-600' : ''}`}>{row.quantity}</span> },
];

export default function Search() {
  const { isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', sortBy: 'created_at', sortOrder: 'desc' });
  const [page, setPage] = useState(1);
  const [restockVehicle, setRestockVehicle] = useState(null);
  const [restockQty, setRestockQty] = useState(1);
  const [restockError, setRestockError] = useState('');

  const fetchVehicles = async (p = page) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10, sortBy: filters.sortBy, sortOrder: filters.sortOrder };
      if (filters.category) params.category = filters.category;
      if (search) params.search = search;

      const { data } = await api.get('/vehicles', { params });
      setVehicles(data.data || []);
      setMeta(data.meta);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(page); }, [page, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVehicles(1);
  };

  const handlePurchase = async (vehicleId) => {
    try {
      await api.post(`/vehicles/${vehicleId}/purchase`);
      fetchVehicles(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Purchase failed');
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    setRestockError('');
    if (restockQty <= 0) { setRestockError('Quantity must be positive'); return; }
    try {
      await api.post(`/vehicles/${restockVehicle.id}/restock`, { quantity: restockQty });
      setRestockVehicle(null);
      setRestockQty(1);
      fetchVehicles(page);
    } catch (err) { setRestockError(err.response?.data?.message || 'Restock failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Search and manage vehicle stock</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/vehicles/new')}>Add Vehicle</Button>
        )}
      </div>

      <form onSubmit={handleSearch} className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search by make, model, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
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
          <option value="quantity:asc">Quantity: Low to high</option>
          <option value="quantity:desc">Quantity: High to low</option>
        </select>
        <Button type="submit" variant="primary">Search</Button>
      </form>

      <Table
        columns={[
          ...columns,
          {
            key: 'actions', label: 'Actions', render: (row) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handlePurchase(row.id); }}
                  disabled={row.quantity <= 0}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Purchase
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setRestockVehicle(row); setRestockQty(1); setRestockError(''); }}
                      className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Restock
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${row.id}/edit`); }}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            ),
          },
        ]}
        data={vehicles}
        loading={loading}
        emptyMessage="No vehicles match your search"
      />

      <Pagination meta={meta} onPageChange={setPage} />

      <Modal open={restockVehicle !== null} onClose={() => setRestockVehicle(null)} title={`Restock ${restockVehicle?.make} ${restockVehicle?.model}`}>
        <form onSubmit={handleRestock} className="space-y-4">
          {restockError && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2">{restockError}</div>}
          <p className="text-sm text-gray-500">Current quantity: <span className="font-semibold text-gray-900">{restockVehicle?.quantity}</span></p>
          <Input
            label="Quantity to add"
            type="number"
            min="1"
            value={restockQty}
            onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setRestockVehicle(null)}>Cancel</Button>
            <Button type="submit">Restock</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
