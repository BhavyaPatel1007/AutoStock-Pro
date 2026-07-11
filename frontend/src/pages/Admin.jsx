import { useState, useEffect } from 'react';
import api from '../api/axios';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';

const ROLES = ['admin', 'user'];

const userColumns = [
  { key: 'name', label: 'Name', render: (row) => <span className="font-medium text-gray-900">{row.name}</span> },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', render: (row) => <Badge variant={row.role}>{row.role}</Badge> },
  { key: 'created_at', label: 'Joined', render: (row) => new Date(row.created_at).toLocaleDateString() },
];

export default function Admin() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [userMeta, setUserMeta] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleMeta, setVehicleMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [showVehicleCreate, setShowVehicleCreate] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [formError, setFormError] = useState('');

  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '', role: 'user' });
  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', category: 'sedan', price: '', quantity: 1 });

  const CATEGORIES = ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'van', 'wagon', 'electric', 'hybrid'];

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
      setEditUser(null);
      fetchUsers();
    } catch (err) { setFormError(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  const openEditUser = (user) => {
    setEditUserForm({ name: user.name, email: user.email, role: user.role });
    setEditUser(user);
    setFormError('');
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.price) { setFormError('Required fields missing'); return; }
    try {
      await api.post('/vehicles', { ...vehicleForm, price: parseFloat(vehicleForm.price), quantity: parseInt(vehicleForm.quantity) });
      setShowVehicleCreate(false);
      setVehicleForm({ make: '', model: '', category: 'sedan', price: '', quantity: 1 });
      fetchVehicles();
    } catch (err) { setFormError(err.response?.data?.message || 'Failed'); }
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.price) { setFormError('Required fields missing'); return; }
    try {
      await api.put(`/vehicles/${editVehicle.id}`, { ...vehicleForm, price: parseFloat(vehicleForm.price), quantity: parseInt(vehicleForm.quantity) });
      setEditVehicle(null);
      fetchVehicles();
    } catch (err) { setFormError(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteVehicle = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  const openEditVehicle = (v) => {
    setVehicleForm({ make: v.make, model: v.model, category: v.category, price: String(v.price), quantity: v.quantity });
    setEditVehicle(v);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => { setTab('users'); setPage(1); }} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Users</button>
        <button onClick={() => { setTab('vehicles'); setPage(1); }} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'vehicles' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Vehicles</button>
      </div>

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setFormError(''); setUserForm({ name: '', email: '', password: '', role: 'user' }); setCreateOpen(true); }}>Create User</Button>
          </div>
          <Table
            columns={[
              ...userColumns,
              {
                key: 'actions', label: '', render: (row) => (
                  <div className="flex gap-2">
                    <button onClick={() => openEditUser(row)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    <button onClick={() => handleDeleteUser(row.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
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
              {formError && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2">{formError}</div>}
              <Input label="Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
              <Input label="Email" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              <Input label="Password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="input-field">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Modal>

          <Modal open={editUser !== null} onClose={() => setEditUser(null)} title="Edit User">
            <form onSubmit={handleEditUser} className="space-y-4">
              {formError && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2">{formError}</div>}
              <Input label="Name" value={editUserForm.name} onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })} />
              <Input label="Email" type="email" value={editUserForm.email} onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select value={editUserForm.role} onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })} className="input-field">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {tab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setFormError(''); setVehicleForm({ make: '', model: '', category: 'sedan', price: '', quantity: 1 }); setEditVehicle(null); setShowVehicleCreate(true); }}>Add Vehicle</Button>
          </div>
          <Table
            columns={[
              { key: 'make', label: 'Make', render: (row) => <span className="font-medium">{row.make}</span> },
              { key: 'model', label: 'Model' },
              { key: 'category', label: 'Category' },
              { key: 'price', label: 'Price', render: (row) => `$${row.price?.toLocaleString()}` },
              { key: 'quantity', label: 'Qty' },
              { key: 'actions', label: '', render: (row) => (
                <div className="flex gap-2">
                  <button onClick={() => openEditVehicle(row)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                  <button onClick={() => handleDeleteVehicle(row.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
                </div>
              )},
            ]}
            data={vehicles}
            loading={loading}
            emptyMessage="No vehicles"
          />
          <Pagination meta={vehicleMeta} onPageChange={setPage} />

          <Modal open={showVehicleCreate || editVehicle !== null} onClose={() => { setShowVehicleCreate(false); setEditVehicle(null); }} title={editVehicle ? 'Edit Vehicle' : 'Add Vehicle'}>
            <form onSubmit={editVehicle ? handleUpdateVehicle : handleCreateVehicle} className="space-y-4">
              {formError && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2">{formError}</div>}
              <Input label="Make" value={vehicleForm.make} onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })} />
              <Input label="Model" value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select value={vehicleForm.category} onChange={(e) => setVehicleForm({ ...vehicleForm, category: e.target.value })} className="input-field">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <Input label="Price" type="number" step="0.01" min="0" value={vehicleForm.price} onChange={(e) => setVehicleForm({ ...vehicleForm, price: e.target.value })} />
              <Input label="Quantity" type="number" min="0" value={vehicleForm.quantity} onChange={(e) => setVehicleForm({ ...vehicleForm, quantity: e.target.value })} />
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => { setShowVehicleCreate(false); setEditVehicle(null); }}>Cancel</Button>
                <Button type="submit">{editVehicle ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
}
