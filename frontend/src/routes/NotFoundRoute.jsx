import { Link } from 'react-router-dom';

export default function NotFoundRoute() {
  return (
    <main className="login-screen">
      <section className="login-card not-found-card">
        <div className="eyebrow">404 / PAGE NOT FOUND</div>
        <h1>This page isn’t here</h1>
        <p className="login-subtitle">The address may be incorrect or the page may have moved.</p>
        <Link className="login-submit not-found-link" to="/">Return to EDOP</Link>
      </section>
    </main>
  );
}
