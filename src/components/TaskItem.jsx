import api from '../api/axios';

function TaskItem({ task, onUpdate }) {
  const handleToggle = async () => {
    try {
      await api.patch(`tasks/${task.id}/`, { completed: !task.completed });
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`tasks/${task.id}/`);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="task-row">
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={handleToggle}
      />
      <span className={`task-label ${task.completed ? 'done' : ''}`}>
        {task.title}
      </span>
      <button className="btn-danger" onClick={handleDelete}>
        Delete
      </button>
    </div>
  );
}

export default TaskItem;