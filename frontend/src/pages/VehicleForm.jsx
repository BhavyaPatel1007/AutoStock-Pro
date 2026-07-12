import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';

const CATEGORIES = ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'van', 'wagon', 'electric', 'hybrid'];

export default function VehicleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const outlet = useOutletContext();
  const showToast = outlet?.showToast || (() => {});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    make: '', model: '', category: 'sedan', price: '', quantity: 1,
  });

  useEffect(() => {
    if (!isEdit) return;
    const fetchVehicle = async () => {
      try {
        const { data } = await api.get(`/vehicles/${id}`);
        const v = data.data;
        setForm({ make: v.make, model: v.model, category: v.category, price: String(v.price), quantity: v.quantity });
      } catch {
        setError('Vehicle not found');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.make || !form.model || !form.price) { setError('Make, model, and price are required'); return; }

    const payload = {
      make: form.make,
      model: form.model,
      category: form.category,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10) || 0,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/vehicles/${id}`, payload);
        showToast('Vehicle updated successfully!', 'success');
      } else {
        await api.post('/vehicles', payload);
        showToast('Vehicle created successfully!', 'success');
      }
      navigate('/search');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h1>
        <p className="text-slate-400 mt-0.5">{isEdit ? 'Update vehicle details' : 'Register a new vehicle in inventory'}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 animate-fade-in">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Make *"
              placeholder="e.g. Toyota"
              value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })}
            />
            <Input
              label="Model *"
              placeholder="e.g. Camry"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Price *"
              type="number"
              step="0.01"
              min="0"
              placeholder="25000"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input
              label="Quantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Button type="submit" variant="premium" size="lg" loading={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Create Vehicle'}
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
