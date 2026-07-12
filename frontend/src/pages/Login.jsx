import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BG_IMAGES } from '../constants/images';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('All fields are required'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMAGES.login})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-blue-900/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent" />
        <div className="relative text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-blue-xl shadow-blue-500/20">
            <span className="text-white font-bold text-2xl">AS</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">AutoStock Pro</h1>
          <p className="text-blue-200/80 text-lg leading-relaxed">
            Premium inventory management for modern automotive dealerships.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-left">
            {['Real-time Inventory', 'Smart Analytics', 'Role-based Access'].map((f) => (
              <div key={f} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p className="text-xs text-blue-200 font-medium">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-blue-lg">
              <span className="text-white font-bold text-xl">AS</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-400 mt-1">Sign in to AutoStock Pro</p>
          </div>

          <div className="bg-white rounded-3xl shadow-blue-xl border border-slate-100 p-8">
            <div className="hidden lg:block mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
              <p className="text-slate-400 mt-1">Sign in to your account</p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 mb-6 animate-fade-in">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <Button type="submit" variant="premium" size="lg" className="w-full" loading={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
