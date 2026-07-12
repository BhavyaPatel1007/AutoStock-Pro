import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BG_IMAGES } from '../constants/images';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('All fields are required'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-blue-lg">
              <span className="text-white font-bold text-xl">AS</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
            <p className="text-slate-400 mt-1">Get started with AutoStock Pro</p>
          </div>

          <div className="bg-white rounded-3xl shadow-blue-xl border border-slate-100 p-8">
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 mb-6 animate-fade-in">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min. 6 chars"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <Input
                  label="Confirm"
                  type="password"
                  placeholder="Repeat"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>

              <Button type="submit" variant="premium" size="lg" className="w-full" loading={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMAGES.register})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-slate-900/85 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent" />
        <div className="relative text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-blue-xl shadow-blue-500/20">
            <span className="text-white font-bold text-2xl">AS</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Join AutoStock Pro</h1>
          <p className="text-blue-200/80 text-lg leading-relaxed">
            Manage your dealership inventory with enterprise-grade tools.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {['Secure Access', 'Vehicle Tracking', 'Purchase History', 'Role Management'].map((f) => (
              <div key={f} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                <p className="text-sm text-blue-200 font-medium">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
