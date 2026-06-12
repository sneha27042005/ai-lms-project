import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const params = courseId ? `?course_id=${courseId}` : '';
        const response = await getLeaderboard(params);
        setLeaderboard(response.data);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [courseId]);

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '📊';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600">
            Top performers in the platform
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center text-gray-500">
            Loading leaderboard...
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center text-gray-500">
                No quiz attempts yet
              </div>
            ) : (
              leaderboard.map((student) => (
                <div
                  key={student.student_id}
                  className="bg-white hover:shadow-lg transition border border-gray-200 rounded-lg p-6 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-gray-900 min-w-16 text-center">
                      {getMedalEmoji(student.rank)}
                    </div>

                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        #{student.rank} {student.username}
                      </div>

                      <div className="text-gray-500 text-sm">
                        {student.quiz_attempts} quiz attempts
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {student.average_score.toFixed(1)}%
                    </div>

                    <div className="text-gray-500 text-sm">
                      Average Score
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Top Performer Highlight */}
        {leaderboard.length > 0 && (
          <div className="mt-12 bg-white border border-yellow-300 rounded-lg p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">⭐</div>

            <h3 className="text-2xl font-bold text-yellow-600 mb-2">
              Top Performer
            </h3>

            <p className="text-gray-900 text-lg mb-2">
              {leaderboard[0].username}
            </p>

            <p className="text-yellow-700">
              Average Score: {leaderboard[0].average_score.toFixed(1)}% •{' '}
              {leaderboard[0].quiz_attempts} Attempts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}