import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import GamePage from './components/GamePage';
import RegistrationPage from './components/RegistrationPage';
import UserProfilePage from './components/UserProfilePage';
import { UserProvider } from './context/userContext';
import Navbar from './components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
 
  return (
    <UserProvider>
    <Router>
 

    <Navbar />
    <div className="content-wrapper">

      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path ="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        {/* Pass the email prop to GamePage */}
        <Route path="/game" element={<GamePage />} />
        <Route path="/profile" element={<UserProfilePage/>} />
      </Routes>
    </div>
    </Router>
    </UserProvider>
  );
}

export default App;
