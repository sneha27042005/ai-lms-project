import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookmarks } from '../services/api';

const MyBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyBookmarks();
      setBookmarks(res.data);
    } catch (error) {
      console.error(error);
      setError('Failed to load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  const groupByQuiz = () => {
    return bookmarks.reduce((acc, bookmark) => {
      const quizTitle = bookmark.question.quiz?.title || 'Unknown Quiz';
      if (!acc[quizTitle]) {
        acc[quizTitle] = [];
      }
      acc[quizTitle].push(bookmark);
      return acc;
    }, {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  const groupedBookmarks = groupByQuiz();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🔖 Bookmarked Questions</h1>
          <p className="text-gray-600">Review the questions you bookmarked for later study</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔖</div>
            <p className="text-gray-600 text-lg mb-6">You haven't bookmarked any questions yet.</p>
            <p className="text-gray-500 text-sm mb-6">Bookmark questions while taking quizzes to review them here!</p>
            <button
              onClick={() => navigate('/quizzes')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Take a Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedBookmarks).map(([quizTitle, questions]) => (
              <div key={quizTitle} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Quiz Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <h2 className="text-2xl font-bold">{quizTitle}</h2>
                  <p className="text-blue-100 mt-1">{questions.length} bookmarked question(s)</p>
                </div>

                {/* Questions List */}
                <div className="divide-y">
                  {questions.map((bookmark, idx) => (
                    <div key={bookmark.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">🔖</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-3">
                            Q{idx + 1}: {bookmark.question_text}
                          </h4>
                          <div className="space-y-2 ml-4 text-sm text-gray-600">
                            {bookmark.question.option_a && (
                              <p><strong>A.</strong> {bookmark.question.option_a}</p>
                            )}
                            {bookmark.question.option_b && (
                              <p><strong>B.</strong> {bookmark.question.option_b}</p>
                            )}
                            {bookmark.question.option_c && (
                              <p><strong>C.</strong> {bookmark.question.option_c}</p>
                            )}
                            {bookmark.question.option_d && (
                              <p><strong>D.</strong> {bookmark.question.option_d}</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-3">
                            Bookmarked on {new Date(bookmark.bookmarked_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookmarks;
