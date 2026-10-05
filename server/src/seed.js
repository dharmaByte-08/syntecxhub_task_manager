import User from './models/User.js';
import Task from './models/Task.js';

function day(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

export async function seedDemo(memory) {
  if (!memory) return;
  const email = 'demo@taskmanager.local';
  const existing = await User.findOne({ email });
  if (existing) return;

  const user = await User.create({
    name: 'Avery Cole',
    email,
    password: 'demo1234',
  });

  await Task.insertMany([
    {
      user: user._id,
      title: 'Write the weekly status note',
      description: 'Cover what shipped, what slipped, and the one decision still open.',
      status: 'in-progress',
      priority: 'high',
      dueDate: day(1),
    },
    {
      user: user._id,
      title: 'Clean up the onboarding checklist',
      description: 'Drop the steps nobody follows and add the access request link.',
      status: 'todo',
      priority: 'medium',
      dueDate: day(3),
    },
    {
      user: user._id,
      title: 'Review open pull requests',
      description: 'Leave notes on the two oldest reviews before standup.',
      status: 'todo',
      priority: 'low',
      dueDate: day(0),
    },
    {
      user: user._id,
      title: 'Send the vendor the signed brief',
      description: 'The brief is in the shared drive. They are waiting on the signature page.',
      status: 'done',
      priority: 'medium',
      dueDate: day(-2),
    },
  ]);
}
