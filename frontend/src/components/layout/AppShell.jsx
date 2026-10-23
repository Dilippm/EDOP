import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppShell({ open, onCloseNavigation, onOpenNavigation, onSignOut, children }) {
  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={onCloseNavigation} onSignOut={onSignOut} />
      <main className="main-area">
        <Topbar onOpenNavigation={onOpenNavigation} />
        <div className="page-content">
          {children}
          <footer>EDOP <span>·</span> Internal Developer Platform <span className="footer-right">Preview build · Sample data only</span></footer>
        </div>
      </main>
    </div>
  );
}
