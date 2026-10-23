import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Eye, Hexagon, GitBranch, LockKeyhole, UserRound } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginPage({ onLogin, onGoogleLogin, onGithubLogin, onGithubCallback }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleButtonRef = useRef(null);
  const googleLoginRef = useRef(onGoogleLogin);
  const githubCallbackRef = useRef(onGithubCallback);
  const githubCallbackStartedRef = useRef(false);

  googleLoginRef.current = onGoogleLogin;
  githubCallbackRef.current = onGithubCallback;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('github_ticket');
    const providerError = params.get('github_error');
    if (!ticket && !providerError) return;

    window.history.replaceState({}, document.title, window.location.pathname);
    if (providerError) {
      setError(providerError);
      return;
    }
    if (githubCallbackStartedRef.current) return;
    if (!ticket) {
      setError('GitHub sign-in did not return a login ticket. Please try again.');
      return;
    }

    githubCallbackStartedRef.current = true;
    setIsSubmitting(true);
    githubCallbackRef.current(ticket)
      .catch((callbackError) => setError(callbackError.message || 'Unable to sign in with GitHub.'))
      .finally(() => setIsSubmitting(false));
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return undefined;
    let cancelled = false;
    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          setError('');
          setIsSubmitting(true);
          try {
            await googleLoginRef.current(credential);
          } catch (loginError) {
            setError(loginError.message || 'Unable to sign in with Google.');
          } finally {
            setIsSubmitting(false);
          }
        },
      });
 window.google.accounts.id.renderButton(googleButtonRef.current, {
  type: 'standard',
  size: 'large',
  theme: 'outline',
  text: 'continue_with',
  shape: 'rectangular',
  logo_alignment: 'left',
  width: 320,
});
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      let script = document.querySelector('script[data-google-identity]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.googleIdentity = 'true';
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderGoogleButton);
      return () => {
        cancelled = true;
        script.removeEventListener('load', renderGoogleButton);
      };
    }
    return () => { cancelled = true; };
  }, []);

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

  const startGithubSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await onGithubLogin();
    } catch (loginError) {
      setError(loginError.message || 'Unable to start GitHub sign-in.');
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
          {GOOGLE_CLIENT_ID ? <div className={`google-login ${isSubmitting ? 'google-login-disabled' : ''}`} ref={googleButtonRef} aria-label="Continue with Google" /> : <button className="google-login-unconfigured" type="button" disabled title="Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in">Continue with Google <small>Not configured</small></button>}
          {isSubmitting && <p className="google-login-status" role="status">Signing in…</p>}
          <button className="github-login" type="button" onClick={startGithubSignIn} disabled={isSubmitting}><GitBranch size={17} /> Continue with GitHub</button>
          <div className="login-footer"></div>
        </section>
        <div className="login-caption"><span>OBSERVE</span><i /> <span>DEPLOY</span><i /> <span>PROVISION</span></div>
      </div>
      <footer className="login-bottom"><span>© 2026 EDOP Platform</span><span><a>Privacy</a><a>Terms</a><a>Help center</a></span></footer>
    </main>
  );
}
