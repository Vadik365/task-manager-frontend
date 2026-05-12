import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import GoalCard from '../components/GoalCard';

const CATEGORY_COLORS = ['#534AB7', '#0F6E56', '#993C1D', '#185FA5', '#993556'];

function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchGoals = async () => {
    try {
      const res = await api.get('goals/');
      const data = res.data;
      setGoals(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
          navigate('/login');
          }
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('categories/');
      const data = res.data;
      setCategories(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
      const token = localStorage.getItem('access');
      if (!token) {
          navigate('/login');
          return;
      }
      fetchGoals();
      fetchCategories();
      const interval = setInterval(() => {
          fetchGoals();
      }, 30000);
        return() => clearInterval(interval);
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!categoryId) return alert('Please select a category');
    try {
      await api.post('goals/', { title, description, category: categoryId });
      setTitle('');
      setDescription('');
      setCategoryId('');
      setShowForm(false);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  const filteredGoals = activeCategory
    ? goals.filter((g) => g.category === activeCategory)
    : goals;

  const completedTasks = goals.reduce((acc, g) => acc + (g.completed_tasks ?? 0), 0);
  const totalTasks = goals.reduce((acc, g) => acc + (g.total_tasks ?? 0), 0);

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Task Planner</h2>
          <p>My workspace</p>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-label">Categories</div>
          <div
            className={`cat-item ${activeCategory === null ? 'active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            <div className="cat-dot" style={{ background: '#534AB7' }}></div>
            All goals
            <span className="cat-count">{goals.length}</span>
          </div>
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`cat-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <div className="cat-dot" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}></div>
              {cat.name}
              <span className="cat-count">
                {goals.filter((g) => g.category === cat.id).length}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', padding: '16px 20px' }}>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <h1>{activeCategory ? categories.find(c => c.id === activeCategory)?.name : 'All Goals'}</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="btn-secondary"
              onClick={() => setDarkMode(!darkMode)}
              style={{ padding: '7px 14px' }}
            >
              {darkMode ? '☀ Light' : '☾ Dark'}
            </button>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              + New goal
            </button>
          </div>
        </div>

        <div className="content">
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Total goals</div>
              <div className="stat-val">{goals.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Tasks completed</div>
              <div className="stat-val">{completedTasks}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total tasks</div>
              <div className="stat-val">{totalTasks}</div>
            </div>
          </div>

          {showForm && (
            <form className="add-goal-form" onSubmit={handleAddGoal}>
              <input
                className="input"
                placeholder="Goal title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="input"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select
                className="input"
                style={{ width: 'auto' }}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button className="btn-primary" type="submit" style={{ whiteSpace: 'nowrap' }}>
                Add
              </button>
            </form>
          )}

          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              categories={categories}
              colors={CATEGORY_COLORS}
              onUpdate={fetchGoals}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;