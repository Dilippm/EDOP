import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, UserRound, X } from 'lucide-react';
import PageTitle from './PageTitle.jsx';
import SampleHint from './SampleHint.jsx';
import { useAuth } from '../../app/auth-context.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const EMPTY_FORM = { name: '', email: '', role: 'developer', password: '' };

export default function FeaturePlaceholder({ title }) {
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const showUserManagement = title.toLowerCase() === 'settings';

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to load users.');
      setUsers(data.users);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (modalOpen) loadUsers();
  }, [modalOpen]);

  const filteredUsers = useMemo(() => users.filter((item) =>
    `${item.name || ''} ${item.email || ''} ${item.role || ''}`.toLowerCase().includes(query.toLowerCase())), [users, query]);

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  function openEditForm(item) {
    setEditingId(item.id);
    setForm({ name: item.name || '', email: item.email || '', role: item.role || 'developer', password: '' });
    setError('');
  }

  async function saveUser(event) {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/users${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to save user.');
      await loadUsers();
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteUser(item) {
    if (!window.confirm(`Delete ${item.name || item.email}? This cannot be undone.`)) return;
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/users/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to delete user.');
      setUsers((current) => current.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) openAddForm();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <>
      <PageTitle eyebrow={`PLATFORM / ${title.toUpperCase()}`} title={title} description={`Review ${title.toLowerCase()} across your platform.`} />
      <SampleHint />
      {showUserManagement ? <section className="panel user-management-card">
        <div className="user-management-icon"><UserRound size={20} /></div>
        <div className="user-management-copy"><h2>User management</h2><p>View users and manage their access to the platform.</p></div>
        <button className="user-management-overlay" type="button" onClick={() => setModalOpen(true)} aria-label="Manage users" />
        <span className="user-management-link">Manage users <span aria-hidden="true">→</span></span>
      </section> : <section className="panel"><h2>{title} view</h2><p className="aside-copy">This section is part of the EDOP navigation design. Its live data and workflows will be added in a later implementation phase.</p></section>}

      {modalOpen && (
        <div className="user-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <section className="user-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
            <header className="user-modal-header"><div><div className="eyebrow">ACCESS CONTROL</div><h2 id="user-modal-title">User management</h2><p>Manage accounts and platform roles.</p></div><button className="icon-button" type="button" onClick={() => setModalOpen(false)} aria-label="Close user management"><X size={19} /></button></header>
            {!isAdmin && <div className="user-error" role="alert">Administrator access is required to manage users.</div>}
            {isAdmin && <>
              <div className="user-modal-toolbar"><label className="searchbox"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" aria-label="Search users" /></label><button className="button primary" type="button" onClick={openAddForm}><Plus size={14} /> Add user</button></div>
              {error && <div className="user-error" role="alert">{error}</div>}
              <div className="user-modal-body">
                <div className="user-table-wrap"><table><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>
                  {loading ? <tr><td colSpan="4" className="user-empty">Loading users…</td></tr> : filteredUsers.length ? filteredUsers.map((item) => <tr key={item.id}><td><strong>{item.name || 'Unnamed user'}</strong></td><td>{item.email}</td><td><span className="badge">{item.role}</span></td><td><div className="user-row-actions"><button type="button" className="icon-button" aria-label={`Edit ${item.name || item.email}`} onClick={() => openEditForm(item)}><Pencil size={15} /></button><button type="button" className="icon-button user-delete" aria-label={`Delete ${item.name || item.email}`} onClick={() => deleteUser(item)}><Trash2 size={15} /></button></div></td></tr>) : <tr><td colSpan="4" className="user-empty">No users found.</td></tr>}
                </tbody></table></div>
                <form className="user-form" onSubmit={saveUser}>
                  <h3>{editingId ? 'Edit user' : 'Add a user'}</h3>
                  <label>Name<input required maxLength="150" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" /></label>
                  <label>Email<input required type="email" maxLength="255" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@company.com" /></label>
                  <label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="developer">Developer</option><option value="admin">Admin</option></select></label>
                  <label>{editingId ? 'New password (optional)' : 'Temporary password'}<input type="password" minLength="8" required={!editingId} autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={editingId ? 'Leave blank to keep current' : 'At least 8 characters'} /></label>
                  <div className="user-form-actions"><button type="button" className="button secondary" onClick={openAddForm}>Clear</button><button className="button primary" type="submit">{editingId ? 'Save changes' : 'Create user'}</button></div>
                </form>
              </div>
            </>}
          </section>
        </div>
      )}
    </>
  );
}
