import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes } from '../services/api';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getQuizzes();
      setQuizzes(res.data);
    } catch (error) {
      console.error(error);
      setError('Failed to load quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter quizzes
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = filterDifficulty === 'all' || quiz.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return '⭐';
      case 'medium':
        return '⭐⭐';
      case 'hard':
        return '⭐⭐⭐';
      default:
        return '⭐';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Quizzes</h1>
          <p className="text-gray-600 text-lg">Test your knowledge with our interactive quizzes</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Quizzes</label>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Difficulty</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Quiz Cards */}
        {filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-lg">
              {searchTerm || filterDifficulty !== 'all' ? 'No matching quizzes found.' : 'No quizzes available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, idx) => (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1 cursor-pointer"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-4xl">📝</div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">Quiz {idx + 1}</h3>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Course Tag */}
                  {quiz.course_title && (
                    <div className="mb-3">
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                        📚 {quiz.course_title}
                      </span>
                    </div>
                  )}

                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    {quiz.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {quiz.description || 'Test your knowledge'}
                  </p>

                  <div className="space-y-3 mb-4 pb-4 border-b">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        📋 {quiz.total_questions} {quiz.total_questions === 1 ? 'Question' : 'Questions'}
                      </span>
                      <span className="flex items-center gap-1">
                        ⏱️ {quiz.time_limit_minutes} min
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        {getDifficultyIcon(quiz.difficulty)}
                      </span>
                      <span className="flex items-center gap-1">
                        🎯 {quiz.passing_score}% to pass
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    Start Quiz <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;