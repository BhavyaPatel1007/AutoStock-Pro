import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/search', label: 'Inventory', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
];

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useContext(AuthContext);

  const linkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden animate-fade-in" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-slate-950 flex flex-col transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-blue-lg shadow-blue-500/20">
            AS
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">AutoStock</span>
            <span className="block text-[10px] text-blue-400 font-medium tracking-widest uppercase">Inventory Pro</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-4 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Main</p>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={onClose} className={linkClass} end={link.to === '/dashboard'}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <path d={link.icon} />
              </svg>
              {link.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="px-4 pt-6 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Administration</p>
              <NavLink to="/vehicles/new" onClick={onClose} className={linkClass}>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                  <path d="M12 4v16m8-8H4" />
                </svg>
                Add Vehicle
              </NavLink>
              <NavLink to="/admin" onClick={onClose} className={linkClass}>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <div className="px-4 py-3 rounded-xl bg-white/5">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm font-medium text-white truncate mt-0.5">
              {isAdmin ? 'Administrator' : 'User'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
