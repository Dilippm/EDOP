import { useState } from 'react';
import { ArrowRight, Eye, Hexagon, GitBranch, LockKeyhole, UserRound } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await onLogin(form.get('identifier'), form.get('password'));
    } catch (submitError) {
      setError(submitError.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-screen">
      <div className="login-top">
        <a className="login-brand"><span className="login-brand-mark"><Hexagon size={30} /><span>◆</span></span><span>EDOP<small>ENTERPRISE DEVELOPER OBSERVABILITY PLATFORM</small></span></a>
        <span className="login-secure"><LockKeyhole size={14} /> Secure workspace access</span>
      </div>
      <div className="login-body">
        <section className="login-card">
          <div className="login-card-mark"><Hexagon size={29} /><span>◆</span></div>
          <div className="eyebrow">WELCOME BACK</div>
          <h1>Sign in to EDOP</h1>
          <p className="login-subtitle">Access your deployment and observability workspace.</p>
          <form onSubmit={submit}>
            <label htmlFor="identifier">Email or username</label>
            <div className="login-input"><UserRound size={16} /><input id="identifier" name="identifier" type="text" autoComplete="username" placeholder="you@company.com or username" required /></div>
            <div className="password-label"><label htmlFor="password">Password</label><button type="button">Forgot password?</button></div>
            <div className="login-input"><LockKeyhole size={16} /><input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required /><Eye size={16} /></div>
            {error && <p role="alert" className="login-error">{error}</p>}
            <button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in to workspace'} <ArrowRight size={16} /></button>
          </form>
          <div className="login-divider"><span />or continue with<span /></div>
          <button className="github-login" type="button" disabled title="GitHub sign-in is not configured yet"><GitBranch size={17} /> Continue with GitHub <small>Coming soon</small></button>
          <div className="login-footer">Need access? <button type="button">Contact your platform administrator</button></div>
        </section>
        <div className="login-caption"><span>OBSERVE</span><i /> <span>DEPLOY</span><i /> <span>PROVISION</span></div>
      </div>
      <footer className="login-bottom"><span>© 2026 EDOP Platform</span><span><a>Privacy</a><a>Terms</a><a>Help center</a></span></footer>
    </main>
  );
}
