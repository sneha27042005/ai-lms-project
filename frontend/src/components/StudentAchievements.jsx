import React, { useState, useEffect } from 'react';
import { getAchievements } from '../services/api';

export default function StudentAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await getAchievements();
        setAchievements(response.data);
      } catch (err) {
        console.error('Failed to load achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-600">
        Loading achievements...
      </div>
    );
  }

  const achievementDetails = {
    first_quiz: { icon: '🎯', title: 'First Quiz' },
    perfect_score: { icon: '💯', title: 'Perfect Score' },
    course_complete: { icon: '🎓', title: 'Course Champion' },
    streak_7: { icon: '🔥', title: '7-Day Streak' },
    streak_30: { icon: '⚡', title: '30-Day Streak' },
    fast_learner: { icon: '🚀', title: 'Fast Learner' },
    helper: { icon: '🤝', title: 'Course Helper' },
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        🏆 Your Achievements
      </h2>

      {achievements.length === 0 ? (
        <p className="text-gray-600 font-medium">
          Keep learning to unlock achievements!
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => {
            const details =
              achievementDetails[achievement.achievement_type] || {
                icon: '🏅',
                title: achievement.title || 'Achievement',
              };

            return (
              <div
                key={achievement.id}
                className="bg-gray-50 border border-yellow-300 rounded-lg p-4 text-center hover:shadow-md transition"
              >
                <div className="text-4xl mb-2">{details.icon}</div>

                <div className="font-semibold text-gray-900 text-sm">
                  {details.title}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {new Date(achievement.earned_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}