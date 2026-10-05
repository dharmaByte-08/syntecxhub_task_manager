import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

function fieldError(errors, name) {
  return (errors || []).find((item) => item.field === name)?.message || '';
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (form.password !== form.confirm) {
      setMessage('Check the highlighted fields.');
      setErrors([{ field: 'confirm', message: 'Passwords do not match.' }]);
      return;
    }
    setPending(true);
    setMessage('');
    setErrors([]);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/');
    } catch (error) {
      setMessage(error.message);
      setErrors(error.errors || []);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      title="Make a desk that is only yours."
      lede="Your name, email, and a password. Tasks you add stay on this account."
      kicker="created by Dharmendra Kanzariya"
    >
      <form onSubmit={submit} className="stack">
        <h2>Create account</h2>
        {message && <p className="banner" role="alert">{message}</p>}
        <label className="field">
          Name
          <input className={fieldError(errors, 'name') ? 'invalid' : ''} value={form.name} onChange={(event) => set('name', event.target.value)} maxLength={60} required />
          {fieldError(errors, 'name') && <small>{fieldError(errors, 'name')}</small>}
        </label>
        <label className="field">
          Email
          <input className={fieldError(errors, 'email') ? 'invalid' : ''} type="email" autoComplete="email" value={form.email} onChange={(event) => set('email', event.target.value)} required />
          {fieldError(errors, 'email') && <small>{fieldError(errors, 'email')}</small>}
        </label>
        <label className="field">
          Password
          <input className={fieldError(errors, 'password') ? 'invalid' : ''} type="password" autoComplete="new-password" value={form.password} onChange={(event) => set('password', event.target.value)} minLength={6} required />
          {fieldError(errors, 'password') && <small>{fieldError(errors, 'password')}</small>}
        </label>
        <label className="field">
          Confirm password
          <input className={fieldError(errors, 'confirm') ? 'invalid' : ''} type="password" autoComplete="new-password" value={form.confirm} onChange={(event) => set('confirm', event.target.value)} minLength={6} required />
          {fieldError(errors, 'confirm') && <small>{fieldError(errors, 'confirm')}</small>}
        </label>
        <button className="primary" type="submit" disabled={pending}>{pending ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="switch">Already registered? <Link to="/login">Sign in</Link></p>
    </AuthLayout>
  );
}
