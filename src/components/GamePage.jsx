// components/GamePage.jsx
import React, { useState, useEffect } from "react";
import Cell from "./../classes/Cell";
import "./../styles/index.css";
import { useUser } from '../context/userContext';
import { useNavigate } from "react-router-dom";

import API from "./../api/api"; // Adjust the import based on your project structure

// Clone function to preserve Cell class behavior
function cloneCells(cells) {
  return cells.map(cell => {
    const newCell = new Cell(cell.id, cell.value);
    newCell.prefilled = cell.prefilled;
    newCell.incorrect = cell.incorrect;
    return newCell;
  });
}

// Square Component
function Square({ squares, handleChange }) {
  const doChange = (e) => {
    handleChange(e.target.value, e.target.id);
  };

  let className = squares.prefilled
    ? "square square-grey"
    : "square square-white";

  if (squares.incorrect) {
    className = "square square-red";
  }

  return (
    <td>
      <div className={className}>
        <input
          inputMode="numeric"
          size="2"
          maxLength="1"
          type="text"
          autoComplete="off"
          onChange={doChange}
          value={squares.value || ""}
          id={squares.id}
          disabled={squares.prefilled}
        />
      </div>
    </td>
  );
}

// Neighbors Component
function Neighbors({ squares, onChange }) {
  return (
    <table>
      <tbody>
        {[0, 1, 2].map((row) => (
          <tr key={row}>
            {[0, 1, 2].map((col) => {
              const idx = row * 3 + col;
              return (
                <Square
                  key={idx}
                  squares={squares[idx]}
                  handleChange={onChange}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Column Component
function Column({ squares, handleChange }) {
  return (
    <div className="column">
      {[0, 9, 18].map((i) => (
        <Neighbors
          key={i}
          squares={squares.slice(i, i + 9)}
          onChange={handleChange}
        />
      ))}
    </div>
  );
}

// Helper functions for Sudoku generation
function initializeEmptyList(squares) {
  for (let i = 0; i < 81; i++) {
    squares[i] = new Cell(i, null);
  }
}

function isSafeCell(squares, index, target) {
  return (
    !usedInCol(squares, index, target) &&
    !usedInSquare(squares, index, target) &&
    !usedInRow(squares, index, target)
  );
} 

function usedInRow(squares, index, target) {
  const rowStart = Math.floor(index / 9) * 9;
  for (let i = 0; i < 9; i++) {
    if (squares[rowStart + i].value === target && rowStart + i !== index) {
      return true;
    }
  }
  return false;
}

function usedInCol(squares, index, target) {
  const col = index % 9;
  for (let i = col; i < 81; i += 9) {
    if (squares[i].value === target && i !== index) {
      return true;
    }
  }
  return false;
}

function usedInSquare(squares, index, target) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const i = (startRow + r) * 9 + (startCol + c);
      if (squares[i].value === target && i !== index) {
        return true;
      }
    }
  }
  return false;
}

function findUnassignedLocation(squares) {
  return squares.findIndex((cell) => cell.value == null);
}

function backTracking(squares) {
  const index = findUnassignedLocation(squares);
  if (index < 0) return true;

  for (let i = 1; i < 10; i++) {
    if (isSafeCell(squares, index, i)) {
      squares[index].value = i;
      if (backTracking(squares)) return true;
      squares[index].value = null;
    }
  }
  return false;
}
function removeSquares(squares, difficulty) {
  let clues;
  if (difficulty === "easy") clues = 45;
  else if (difficulty === "medium") clues = 35;
  else clues = 28; // hard

  // console.log("Clues: ", clues);
  // console.log("Difficulty: ", difficulty);


  const positions = [...Array(81).keys()];
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  for (let i = 0; i < 81; i++) {
    const idx = positions[i];
    if (clues > 0) {
      squares[idx].prefilled = true;
      clues--;
    } else {
      squares[idx].value = null;
      squares[idx].prefilled = false;
    }
  }

  return [squares, 81 - clues];
}

function fillBox(squares, boxStartIndex) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Shuffle numbers
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  let idx = 0;
  const rowStart = Math.floor(boxStartIndex / 9);
  const colStart = boxStartIndex % 9;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const row = rowStart + r;
      const col = colStart + c;
      const i = row * 9 + col;
      squares[i].value = numbers[idx++];
    }
  }
}



// GamePage Component
function GamePage() {

  const { email } = useUser(); // Access the email from context
  const navigate = useNavigate(); // Initialize navigate

  // Redirect to login page if email is null
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);


  const [history, setHistory] = useState([]);
  const [stepNumber, setStepNumber] = useState(0);
  const [filledSquares, setFilledSquares] = useState(81);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // const [uid, setUid] = useState('');
 



  const [theme, setTheme] = useState("light");

    useEffect(() => {
      document.body.className = `theme-${theme}`;
    }, [theme]);

    const handleThemeChange = (e) => {
      setTheme(e.target.value);
    };

  useEffect(() => {
    startNewGame();
  }, []);
  
  useEffect(() => {
    if (startTime === null) return;
  
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  
    return () => clearInterval(interval);
  }, [startTime]);


  useEffect(() => {
    const generateBoard = () => {
        const squares = Array(81).fill(null);
        initializeEmptyList(squares);
      
        if (!backTracking(squares)) {
          console.error("Failed to generate solvable Sudoku board");
          return generateBoard(); // fallback in rare cases
        }
      
        return squares;
      };
    

    const initial = generateBoard();
    const [board, filled] = removeSquares(cloneCells(initial));
    setHistory([{ squares: board }]);
    setFilledSquares(filled);
  }, []);



  const startNewGame = () => {
    const generateBoard = () => {
      const squares = Array(81).fill(null);
      initializeEmptyList(squares);

      setStartTime(Date.now());
      setElapsedTime(0);

  
      // // Pre-fill diagonal boxes for better solvability
      fillBox(squares, 0);   // Top-left box
      fillBox(squares, 30);  // Center box (36 causes col misalignment)
      fillBox(squares, 60);  // Bottom-right box

      if (!backTracking(squares)) {
        console.error("Failed to generate solvable Sudoku board");
        return generateBoard(); // fallback
      }
  
      return squares;
    };
  
    const initial = generateBoard();
    const [board, filled] = removeSquares(cloneCells(initial), difficulty);
    setHistory([{ squares: board }]);
    setStepNumber(0);
    setWrongAttempts(0);
    setFilledSquares(filled);
  };
  

  const handleChange = (value, id) => {
    const newHistory = [...history.slice(0, stepNumber + 1)];
    const current = cloneCells(newHistory[newHistory.length - 1].squares);
    const squares = current;

    const numericVal = Number(value);
    squares[id].value = isNaN(numericVal) || numericVal === 0 ? null : numericVal;

    if (squares[id].value && !isSafeCell(squares, Number(id), squares[id].value)) {
      squares[id].incorrect = true;
      const attempts = wrongAttempts + 1;
      setWrongAttempts(attempts);
      if (attempts >= 3) {
        alert("3 wrong attempts! Game over. Starting a new game...");
        window.location.reload();
      }
    } else {
      squares[id].incorrect = false;
    }

    setHistory([...newHistory, { squares }]);
    setStepNumber(newHistory.length);
    setFilledSquares((prev) =>
      squares[id].value ? prev + 1 : Math.max(0, prev - 1)
    );
  };


  const handleSubmit = () => {
    // console.log(email);
    // set dummy email for testing

    // setEmail('a@aaaa');
    if (!email) {
      alert("Please log in to submit your score.");
      return;
    }
  
    // Use axios to submit the score
    API.post('/scores', {
      email: email,
      difficulty: difficulty,
      time_taken: elapsedTime,
    })
      .then(res => {
        alert("Score submitted successfully!");
        console.log("Score saved:", res.data);
      })
      .catch(err => {
        console.error("Failed to save score", err);
        alert("Failed to submit score.");
      });
  };
  

  const undo = () => {
    if (stepNumber > 0) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setStepNumber(stepNumber - 1);
      setFilledSquares(filledSquares - 1);
    }
  };

  const solve = () => {
    // Ask for confirmation before solving
    if (!window.confirm("Are you sure you want to solve the Sudoku?")) {
      return;
    }
  
    const current = cloneCells(history[stepNumber].squares);
    if (backTracking(current)) {
      setHistory([...history, { squares: current }]);
      setStepNumber(history.length);
      setFilledSquares(81);

    }
  };
  

  if (history.length === 0) return null;

  const currentSquares = history[stepNumber].squares;

  return (
    <div className="game-container">
      <h1>Sudoku</h1>
      <h1 style={{ fontSize: '1.2rem' }}>⏱ Time Elapsed: {elapsedTime} seconds</h1>


      <div>
        <Column squares={currentSquares.slice(0, 27)} handleChange={handleChange} />
        <Column squares={currentSquares.slice(27, 54)} handleChange={handleChange} />
        <Column squares={currentSquares.slice(54, 81)} handleChange={handleChange} />
      </div>
      <div className="difficulty-select-wrapper d-flex justify-content-center align-items-center gap-3 mb-3">
        <div className="difficulty-select">
          <label htmlFor="difficulty" className="form-label mb-0 fw-semibold">Difficulty:</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="form-select form-select-sm w-auto"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      

      <div className="button-container">
        <button onClick={undo}>Undo</button>
        <button onClick={solve}>Solve</button>
        <button onClick={startNewGame}>New Game</button>

        {/* Show Submit button only when puzzle is solved and correct */}
        {filledSquares === 81 &&
          history[stepNumber].squares.every(cell => cell.value !== null && !cell.incorrect) && (
            <button onClick={handleSubmit}>Submit</button>
          )}

      </div>







      <div className="theme-selector-wrapper d-flex justify-content-center align-items-center gap-3 mb-3">
        <div className="theme-selector">
          <label htmlFor="theme" className="form-label mb-0 fw-semibold">Theme:</label>
          <select
            id="theme"
            value={theme}
            onChange={handleThemeChange}
            className="form-select form-select-sm w-auto"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="dracula">Dracula</option>
            <option value="bash">Bash</option>
          </select>
        </div>
      </div>



    </div>
  );
}

export default GamePage;
