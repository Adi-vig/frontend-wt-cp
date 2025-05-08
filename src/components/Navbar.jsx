import { Link } from 'react-router-dom';
import { FaPuzzlePiece, FaUserCircle } from 'react-icons/fa';
import { useUser } from '../context/userContext';

function Navbar() {
  const { name } = useUser();

  return (
    <nav className="navbar navbar-expand-lg navbar-light w-100">
      <div className="container-fluid px-4">
        <Link to="/game" className="navbar-brand d-flex align-items-center">
          <FaPuzzlePiece className="me-2 fs-4" />
          <strong>Sudoku TY-74</strong>
        </Link>

        <Link to="/game" className="nvabar-item me-4 text-decoration-none">
            Play Game
        </Link>

        <div className="ms-auto d-flex align-items-center">
         {name && <span className="navbar-text"> {name}</span>        }
          <Link to="/profile">
            <FaUserCircle size={28} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
