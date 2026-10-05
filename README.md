# Task Manager

Full-stack task manager for the Syntecxhub web development task.

- React frontend and Express API
- Register and sign in with JWT
- Create, read, update, and delete tasks
- Tasks are stored in MongoDB and every task route checks the signed-in user

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. The API listens on port 5001.

Demo account, when the built-in database is used: `demo@taskmanager.local` / `demo1234`.

Copy `server/.env.example` to `server/.env` to set `PORT`, `MONGO_URI`, and `JWT_SECRET`. Without `MONGO_URI`, the API uses local MongoDB on `mongodb://127.0.0.1:27017/taskmanager`, then an in-memory database if that is not running.
