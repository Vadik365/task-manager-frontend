import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/register/', {
        username,
        password,
      });
      navigate('/login');
    } catch (err) {
      setError('Registration error. Try a different username.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create account</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleRegister}>
          <input
            className="input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn-primary" type="submit" style={{ width: '100%', padding: '10px' }}>
            Register
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;