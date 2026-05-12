import { useState } from 'react';
import api from '../api/axios';
import TaskItem from './TaskItem';

function GoalCard({ goal, categories, colors, onUpdate }) {
  const [tasks, setTasks] = useState([]);
  const [showTasks, setShowTasks] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  const category = categories.find((c) => c.id === goal.category);
  const colorIndex = categories.indexOf(category);
  const color = colors[colorIndex % colors.length] ?? '#534AB7';

  const bgMap = {
    '#534AB7': '#EEEDFE',
    '#0F6E56': '#E1F5EE',
    '#993C1D': '#FAECE7',
    '#185FA5': '#E6F1FB',
    '#993556': '#FBEAF0',
  };
  const bgColor = bgMap[color] ?? '#EEEDFE';

  const fetchTasks = async () => {
    try {
      const res = await api.get(`tasks/?goal=${goal.id}`);
      const data = res.data;
      setTasks(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTasks = () => {
    if (!showTasks) fetchTasks();
    setShowTasks(!showTasks);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      await api.post('tasks/', { title: taskTitle, goal: goal.id });
      setTaskTitle('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async () => {
    try {
      await api.delete(`goals/${goal.id}/`);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="goal-card">
      <div className="goal-header">
        <div className="goal-icon" style={{ background: bgColor, color }}>
          {goal.title.charAt(0).toUpperCase()}
        </div>
        <div className="goal-info">
          <div className="goal-title">{goal.title}</div>
          {goal.description && (
            <div className="goal-desc">{goal.description}</div>
          )}
          <div className="goal-desc">{category?.name ?? ''}</div>
        </div>

        {showTasks && total > 0 && (
          <div className="progress-wrap">
            <div className="progress-bar-bg">
              <div className="progress-bar" style={{ width: `${progress}%`, background: color }}></div>
            </div>
            <div className="progress-pct">{completed} / {total}</div>
          </div>
        )}

        <div className="goal-actions">
          <button className="btn-secondary" onClick={toggleTasks}>
            {showTasks ? 'Hide' : 'Tasks'}
          </button>
          <button className="btn-danger" onClick={handleDeleteGoal}>
            Delete
          </button>
        </div>
      </div>

      {showTasks && (
        <div className="tasks">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onUpdate={fetchTasks} />
          ))}
          <form className="task-add-form" onSubmit={handleAddTask}>
            <input
              className="input"
              placeholder="New task..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <button className="btn-primary" type="submit" style={{ whiteSpace: 'nowrap' }}>
              + Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default GoalCard;