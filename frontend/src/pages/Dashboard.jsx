import { useEffect, useState } from 'react';
import { getDashboard, getMyCourses } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StudentAchievements from '../components/StudentAchievements';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, coursesRes] = await Promise.all([
        getDashboard(),
        getMyCourses(),
      ]);
      setStats(dashRes.data);
      setMyCourses(coursesRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-white">Loading...</div>;

  return (
   <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.username}! 👋</h1>
        <p className="text-slate-300 mb-8">Here's your learning overview</p>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl">
            <div className="text-4xl mb-2">📚</div>
            <div className="text-3xl font-bold">{stats?.stats.total_enrollments || 0}</div>
            <div className="text-blue-100">Enrolled Courses</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold">{stats?.stats.completed_courses || 0}</div>
            <div className="text-green-100">Completed</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-3xl font-bold">{stats?.stats.quiz_attempts || 0}</div>
            <div className="text-purple-100">Quiz Attempts</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-2xl">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-3xl font-bold">{stats?.stats.passed_quizzes || 0}</div>
            <div className="text-yellow-100">Passed Quizzes</div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-slate-700/50 rounded-lg p-8 border border-slate-600 mb-12">
          <StudentAchievements />
        </div>

        {/* My Courses */}
        <h2 className="text-2xl font-bold text-white mb-6">My Enrolled Courses</h2>
        {myCourses.length === 0 ? (
          <p className="text-slate-300">You haven't enrolled in any courses yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((enrollment) => (
              <div key={enrollment.id} className="bg-slate-700/50 border border-slate-600 rounded-2xl p-6 hover:border-blue-500 transition">
                <h3 className="text-xl font-bold text-white mb-2">{enrollment.course_title}</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                </p>
                <div className={`text-sm font-semibold ${enrollment.is_completed ? 'text-green-400' : 'text-blue-400'}`}>
                  {enrollment.is_completed ? '✅ Completed' : '📖 In Progress'}
                </div>
                <button
                  onClick={() => window.location.href = `/courses/${enrollment.course}`}
                  className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Continue Learning →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;