import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

function fieldError(errors, name) {
  return (errors || []).find((item) => item.field === name)?.message || '';
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [demoReady, setDemoReady] = useState(false);

  useEffect(() => {
    api.demo().then((data) => setDemoReady(data.available)).catch(() => setDemoReady(false));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    setErrors([]);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setMessage(error.message);
      setErrors(error.errors || []);
    } finally {
      setPending(false);
    }
  }

  async function useDemo() {
    setPending(true);
    setMessage('');
    try {
      await login('demo@taskmanager.local', 'demo1234');
      navigate('/');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      title="Pick up where the list left off."
      lede="Sign in to see the tasks attached to your account. Nothing here is shared with another user."
      kicker="created by Dharmendra Kanzariya"
    >
      <form onSubmit={submit} className="stack">
        <h2>Sign in</h2>
        {message && <p className="banner" role="alert">{message}</p>}
        <label className="field">
          Email
          <input className={fieldError(errors, 'email') ? 'invalid' : ''} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          {fieldError(errors, 'email') && <small>{fieldError(errors, 'email')}</small>}
        </label>
        <label className="field">
          Password
          <input className={fieldError(errors, 'password') ? 'invalid' : ''} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {fieldError(errors, 'password') && <small>{fieldError(errors, 'password')}</small>}
        </label>
        <button className="primary" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
      </form>
      {demoReady && (
        <div className="demo">
          <p>A demo desk is ready: Avery Cole, demo@taskmanager.local</p>
          <button type="button" onClick={useDemo} disabled={pending}>Continue as Avery</button>
        </div>
      )}
      <p className="switch">New here? <Link to="/register">Create an account</Link></p>
    </AuthLayout>
  );
}
