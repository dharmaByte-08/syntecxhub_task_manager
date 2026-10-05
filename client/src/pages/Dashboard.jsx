import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To do' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
];

const STATUS_LABEL = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' };
const RANK = { todo: 0, 'in-progress': 1, done: 2 };

function today() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function prettyDate(value) {
  if (!value) return 'No due date';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState('');
  const [editor, setEditor] = useState(null);
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const data = await api.tasks();
    setTasks(data.tasks);
  }

  useEffect(() => {
    let active = true;
    api.tasks()
      .then((data) => {
        if (active) setTasks(data.tasks);
      })
      .catch((error) => {
        if (active) setBanner(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const counts = {
    all: tasks.length,
    todo: tasks.filter((task) => task.status === 'todo').length,
    'in-progress': tasks.filter((task) => task.status === 'in-progress').length,
    done: tasks.filter((task) => task.status === 'done').length,
  };

  const needle = query.trim().toLowerCase();
  const visible = tasks
    .filter((task) => (filter === 'all' || task.status === filter))
    .filter((task) => !needle || `${task.title} ${task.description}`.toLowerCase().includes(needle))
    .slice()
    .sort((a, b) => RANK[a.status] - RANK[b.status] || (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99'));

  async function save(form) {
    if (editor.task) await api.updateTask(editor.task._id, form);
    else await api.createTask(form);
    await load();
    setEditor(null);
  }

  async function changeStatus(task, status) {
    setBanner('');
    try {
      await api.updateTask(task._id, { status });
      await load();
    } catch (error) {
      setBanner(error.message);
    }
  }

  async function remove() {
    if (!pending || deleting) return;
    setBanner('');
    setDeleting(true);
    try {
      await api.deleteTask(pending._id);
      setPending(null);
      await load();
    } catch (error) {
      setBanner(error.message);
    } finally {
      setDeleting(false);
    }
  }

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="desk">
      <header className="topbar">
        <p className="mark">Task Manager</p>
        <label className="search">
          <span className="sr">Search tasks</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" />
        </label>
        <div className="who">
          <span className="avatar">{user?.name?.[0]?.toUpperCase()}</span>
          <span>{user?.name}</span>
          <button type="button" className="ghost" onClick={logout}>Sign out</button>
        </div>
      </header>

      <main className="board">
        <div className="board-head">
          <div>
            <h1>Hello, {firstName}.</h1>
            <p>{counts.done} of {counts.all} finished. {counts.todo} still waiting.</p>
          </div>
          <button type="button" className="primary" onClick={() => setEditor({ task: null })}>New task</button>
        </div>

        <div className="stats">
          <article><strong>{counts.todo}</strong><span>To do</span></article>
          <article><strong>{counts['in-progress']}</strong><span>In progress</span></article>
          <article><strong>{counts.done}</strong><span>Done</span></article>
        </div>

        <div className="filters" role="tablist">
          {FILTERS.map((item) => (
            <button key={item.id} type="button" className={filter === item.id ? 'chip on' : 'chip'} onClick={() => setFilter(item.id)}>
              {item.label} <em>{counts[item.id]}</em>
            </button>
          ))}
        </div>

        {banner && <p className="banner" role="alert">{banner}</p>}

        {loading ? <p className="empty">Loading tasks…</p> : null}
        {!loading && visible.length === 0 ? (
          <p className="empty">{tasks.length === 0 ? 'Nothing on the list yet. Add a task when you are ready.' : 'No tasks match this view.'}</p>
        ) : null}

        <ul className="tasks">
          {visible.map((task) => {
            const overdue = task.dueDate && task.dueDate < today() && task.status !== 'done';
            return (
              <li key={task._id} className={`task ${task.status}`}>
                <div className="task-main">
                  <h2>{task.title}</h2>
                  {task.description && <p>{task.description}</p>}
                  <div className="meta">
                    <span className={`pill ${task.priority}`}>{task.priority}</span>
                    <span className={overdue ? 'due late' : 'due'}>{prettyDate(task.dueDate)}{overdue ? ' · overdue' : ''}</span>
                  </div>
                </div>
                <div className="task-actions">
                  <label className="sr" htmlFor={`status-${task._id}`}>Status for {task.title}</label>
                  <select id={`status-${task._id}`} value={task.status} onChange={(event) => changeStatus(task, event.target.value)}>
                    {FILTERS.filter((item) => item.id !== 'all').map((item) => (
                      <option key={item.id} value={item.id}>{STATUS_LABEL[item.id]}</option>
                    ))}
                  </select>
                  <button type="button" className="ghost" onClick={() => setEditor({ task })}>Edit</button>
                  <button type="button" className="ghost" onClick={() => setPending(task)}>Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
      <footer className="foot">created by Dharmendra Kanzariya</footer>
      {editor && <TaskForm initial={editor.task} onClose={() => setEditor(null)} onSave={save} />}
      {pending && (
        <div className="modal-back" onMouseDown={() => { if (!deleting) setPending(null); }}>
          <div className="modal confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="confirm-title">Are you sure delete the record</h2>
            <div className="confirm-actions">
              <button type="button" className="ghost" onClick={() => setPending(null)} disabled={deleting}>Cancel</button>
              <button type="button" className="danger" onClick={remove} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
