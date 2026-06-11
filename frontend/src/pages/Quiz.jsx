import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getQuiz, submitQuiz } from '../services/api';

const Quiz = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await getQuiz(id);
      setQuiz(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async () => {
    try {
      const res = await submitQuiz(id, answers);
      setResult(res.data);
    } catch (error) {
      alert('Submission failed');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!quiz) return <div className="text-center py-20">Quiz not found</div>;

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
            <div className="text-6xl mb-4">
              {result.is_passed ? '🎉' : '😔'}
            </div>
            <h1 className="text-3xl font-bold mb-4">
              {result.is_passed ? 'Congratulations!' : 'Keep Trying!'}
            </h1>
            <div className="text-5xl font-bold text-blue-600 my-6">
              {result.percentage}%
            </div>
            <p className="text-gray-600 mb-2">
              Score: {result.score} / {result.total_questions}
            </p>
            <p className="text-gray-600 mb-6">
              Passing Score: {result.passing_score}%
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
          <p className="text-gray-600 mb-8">{quiz.description}</p>

          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="mb-6 p-6 border rounded-lg">
              <h3 className="font-semibold mb-4">
                {idx + 1}. {q.text}
              </h3>
              <div className="space-y-2">
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <label key={opt} className="flex items-center gap-3 p-3 rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      onChange={() => handleAnswer(q.id, opt)}
                    />
                    <span>
                      <strong>{opt}.</strong> {q[`option_${opt.toLowerCase()}`]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;