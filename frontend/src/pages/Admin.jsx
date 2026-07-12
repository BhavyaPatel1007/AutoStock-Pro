import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BG_IMAGES } from '../constants/images';
import api from '../api/axios';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const ROLES = ['admin', 'user'];
const CATEGORIES = ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'van', 'wagon', 'electric', 'hybrid'];

const userColumns = [
  { key: 'name', label: 'Name', render: (row) => <span className="font-medium text-slate-900">{row.name}</span> },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', render: (row) => <Badge variant={row.role}>{row.role}</Badge> },
  { key: 'created_at', label: 'Joined', render: (row) => {
    const d = new Date(row.created_at);
    return <span className="text-slate-400">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>;
  }},
];

export default function Admin() {
  const outlet = useOutletContext();
  const showToast = outlet?.showToast || (() => {});
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [userMeta, setUserMeta] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleMeta, setVehicleMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [formError, setFormError] = useState('');

  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '', role: 'user' });
  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', category: 'sedan', price: '', quantity: 1 });

  const fetchUsers = async (p = page) => {
    try {
      const { data } = await api.get('/users', { params: { page: p, limit: 10 } });
      setUsers(data.data || []);
      setUserMeta(data.meta);
    } catch { setUsers([]); }
  };

  const fetchVehicles = async (p = page) => {
    try {
      const { data } = await api.get('/vehicles', { params: { page: p, limit: 10 } });
      setVehicles(data.data || []);
      setVehicleMeta(data.meta);
    } catch { setVehicles([]); }
  };

  useEffect(() => {
    setLoading(true);
    (tab === 'users' ? fetchUsers() : fetchVehicles()).finally(() => setLoading(false));
  }, [tab, page]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!userForm.name || !userForm.email || !userForm.password) { setFormError('All fields required'); return; }
    try {
      await api.post('/users', userForm);
      showToast('User created successfully', 'success');
      setCreateOpen(false);
      setUserForm({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) { setFormError(err.response?.data?.message || 'Failed'); }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!editUserForm.name || !editUserForm.email) { setFormError('Name and email required'); return; }
    try {
      await api.patch(`/users/${editUser.id}`, editUserForm);
      showToast('User updated', 'success');
      setEditUser(null);
      fetchUsers();
    } catch (err) { setFormError(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      showToast('User deleted', 'success');
      fetchUsers();
    } catch (err) { showToast(err.response?.data?.message || 'Delete failed', 'error'); }
  };

  const openEditUser = (user) => {
    setEditUserForm({ name: user.name, email: user.email, role: user.role });
    setEditUser(user);
    setFormError('');
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.price) { setFormError('Required fields missing'); return; }
    try {
      await api.put(`/vehicles/${editVehicle.id}`, {
        ...vehicleForm,
        price: parseFloat(vehicleForm.price),
        quantity: parseInt(vehicleForm.quantity),
      });
      showToast('Vehicle updated', 'success');
      setEditVehicle(null);
      fetchVehicles();
    } catch (err) { setFormError(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteVehicle = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      showToast('Vehicle deleted', 'success');
      fetchVehicles();
    } catch (err) { showToast(err.response?.data?.message || 'Delete failed', 'error'); }
  };

  const openEditVehicle = (v) => {
    setVehicleForm({ make: v.make, model: v.model, category: v.category, price: String(v.price), quantity: v.quantity });
    setEditVehicle(v);
  };

  return (
    <div className="space-y-6 page-transition">
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 shadow-blue-md">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMAGES.admin})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/75 to-blue-900/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-blue-lg">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17M3 10h18" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-blue-200/70 mt-0.5">Manage users and vehicles</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
        {['users', 'vehicles'].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              tab === t ? 'bg-white text-slate-900 shadow-blue-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="premium" size="sm" onClick={() => { setFormError(''); setUserForm({ name: '', email: '', password: '', role: 'user' }); setCreateOpen(true); }}>
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 4v16m8-8H4" />
              </svg>
              Create User
            </Button>
          </div>
          <Table
            columns={[
              ...userColumns,
              {
                key: 'actions', label: '', render: (row) => (
                  <div className="flex gap-2">
                    <button onClick={() => openEditUser(row)} className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50">Edit</button>
                    <button onClick={() => handleDeleteUser(row.id)} className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">Delete</button>
                  </div>
                ),
              },
            ]}
            data={users}
            loading={loading}
            emptyMessage="No users found"
          />
          <Pagination meta={userMeta} onPageChange={setPage} />

          <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create User">
            <form onSubmit={handleCreateUser} className="space-y-4">
              {formError && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-2.5 flex items-center gap-2"><svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>{formError}</div>}
              <Input label="Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
              <Input label="Email" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              <Input label="Password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="input-field">
                  {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" variant="premium">Create</Button>
              </div>
            </form>
          </Modal>

          <Modal open={editUser !== null} onClose={() => setEditUser(null)} title="Edit User">
            <form onSubmit={handleEditUser} className="space-y-4">
              {formError && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-2.5 flex items-center gap-2"><svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>{formError}</div>}
              <Input label="Name" value={editUserForm.name} onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })} />
              <Input label="Email" type="email" value={editUserForm.email} onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <select value={editUserForm.role} onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })} className="input-field">
                  {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
                <Button type="submit" variant="premium">Save Changes</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {tab === 'vehicles' && (
        <div className="space-y-4">
          <Table
            columns={[
              { key: 'make', label: 'Make', render: (row) => <span className="font-medium text-slate-900">{row.make}</span> },
              { key: 'model', label: 'Model' },
              { key: 'category', label: 'Category', render: (row) => <Badge variant="default">{row.category}</Badge> },
              { key: 'price', label: 'Price', render: (row) => <span className="font-medium">${row.price?.toLocaleString()}</span> },
              { key: 'quantity', label: 'Qty', render: (row) => <span className={`font-medium ${row.quantity <= 0 ? 'text-red-600' : row.quantity <= 2 ? 'text-amber-600' : ''}`}>{row.quantity}</span> },
              { key: 'actions', label: '', render: (row) => (
                <div className="flex gap-2">
                  <button onClick={() => openEditVehicle(row)} className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50">Edit</button>
                  <button onClick={() => handleDeleteVehicle(row.id)} className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">Delete</button>
                </div>
              )},
            ]}
            data={vehicles}
            loading={loading}
            emptyMessage="No vehicles"
          />
          <Pagination meta={vehicleMeta} onPageChange={setPage} />

          <Modal open={editVehicle !== null} onClose={() => setEditVehicle(null)} title="Edit Vehicle">
            <form onSubmit={handleUpdateVehicle} className="space-y-4">
              {formError && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-2.5 flex items-center gap-2"><svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>{formError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <Input label="Make" value={vehicleForm.make} onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })} />
                <Input label="Model" value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select value={vehicleForm.category} onChange={(e) => setVehicleForm({ ...vehicleForm, category: e.target.value })} className="input-field">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price" type="number" step="0.01" min="0" value={vehicleForm.price} onChange={(e) => setVehicleForm({ ...vehicleForm, price: e.target.value })} />
                <Input label="Quantity" type="number" min="0" value={vehicleForm.quantity} onChange={(e) => setVehicleForm({ ...vehicleForm, quantity: e.target.value })} />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="secondary" onClick={() => setEditVehicle(null)}>Cancel</Button>
                <Button type="submit" variant="premium">Update</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
}
