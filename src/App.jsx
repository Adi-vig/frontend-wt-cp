import React from 'react';
// import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import GamePage from './components/GamePage';
// import './styles.css'


function App() {
 
  return (
    
      <Router>
      <Routes>
        <Route path="/" exact element={ <GamePage/> } />
        
      </Routes>
    </Router>

  )
}

export default App
