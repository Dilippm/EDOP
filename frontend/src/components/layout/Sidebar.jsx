import { NavLink } from 'react-router-dom';
import { ChevronDown, Hexagon, X } from 'lucide-react';
import { navigationItems } from '../../data/navigation.js';
import { useAuth } from '../../app/auth-context.jsx';

export default function Sidebar({ open, onClose, onSignOut }) {
  const { user } = useAuth();
  const displayName = user?.name?.trim() || user?.username || user?.email || 'User';
  const displayRole = user?.role
    ? user.role.toLowerCase().replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'User';
  const avatarInitials = displayName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'U';

  return (
    <>
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><Hexagon size={26} /><b>◆</b></span>
          <span className="brand-copy"><strong>EDOP</strong><small>DEPLOYMENT PLATFORM</small></span>
          <button className="close-nav" onClick={onClose} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <nav className="main-nav">
          {navigationItems.map(({ label, path, icon: Icon, count }) => (
            <NavLink key={label} to={path} end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
              <Icon size={17} />
              <span>{label}</span>
              {count && <span className="nav-count">{count}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="profile" onClick={onSignOut}>
            <span className="profile-avatar">{avatarInitials}</span>
            <span><strong>{displayName}</strong><small>{displayRole}</small></span>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>
      <button type="button" className="mobile-backdrop" onClick={onClose} aria-label="Close navigation" />
    </>
  );
}
