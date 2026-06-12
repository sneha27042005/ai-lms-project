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
    return <div className="text-center text-slate-300">Loading achievements...</div>;
  }

  const achievementDetails = {
    first_quiz: { icon: '🎯', title: 'First Quiz', description: 'Took your first quiz' },
    perfect_score: { icon: '💯', title: 'Perfect Score', description: 'Achieved 100% on a quiz' },
    course_complete: { icon: '🎓', title: 'Course Champion', description: 'Completed a full course' },
    streak_7: { icon: '🔥', title: '7-Day Streak', description: '7 consecutive days of learning' },
    streak_30: { icon: '⚡', title: '30-Day Streak', description: '30 consecutive days of learning' },
    fast_learner: { icon: '🚀', title: 'Fast Learner', description: 'Completed 5 quizzes in one week' },
    helper: { icon: '🤝', title: 'Course Helper', description: 'Helped 5 students in discussions' },
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">🏆 Your Achievements</h2>
      {achievements.length === 0 ? (
        <p className="text-slate-300">Keep learning to unlock achievements!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => {
            const details = achievementDetails[achievement.achievement_type] || { icon: '🏅', title: achievement.title };
            return (
              <div
                key={achievement.id}
                className="bg-slate-700/50 border border-yellow-500/30 rounded-lg p-4 text-center hover:bg-slate-700 transition"
              >
                <div className="text-4xl mb-2">{details.icon}</div>
                <div className="font-semibold text-white text-sm">{details.title}</div>
                <div className="text-xs text-slate-400 mt-1">{new Date(achievement.earned_at).toLocaleDateString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
