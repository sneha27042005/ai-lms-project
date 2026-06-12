import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitQuiz, bookmarkQuestion, removeBookmark, getMyBookmarks } from '../services/api';
import CertificateModal from '../components/CertificateModal';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [submitWarning, setSubmitWarning] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);

  // Load saved answers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`quiz_${id}_answers`);
    if (saved) {
      setAnswers(JSON.parse(saved));
    }
    fetchQuiz();
    loadBookmarks();
  }, [id]);

  // Auto-save answers to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`quiz_${id}_answers`, JSON.stringify(answers));
    }
  }, [answers, id]);

  // Keyboard navigation
  useEffect(() => {
    if (!quiz || result) return;

    const handleKeyPress = (e) => {
      // Number keys for answer selection (1-4 for A-D)
      if (e.key >= '1' && e.key <= '4') {
        const answerKey = String.fromCharCode(64 + parseInt(e.key)); // 65 = 'A', 66 = 'B', etc
        const currentQuestion = quiz.questions[currentQuestionIdx];
        if (currentQuestion) {
          handleAnswer(currentQuestion.id, answerKey);
        }
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowRight' && currentQuestionIdx < quiz.questions.length - 1) {
        e.preventDefault();
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      }
      if (e.key === 'ArrowLeft' && currentQuestionIdx > 0) {
        e.preventDefault();
        setCurrentQuestionIdx(currentQuestionIdx - 1);
      }

      // Enter to submit
      if (e.key === 'Enter' && e.ctrlKey) {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [quiz, currentQuestionIdx, result, answers]);

  const fetchQuiz = async () => {
    try {
      const res = await getQuiz(id);
      setQuiz(res.data);
      // Set time limit from quiz settings
      setTimeLeft(res.data.time_limit_minutes * 60);
      // Randomize questions if setting is enabled
      if (res.data.randomize_questions) {
        const shuffled = [...res.data.questions].sort(() => Math.random() - 0.5);
        res.data.questions = shuffled;
      }
      setQuiz(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const res = await getMyBookmarks();
      const bookmarkedIds = res.data.reduce((acc, bm) => {
        acc[bm.question] = true;
        return acc;
      }, {});
      setBookmarked(bookmarkedIds);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAnswer = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleToggleBookmark = async (questionId) => {
    try {
      if (bookmarked[questionId]) {
        await removeBookmark(questionId);
        setBookmarked({ ...bookmarked, [questionId]: false });
      } else {
        await bookmarkQuestion(questionId);
        setBookmarked({ ...bookmarked, [questionId]: true });
      }
    } catch (error) {
      console.error('Bookmark failed:', error);
    }
  };

  const handleAutoSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitQuiz(id, answers);
      setResult(res.data);
      localStorage.removeItem(`quiz_${id}_answers`);
    } catch (error) {
      alert('Auto-submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all questions are answered
    if (!quiz) return;
    
    const unanswered = quiz.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setSubmitWarning(`Please answer all ${unanswered.length} question(s) before submitting.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitQuiz(id, answers);
      setResult(res.data);
      localStorage.removeItem(`quiz_${id}_answers`);
    } catch (error) {
      alert('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeWarning = timeLeft && timeLeft <= 300; // 5 minutes
  const answeredCount = Object.keys(answers).length;

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!quiz) return <div className="text-center py-20">Quiz not found</div>;

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-2xl p-10">
            {/* Result Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {result.is_passed ? '🎉' : '😔'}
              </div>
              <h1 className="text-4xl font-bold mb-2">
                {result.is_passed ? 'Congratulations!' : 'Keep Trying!'}
              </h1>
              <div className="text-6xl font-bold text-blue-600 my-6">
                {result.percentage}%
              </div>
              <p className="text-gray-600 mb-2 text-lg">
                Score: {result.score} / {result.total_questions}
              </p>
              <p className="text-gray-600 text-lg">
                Passing Score: {result.passing_score}%
              </p>
            </div>

            {/* Answers Review */}
            {result.show_answers && result.results && (
              <div className="mt-8 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-6">Answer Review</h2>
                <div className="space-y-4">
                  {result.results.map((res, idx) => (
                    <div key={res.question_id} className={`p-4 rounded-lg border-l-4 ${
                      res.is_correct ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                    }`}>
                      <h4 className="font-bold mb-2">{idx + 1}. {res.question}</h4>
                      <p className={`mb-2 ${res.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                        Your Answer: <strong>{res.selected || 'Not answered'}</strong>
                      </p>
                      {!res.is_correct && (
                        <p className="text-green-700 mb-2">
                          Correct Answer: <strong>{res.correct}</strong>
                        </p>
                      )}
                      {res.explanation && (
                        <p className="text-gray-700 text-sm mt-2 italic">
                          <strong>Explanation:</strong> {res.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mt-8 flex-wrap">
              <button
                onClick={() => navigate('/quizzes')}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
              >
                Back to Quizzes
              </button>
              {result.is_passed && (
                <button
                  onClick={() => setShowCertificate(true)}
                  className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition font-semibold flex items-center gap-2"
                >
                  🏆 View Certificate
                </button>
              )}
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setTimeLeft(quiz.time_limit_minutes * 60);
                  setSubmitWarning('');
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Try Again
              </button>
            </div>

            {/* Certificate Modal */}
            {showCertificate && (
              <CertificateModal 
                attempt={result} 
                quiz={quiz} 
                onClose={() => setShowCertificate(false)} 
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Timer and Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.description}</p>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  {quiz.total_questions} Questions
                </span>
              </div>
            </div>
            {/* Timer */}
            <div className={`text-center p-4 rounded-lg ${
              isTimeWarning ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <div className={`text-4xl font-bold ${
                isTimeWarning ? 'text-red-600' : 'text-blue-600'
              }`}>
                {formatTime(timeLeft || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Time Remaining</p>
              {isTimeWarning && (
                <p className="text-xs text-red-600 mt-1 font-semibold">Hurry up!</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm font-semibold text-gray-700">
                {answeredCount}/{quiz.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Validation Warning */}
          {submitWarning && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {submitWarning}
            </div>
          )}

          {/* Keyboard Shortcuts Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <details className="cursor-pointer">
              <summary className="font-semibold text-blue-900 select-none">
                ⌨️ Keyboard Shortcuts (Click to expand)
              </summary>
              <div className="mt-3 text-sm text-blue-800 space-y-1">
                <p><strong>1-4</strong>: Select answers A-D</p>
                <p><strong>← →</strong> Arrow Keys: Navigate between questions</p>
                <p><strong>Ctrl + Enter</strong>: Submit quiz</p>
              </div>
            </details>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className={`bg-white rounded-2xl shadow-lg p-8 border-l-4 ${
              answers[q.id] ? 'border-blue-500' : 'border-gray-200'
            } hover:shadow-xl transition`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex-1">
                  <span className="text-blue-600">Q{idx + 1}.</span> {q.text}
                </h3>
                <button
                  onClick={() => handleToggleBookmark(q.id)}
                  className={`text-2xl ml-4 ${
                    bookmarked[q.id] ? 'text-yellow-500' : 'text-gray-300'
                  } hover:text-yellow-500 transition`}
                  title={bookmarked[q.id] ? 'Remove bookmark' : 'Bookmark this question'}
                >
                  🔖
                </button>
              </div>

              <div className="space-y-3 ml-6">
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition ${
                      answers[q.id] === opt
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleAnswer(q.id, opt)}
                      className="w-5 h-5"
                    />
                    <span className="flex-1">
                      <strong className="text-blue-600">{opt}.</strong> {q[`option_${opt.toLowerCase()}`]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Section */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/quizzes')}
            className="flex-1 bg-gray-600 text-white py-4 rounded-lg font-semibold hover:bg-gray-700 transition text-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="animate-spin">⏳</span> Submitting...
              </>
            ) : (
              'Submit Quiz'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;