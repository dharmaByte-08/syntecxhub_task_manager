import { useState } from 'react';

const STATUSES = [
  { id: 'todo', label: 'To do' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
];

const PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

function fieldError(errors, name) {
  return (errors || []).find((item) => item.field === name)?.message || '';
}

export default function TaskForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    status: initial?.status || 'todo',
    priority: initial?.priority || 'medium',
    dueDate: initial?.dueDate || '',
  });
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    setErrors([]);
    try {
      await onSave(form);
    } catch (error) {
      setMessage(error.message);
      setErrors(error.errors || []);
      setPending(false);
    }
  }

  return (
    <div className="modal-back" onMouseDown={onClose}>
      <form className="modal stack" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <h2>{initial ? 'Edit task' : 'New task'}</h2>
          <button type="button" className="ghost" onClick={onClose}>Close</button>
        </div>
        {message && <p className="banner" role="alert">{message}</p>}
        <label className="field">
          Title
          <input className={fieldError(errors, 'title') ? 'invalid' : ''} value={form.title} onChange={(event) => update('title', event.target.value)} maxLength={120} required />
          {fieldError(errors, 'title') && <small>{fieldError(errors, 'title')}</small>}
        </label>
        <label className="field">
          Description
          <textarea value={form.description} onChange={(event) => update('description', event.target.value)} maxLength={2000} rows={4} />
          {fieldError(errors, 'description') && <small>{fieldError(errors, 'description')}</small>}
        </label>
        <div className="split">
          <label className="field">
            Status
            <select value={form.status} onChange={(event) => update('status', event.target.value)}>
              {STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
            </select>
          </label>
          <label className="field">
            Priority
            <select value={form.priority} onChange={(event) => update('priority', event.target.value)}>
              {PRIORITIES.map((priority) => <option key={priority.id} value={priority.id}>{priority.label}</option>)}
            </select>
          </label>
        </div>
        <label className="field">
          Due date
          <input className={fieldError(errors, 'dueDate') ? 'invalid' : ''} type="date" value={form.dueDate} onChange={(event) => update('dueDate', event.target.value)} />
          {fieldError(errors, 'dueDate') && <small>{fieldError(errors, 'dueDate')}</small>}
        </label>
        <button className="primary" type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save task'}</button>
      </form>
    </div>
  );
}
