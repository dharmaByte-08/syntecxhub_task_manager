export default function AuthLayout({ kicker, title, lede, children }) {
  return (
    <main className="auth">
      <section className="auth-hero">
        <p className="mark">Task Manager</p>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
        <p className="kicker">{kicker}</p>
      </section>
      <section className="auth-panel">{children}</section>
    </main>
  );
}
