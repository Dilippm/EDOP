import { ArrowRight, Eye, Hexagon, GitBranch, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';

export default function LoginPage({ onLogin }) {
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
          <div className="sample-login-note"><ShieldCheck size={16} /><span><strong>UI preview mode</strong><small>This form is a visual prototype. No credentials are checked.</small></span></div>
          <form onSubmit={(event) => { event.preventDefault(); onLogin(); }}>
            <label htmlFor="email">Work email</label>
            <div className="login-input"><UserRound size={16} /><input id="email" type="email" placeholder="you@company.com" required defaultValue="operator@example.com" /></div>
            <div className="password-label"><label htmlFor="password">Password</label><button type="button">Forgot password?</button></div>
            <div className="login-input"><LockKeyhole size={16} /><input id="password" type="password" placeholder="Enter your password" required defaultValue="preview-password" /><Eye size={16} /></div>
            <label className="remember"><input type="checkbox" defaultChecked /> Keep me signed in</label>
            <button className="login-submit" type="submit">Sign in to workspace <ArrowRight size={16} /></button>
          </form>
          <div className="login-divider"><span />or continue with<span /></div>
          <button className="github-login" type="button" onClick={onLogin}><GitBranch size={17} /> Continue with GitHub <small>Preview</small></button>
          <div className="login-footer">Need access? <button type="button">Contact your platform administrator</button></div>
        </section>
        <div className="login-caption"><span>OBSERVE</span><i /> <span>DEPLOY</span><i /> <span>PROVISION</span></div>
      </div>
      <footer className="login-bottom"><span>© 2026 EDOP Platform</span><span><a>Privacy</a><a>Terms</a><a>Help center</a></span></footer>
    </main>
  );
}
