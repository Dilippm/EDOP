import { useEffect, useMemo, useState } from 'react';
import { FolderPlus, Link2, Search, Trash2, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../../app/auth-context.jsx';
import DataTable from '../../../components/ui/DataTable.jsx';
import PageTitle from '../../../components/ui/PageTitle.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const EMPTY_PROJECT = { name: '', description: '' };
const EMPTY_REPOSITORY = { repoUrl: '' };
const EMPTY_MEMBER = { email: '', role: 'developer' };

function formatCreatedAt(value) {
  if (!value) return 'Just now';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function RepositoriesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState('');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [repositoryForm, setRepositoryForm] = useState(EMPTY_REPOSITORY);
  const [repositoryError, setRepositoryError] = useState('');
  const [repositoriesLoading, setRepositoriesLoading] = useState(false);
  const [repositorySaving, setRepositorySaving] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberForm, setMemberForm] = useState(EMPTY_MEMBER);
  const [memberError, setMemberError] = useState('');
  const [memberSaving, setMemberSaving] = useState(false);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return projects;
    return projects.filter((project) => `${project.name} ${project.description || ''}`.toLowerCase().includes(normalizedQuery));
  }, [projects, query]);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      if (!user?.accessToken) {
        if (!cancelled) {
          setProjects([]);
          setProjectsLoading(false);
        }
        return;
      }

      setProjectsLoading(true);
      setProjectsError('');
      try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Unable to load projects.');
        if (!cancelled) setProjects(data.projects || []);
      } catch (requestError) {
        if (!cancelled) {
          setProjects([]);
          setProjectsError(requestError.message);
        }
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    }

    loadProjects();
    return () => { cancelled = true; };
  }, [user?.accessToken]);

  function openProjectForm() {
    if (!isAdmin) return;
    setForm(EMPTY_PROJECT);
    setError('');
    setFormOpen(true);
  }

  async function createProject(event) {
    event.preventDefault();
    if (!isAdmin) {
      setError('Administrator access is required to create projects.');
      return;
    }
    const name = form.name.trim();
    if (!name || name.length > 150) {
      setError('Project name is required and must be 150 characters or fewer.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken || ''}`,
        },
        body: JSON.stringify({ name, description: form.description || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to create project.');

      setProjects((current) => [data.project, ...current]);
      setForm(EMPTY_PROJECT);
      setFormOpen(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function selectProject(project) {
    setSelectedProject(project);
    setRepositoryForm(EMPTY_REPOSITORY);
    setRepositoryError('');
    setMemberForm(EMPTY_MEMBER);
    setMemberError('');
    setRepositoriesLoading(true);
    setMembersLoading(true);
    try {
      const headers = { Authorization: `Bearer ${user?.accessToken || ''}` };
      const [repositoriesResponse, membersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/projects/${project.id}/repositories`, { headers }),
        fetch(`${API_BASE_URL}/projects/${project.id}/members`, { headers }),
      ]);
      const [repositoriesData, membersData] = await Promise.all([
        repositoriesResponse.json().catch(() => ({})),
        membersResponse.json().catch(() => ({})),
      ]);
      if (!repositoriesResponse.ok) throw new Error(repositoriesData.message || 'Unable to load project repositories.');
      if (!membersResponse.ok) throw new Error(membersData.message || 'Unable to load project members.');
      setRepositories(repositoriesData.repositories || []);
      setMembers(membersData.members || []);
    } catch (requestError) {
      setRepositories([]);
      setMembers([]);
      setRepositoryError(requestError.message);
    } finally {
      setRepositoriesLoading(false);
      setMembersLoading(false);
    }
  }

  async function addRepository(event) {
    event.preventDefault();
    const repoUrl = repositoryForm.repoUrl.trim();
    if (!repoUrl) {
      setRepositoryError('A GitHub repository URL is required.');
      return;
    }

    setRepositorySaving(true);
    setRepositoryError('');
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}/repositories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken || ''}` },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to link repository.');
      setRepositories((current) => [data.repository, ...current]);
      setRepositoryForm(EMPTY_REPOSITORY);
    } catch (requestError) {
      setRepositoryError(requestError.message);
    } finally {
      setRepositorySaving(false);
    }
  }

  async function unlinkRepository(repository) {
    setUnlinkingId(repository.id);
    setRepositoryError('');
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}/repositories/${repository.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.accessToken || ''}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to unlink repository.');
      setRepositories((current) => current.filter((item) => item.id !== repository.id));
    } catch (requestError) {
      setRepositoryError(requestError.message);
    } finally {
      setUnlinkingId(null);
    }
  }

  async function addMember(event) {
    event.preventDefault();
    setMemberSaving(true);
    setMemberError('');
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken || ''}` },
        body: JSON.stringify(memberForm),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to add project member.');
      setMembers((current) => [...current, data.member]);
      setMemberForm(EMPTY_MEMBER);
    } catch (requestError) {
      setMemberError(requestError.message);
    } finally {
      setMemberSaving(false);
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete ${project.name}? This removes its EDOP repository links and memberships.`)) return;

    setDeletingProjectId(project.id);
    setProjectsError('');
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${project.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.accessToken || ''}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to delete project.');
      setProjects((current) => current.filter((item) => item.id !== project.id));
      if (selectedProject?.id === project.id) setSelectedProject(null);
    } catch (requestError) {
      setProjectsError(requestError.message);
    } finally {
      setDeletingProjectId(null);
    }
  }

  return (
    <>
      <PageTitle eyebrow="CATALOG / PROJECTS" title="Projects" description="Browse your project workspaces and linked repositories." action={isAdmin ? <button className="button primary" type="button" onClick={openProjectForm}><FolderPlus size={15} /> New project</button> : null} />
      {formOpen && <section className="panel project-create-panel" aria-labelledby="new-project-title">
        <div className="panel-heading"><div><h2 id="new-project-title">Create a project</h2><p>You will be added as this project’s owner.</p></div><button className="icon-button" type="button" onClick={() => setFormOpen(false)} aria-label="Close create project form"><X size={18} /></button></div>
        <form className="project-form" onSubmit={createProject}>
          <label>Project name<input required maxLength="150" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="EDOP Platform" autoFocus /></label>
          <label>Description <span className="muted">(optional)</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What is this project for?" rows="3" /></label>
          {error && <div className="project-error" role="alert">{error}</div>}
          <div className="project-form-actions"><button className="button secondary" type="button" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button><button className="button primary" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create project'}</button></div>
        </form>
      </section>}
      <section className="panel">
        <div className="toolbar"><label className="searchbox"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search projects" placeholder="Search projects" /></label></div>
        {projectsError && <div className="project-error" role="alert">{projectsError}</div>}
        <DataTable headers={['Project', 'Your role', 'Created', '']} rows={projectsLoading ? <tr><td colSpan="4" className="project-empty">Loading projects…</td></tr> : filteredProjects.length ? filteredProjects.map((project) => (
          <tr key={project.id}><td><strong>{project.name}</strong><small>{project.description || 'No description'}</small></td><td><span className="badge">{project.member_role ? `You · ${project.member_role}` : 'Member'}</span></td><td>{formatCreatedAt(project.created_at)}</td><td><div className="project-actions"><button className="text-button" type="button" onClick={() => selectProject(project)}>Repositories <span>→</span></button>{project.member_role === 'owner' && <button className="text-button project-delete" type="button" onClick={() => deleteProject(project)} disabled={deletingProjectId === project.id}><Trash2 size={13} />{deletingProjectId === project.id ? 'Deleting…' : 'Delete'}</button>}</div></td></tr>
        )) : <tr><td colSpan="4" className="project-empty">{projects.length ? 'No projects match your search.' : 'No projects yet. Create your first project to get started.'}</td></tr>} />
      </section>
      {selectedProject && <section className="panel repository-panel" aria-labelledby="project-repositories-title">
        <div className="panel-heading"><div><h2 id="project-repositories-title">Repositories · {selectedProject.name}</h2><p>Link GitHub repositories to this project. Links are saved as unverified until GitHub repository verification is available.</p></div><button className="icon-button" type="button" onClick={() => setSelectedProject(null)} aria-label="Close project repositories"><X size={18} /></button></div>
        {selectedProject.member_role === 'owner' ? <form className="repository-form" onSubmit={addRepository}>
          <label>GitHub repository URL<input required type="url" value={repositoryForm.repoUrl} onChange={(event) => setRepositoryForm({ repoUrl: event.target.value })} placeholder="https://github.com/OWNER/REPOSITORY" /></label>
          <button className="button primary" type="submit" disabled={repositorySaving}><Link2 size={14} />{repositorySaving ? 'Linking…' : 'Link repository'}</button>
        </form> : <p className="project-permission">Only this project’s owner can link or unlink repositories.</p>}
        {repositoryError && <div className="project-error" role="alert">{repositoryError}</div>}
        <DataTable headers={['Repository', 'Status', 'Linked', '']} rows={repositoriesLoading ? <tr><td colSpan="4" className="project-empty">Loading repositories…</td></tr> : repositories.length ? repositories.map((repository) => (
          <tr key={repository.id}><td><strong>{repository.owner_login}/{repository.repo_name}</strong><small>{repository.repo_url}</small></td><td><span className="badge">{repository.verification_status === 'verified' ? 'Verified' : 'Unverified link'}</span></td><td>{formatCreatedAt(repository.created_at)}</td><td>{selectedProject.member_role === 'owner' && <button className="text-button repository-unlink" type="button" onClick={() => unlinkRepository(repository)} disabled={unlinkingId === repository.id}><Trash2 size={13} />{unlinkingId === repository.id ? 'Unlinking…' : 'Unlink'}</button>}</td></tr>
        )) : <tr><td colSpan="4" className="project-empty">No repositories linked to this project.</td></tr>} />
        <div className="project-members">
          <div className="panel-heading"><div><h2>Members</h2><p>Only project members can see this project and its linked repositories.</p></div></div>
          {selectedProject.member_role === 'owner' ? <form className="member-form" onSubmit={addMember}>
            <label>Member email<input required type="email" value={memberForm.email} onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })} placeholder="developer@company.com" /></label>
            <label>Project role<select value={memberForm.role} onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value })}><option value="developer">Developer</option><option value="devops">DevOps</option><option value="viewer">Viewer</option><option value="manager">Manager</option><option value="owner">Owner</option></select></label>
            <button className="button primary" type="submit" disabled={memberSaving}><UserPlus size={14} />{memberSaving ? 'Adding…' : 'Add member'}</button>
          </form> : <p className="project-permission">Only this project’s owner can add members.</p>}
          {memberError && <div className="project-error" role="alert">{memberError}</div>}
          <DataTable headers={['Member', 'Role', 'Added']} rows={membersLoading ? <tr><td colSpan="3" className="project-empty">Loading members…</td></tr> : members.length ? members.map((member) => (
            <tr key={member.id}><td><strong>{member.name || member.email}</strong><small>{member.email}</small></td><td><span className="badge">{member.role}</span></td><td>{formatCreatedAt(member.created_at)}</td></tr>
          )) : <tr><td colSpan="3" className="project-empty">No members found.</td></tr>} />
        </div>
      </section>}
    </>
  );
}
