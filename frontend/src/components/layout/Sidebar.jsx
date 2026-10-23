import { NavLink } from 'react-router-dom';
import { ChevronDown, Hexagon, X } from 'lucide-react';
import { navigationItems } from '../../data/navigation.js';

export default function Sidebar({ open, onClose, onSignOut }) {
  return (
    <>
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><Hexagon size={26} /><b>◆</b></span>
          <span className="brand-copy"><strong>EDOP</strong><small>ENTERPRISE DEPLOYMENT PLATFORM</small></span>
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
            <span className="profile-avatar">A</span>
            <span><strong>Admin User</strong><small>Platform Engineer</small></span>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>
      <button type="button" className="mobile-backdrop" onClick={onClose} aria-label="Close navigation" />
    </>
  );
}
