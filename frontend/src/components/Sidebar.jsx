import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/search', label: 'Inventory', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
];

const adminLinks = [
  { to: '/admin', label: 'Admin Panel', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/vehicles/new', label: 'Add Vehicle', icon: 'M12 4v16m8-8H4' },
];

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useContext(AuthContext);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-slate-900 flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">AS</div>
          <span className="text-white font-semibold text-lg">AutoStock</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={link.icon} /></svg>
              {link.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin</p>
              </div>
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={link.icon} /></svg>
                  {link.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
