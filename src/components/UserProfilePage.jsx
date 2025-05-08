import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useUser } from '../context/userContext';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
// Register necessary components from Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const UserProfilePage = () => {
  const { email, name } = useUser();
  const navigate = useNavigate(); // Initialize navigate

  // Redirect to login page if email is null
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);



  const [games, setGames] = useState([]);
  const [highestScores, setHighestScores] = useState({ easy: null, medium: null, hard: null });

  const [lvl, setLvl] = useState('');

  useEffect(() => {
    const fetchUserScores = async () => {
      try {
        const response = await API.get(`/scores/${email}`);
        const scores = response.data;
        console.log('Fetched scores:', scores); // Debugging line
        setGames(scores);

        const bestTimes = { easy: null, medium: null, hard: null };
        scores.forEach(({ difficulty, time_taken }) => {
          if (bestTimes[difficulty] === null || time_taken < bestTimes[difficulty]) {
            bestTimes[difficulty] = time_taken;
          }
        });

        setHighestScores(bestTimes);
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };


    const fetchUserLevels = async () => {
      try {
        const response = await API.get(`/level/${email}`);
        const level = response.data.level;
        console.log('Fetched levels:', level); // Debugging line
        // setGames(levels);
        setLvl(level);
      } catch (error) {
        console.error('Error fetching levels:', error);
      }
    }

    fetchUserScores();
    fetchUserLevels(); // Fetch user levels when the component mounts
  }, [email]);

  // Utility for Bootstrap badge color based on difficulty
  const getBadgeColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Line chart data preparation
  const getChartData = (difficulty) => {
    const filteredGames = games.filter((game) => game.difficulty === difficulty);
    const labels = filteredGames.map((game, index) => `Game ${index + 1}`);
    const data = filteredGames.map((game) => {
      let score = 0;
      if (difficulty === 'easy') score = 100 / game.time_taken;
      if (difficulty === 'medium') score = 1000 / game.time_taken;
      if (difficulty === 'hard') score = 10000 / game.time_taken;
      return score;
    });

    return {
      labels,
      datasets: [
        {
          label: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Progress`,
          data,
          fill: false,
          borderColor: getBadgeColor(difficulty),
          tension: 0.1,
        },
      ],
    };
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-5">
        <h1 className="fw-bold">Welcome, {name}</h1>
        {/* <h1 style={{ fontSize:"1.5rem"}}> Your Level:  {lvl} </h1> */}

        <h1
          style={{
            fontSize: "1.5rem",
            color: "#4CAF50", // Green color for a positive vibe
            fontWeight: "bold", // Bold text for emphasis
            textAlign: "center", // Center the text
            backgroundColor: "#f1f1f1", // Light background color for contrast
            borderRadius: "10px", // Rounded corners for a modern look
            padding: "10px 20px", // Padding for better spacing
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Light shadow for depth
            margin: "20px 0", // Spacing above and below
            width: "fit-content", // Fit content to the text
            marginLeft: "auto", // Center the element horizontally
            marginRight: "auto", // Center the element horizontally
          }}
        >
          Your Level: {lvl}
        </h1>
      </div>

      {/* Games Table */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title mb-3">Your Game History</h4>
          {games.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Difficulty</th>
                    <th>Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <span className={`badge bg-${getBadgeColor(game.difficulty)}`}>
                          {game.difficulty}
                        </span>
                      </td>
                      <td>{game.time_taken}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mb-0">No games found.</p>
          )}
        </div>
      </div>

      {/* Best Scores Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="card-title mb-3">Best Times by Difficulty</h4>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Difficulty</th>
                  <th>Best Time</th>
                </tr>
              </thead>
              <tbody>
                {['easy', 'medium', 'hard'].map((level) => (
                  <tr key={level}>
                    <td>
                      <span className={`badge bg-${getBadgeColor(level)}`}>{level}</span>
                    </td>
                    <td>{highestScores[level] !== null ? `${highestScores[level]}s` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Line Charts */}
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h4 className="card-title mb-3">Score Progress by Difficulty</h4>
          <div className="row">
            <div className="col-md-4">
              <h5 style={{ color:'white', fontWeight:'bolder', padding:'1rem ', backgroundColor:'green', borderRadius:'1rem' }} >Easy</h5>
              <Line data={getChartData('easy')} />
            </div>
            <div className="col-md-4">
              <h5 style={{ color:'white', fontWeight:'bolder', padding:'1rem ', backgroundColor:'orange', borderRadius:'1rem' }} >Medium</h5>
              <Line data={getChartData('medium')} />
            </div>
            <div className="col-md-4">
              <h5 style={{ color:'white', fontWeight:'bolder', padding:'1rem ', backgroundColor:'red', borderRadius:'1rem' }} >Hard</h5>
              <Line data={getChartData('hard')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
