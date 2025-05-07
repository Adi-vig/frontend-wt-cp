import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfileComponent = ({ user, onLogout }) => {
  const [games, setGames] = useState([]);
  const [highestScores, setHighestScores] = useState({ easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    const fetchUserGames = async () => {
      try {
        const response = await axios.get(`/api/games/${user.uid}`);
        setGames(response.data.games);

        const scoreResponse = await axios.get(`/api/scores/${user.uid}`);
        const scores = scoreResponse.data;
        const highest = scores.reduce(
          (acc, { difficulty, time_taken }) => {
            if (time_taken < acc[difficulty] || acc[difficulty] === 0) {
              acc[difficulty] = time_taken;
            }
            return acc;
          },
          { easy: 0, medium: 0, hard: 0 }
        );
        setHighestScores(highest);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUserGames();
  }, [user]);

  return (
    <div className="user-profile-container">
      <h2>Welcome, {user.email}</h2>
      <button onClick={onLogout}>Logout</button>
      <div className="games-list">
        <h3>Your Games</h3>
        <ul>
          {games.map((game, index) => (
            <li key={index}>
              Game {index + 1}: {game.difficulty} - {game.time_taken} seconds
            </li>
          ))}
        </ul>
      </div>
      <div className="highest-scores">
        <h3>Highest Scores</h3>
        <ul>
          <li>Easy: {highestScores.easy}s</li>
          <li>Medium: {highestScores.medium}s</li>
          <li>Hard: {highestScores.hard}s</li>
        </ul>
      </div>
    </div>
  );
};

export default UserProfileComponent;
