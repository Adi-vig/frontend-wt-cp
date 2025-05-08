import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import API from '../api/api'; // Adjust according to your project structure
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage = () => {
  const { setEmail, setName } = useUser(); // Access the setEmail function from the context
  const [email, setEmailState] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  
    API.post('auth/login', { email, password })
      .then(() => {
        setEmail(email); // Save email in context
  
        // Fetch user details using the email
        API.get(`/auth/user/${email}`)
          .then(res => {
            console.log('User info:', res.data);
            setName(res.data.name); // Set the name in context
            navigate('/game');
          })
          .catch(err => {
            console.error('Failed to fetch user info:', err);
            alert('Could not fetch user profile');
          });
      })
      .catch(err => {
        console.error('Login error:', err.response?.data || err.message);
        alert('Invalid credentials.');
      });
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="card" style={{ width: '30rem' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmailState(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
