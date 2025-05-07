import React, { useState } from 'react';
import axios from 'axios';

const RegistrationPage = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userLevel, setUserLevel] = useState('easy');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('/api/register', { email, password, userLevel });
      if (response.data.success) {
        onRegister(response.data.user);
      } else {
        setError('Registration failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="registration-container">
      <h2>Register</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select value={userLevel} onChange={(e) => setUserLevel(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <button onClick={handleRegister}>Register</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default RegistrationPage;
