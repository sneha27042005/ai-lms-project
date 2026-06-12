import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyAttempts, getAttemptDetail } from '../services/api';

const QuizHistory = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyAttempts();
      setAttempts(res.data);
    } catch (error) {
      console.error(error);
      setError('Failed to load quiz attempts.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (attemptId) => {
    try {
      setDetailLoading(true);
      const res = await getAttemptDetail(attemptId);
      setSelectedAttempt(res.data);
    } catch (error) {
      console.error(error);
      alert('Failed to load attempt details');
    } finally {
      setDetailLoading(false);
    }
  };

  // Group attempts by quiz
  const attemptsByQuiz = attempts.reduce((acc, attempt) => {
    if (!acc[attempt.quiz_title]) {
      acc[attempt.quiz_title] = [];
    }
    acc[attempt.quiz_title].push(attempt);
    return acc;
  }, {});

  const calculateStats = (quizAttempts) => {
    if (quizAttempts.length === 0) return null;
    
    const bestScore = Math.max(...quizAttempts.map(a => a.percentage));
    const avgScore = (quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length).toFixed(1);
    const passedCount = quizAttempts.filter(a => a.is_passed).length;
    
    return { bestScore, avgScore, passedCount, total: quizAttempts.length };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading your attempts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Quiz History</h1>
          <p className="text-gray-600">Track your quiz performance and review past attempts</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {attempts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-gray-600 text-lg mb-6">No quiz attempts yet. Take a quiz to see your history!</p>
            <button
              onClick={() => navigate('/quizzes')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Go to Quizzes
            </button>
          </div>
        ) : (
          <div className="grid gap-8">
            {Object.entries(attemptsByQuiz).map(([quizTitle, quizAttempts]) => {
              const stats = calculateStats(quizAttempts);
              return (
                <div key={quizTitle} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Quiz Header with Stats */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{quizTitle}</h2>
                        <p className="text-blue-100">Total Attempts: {stats.total}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold">{stats.bestScore}%</div>
                        <p className="text-blue-100 text-sm">Best Score</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid md:grid-cols-3 gap-4 p-6 border-b">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.avgScore}%</div>
                      <p className="text-sm text-gray-600">Average Score</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.passedCount}/{stats.total}</div>
                      <p className="text-sm text-gray-600">Passed</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {((stats.passedCount / stats.total) * 100).toFixed(0)}%
                      </div>
                      <p className="text-sm text-gray-600">Pass Rate</p>
                    </div>
                  </div>

                  {/* Attempts List */}
                  <div className="divide-y">
                    {quizAttempts.map((attempt, idx) => (
                      <div key={attempt.id} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">
                                {attempt.is_passed ? '✅' : '❌'}
                              </span>
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  Attempt #{quizAttempts.length - idx}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(attempt.attempted_at).toLocaleDateString()}{' '}
                                  {new Date(attempt.attempted_at).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 ml-11">
                              <div>
                                <span className="text-2xl font-bold text-blue-600">
                                  {attempt.percentage}%
                                </span>
                                <p className="text-xs text-gray-600">Score</p>
                              </div>
                              <div>
                                <span className="text-2xl font-bold text-purple-600">
                                  {attempt.score}/{attempt.total_questions}
                                </span>
                                <p className="text-xs text-gray-600">Correct</p>
                              </div>
                              <div>
                                <span className="text-2xl font-bold text-gray-600">
                                  {attempt.is_passed ? '✓ Passed' : '✗ Failed'}
                                </span>
                                <p className="text-xs text-gray-600">Status</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewDetails(attempt.id)}
                            className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition font-semibold"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold">Attempt Details</h3>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="text-2xl font-bold hover:opacity-80"
              >
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {selectedAttempt.question_details && selectedAttempt.question_details.map((qd, idx) => (
                  <div
                    key={qd.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      qd.is_correct
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <h4 className="font-bold mb-2">
                      <span className="text-lg">
                        {qd.is_correct ? '✅' : '❌'}
                      </span>{' '}
                      Q{idx + 1}: {qd.question.text}
                    </h4>
                    <p className={`mb-1 ${qd.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                      Your Answer: <strong>{qd.selected_answer || 'Not answered'}</strong>
                    </p>
                    {!qd.is_correct && (
                      <p className="text-green-700 mb-1">
                        Correct Answer: <strong>{qd.question.correct_option}</strong>
                      </p>
                    )}
                    {qd.question.explanation && (
                      <p className="text-sm text-gray-700 mt-2 italic">
                        <strong>Explanation:</strong> {qd.question.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizHistory;
