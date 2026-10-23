import { Bell, Menu, Search, Sun } from 'lucide-react';

export default function Topbar({ onOpenNavigation }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onOpenNavigation} aria-label="Open navigation"><Menu size={20} /></button>
      <div className="global-search">
        <Search size={16} />
        <input placeholder="Search services, repositories, deployments..." aria-label="Search platform" />
      </div>
      <div className="top-actions">
        <button className="icon-button" aria-label="Toggle appearance"><Sun size={17} /></button>
        <button className="icon-button notification-button" aria-label="Notifications"><Bell size={17} /><i>3</i></button>
        <span className="user-avatar">A</span>
      </div>
    </header>
  );
}
