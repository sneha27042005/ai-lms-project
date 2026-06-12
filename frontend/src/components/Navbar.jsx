import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold flex items-center gap-2">
          🎓 AI LMS
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          <Link to="/" className="text-white hover:text-gray-200 transition">Home</Link>
          <Link to="/courses" className="text-white hover:text-gray-200 transition">Courses</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="text-white hover:text-gray-200 transition">Dashboard</Link>
              <Link to="/chatbot" className="text-white hover:text-gray-200 transition">🤖 AI Tutor</Link>
              <Link to="/quizzes" className="text-white hover:text-gray-200 transition">📝 Quizzes</Link>
              <Link to="/leaderboard" className="text-white hover:text-gray-200 transition">🏆 Leaderboard</Link>
              <Link to="/quiz-history" className="text-white hover:text-gray-200 transition">📊 History</Link>
              <Link to="/my-bookmarks" className="text-white hover:text-gray-200 transition">🔖 Bookmarks</Link>
              {user.role === 'instructor' && (
                <Link to="/instructor-dashboard" className="text-white hover:text-gray-200 transition">👨‍🏫 My Courses</Link>
              )}
              <span className="text-white">👋 {user.username}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-white hover:text-gray-200 transition"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="lg:hidden text-white text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="lg:hidden bg-blue-700 px-6 py-4 space-y-2">
          <Link to="/" className="block text-white hover:text-gray-200 py-2">Home</Link>
          <Link to="/courses" className="block text-white hover:text-gray-200 py-2">Courses</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="block text-white hover:text-gray-200 py-2">Dashboard</Link>
              <Link to="/chatbot" className="block text-white hover:text-gray-200 py-2">🤖 AI Tutor</Link>
              <Link to="/quizzes" className="block text-white hover:text-gray-200 py-2">📝 Quizzes</Link>
              <Link to="/leaderboard" className="block text-white hover:text-gray-200 py-2">🏆 Leaderboard</Link>
              <Link to="/quiz-history" className="block text-white hover:text-gray-200 py-2">📊 History</Link>
              <Link to="/my-bookmarks" className="block text-white hover:text-gray-200 py-2">🔖 Bookmarks</Link>
              {user.role === 'instructor' && (
                <Link to="/instructor-dashboard" className="block text-white hover:text-gray-200 py-2">👨‍🏫 My Courses</Link>
              )}
              <button 
                onClick={handleLogout}
                className="w-full text-left bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="block text-white hover:text-gray-200 py-2"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="block bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;