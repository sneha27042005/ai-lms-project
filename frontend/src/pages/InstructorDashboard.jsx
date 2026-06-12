import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInstructorDashboard } from '../services/api';

export default function InstructorDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getInstructorDashboard();
        setDashboardData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard');
        if (err.response?.status === 403) {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-6 py-4 rounded-lg max-w-md">
          {error}
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">👨‍🏫 Instructor Dashboard</h1>
          <p className="text-slate-300">Monitor your courses and student progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{dashboardData.total_courses}</div>
            <div className="text-blue-100 mt-2">Total Courses</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{dashboardData.total_students}</div>
            <div className="text-green-100 mt-2">Total Students</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{dashboardData.total_quizzes}</div>
            <div className="text-purple-100 mt-2">Total Quizzes</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{Math.round(dashboardData.average_quiz_score)}%</div>
            <div className="text-orange-100 mt-2">Avg Quiz Score</div>
          </div>
        </div>

        {/* Courses Details */}
        <div className="bg-slate-700/50 rounded-lg p-8 border border-slate-600">
          <h2 className="text-2xl font-bold text-white mb-6">📚 Course Analytics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="px-4 py-3 text-slate-300 font-semibold">Course</th>
                  <th className="px-4 py-3 text-slate-300 font-semibold">Students</th>
                  <th className="px-4 py-3 text-slate-300 font-semibold">Quizzes</th>
                  <th className="px-4 py-3 text-slate-300 font-semibold">Attempts</th>
                  <th className="px-4 py-3 text-slate-300 font-semibold">Avg Score</th>
                  <th className="px-4 py-3 text-slate-300 font-semibold">Completion</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.courses.map((course) => (
                  <tr key={course.id} className="border-b border-slate-600 hover:bg-slate-600/30 transition">
                    <td className="px-4 py-4 text-white font-medium">{course.title}</td>
                    <td className="px-4 py-4 text-slate-300">{course.students_enrolled}</td>
                    <td className="px-4 py-4 text-slate-300">{course.total_quizzes}</td>
                    <td className="px-4 py-4 text-slate-300">{course.total_attempts}</td>
                    <td className="px-4 py-4">
                      <span className="text-green-400 font-semibold">{Math.round(course.avg_score)}%</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-32 bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${course.completion_rate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">{Math.round(course.completion_rate)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">💡 Tips for Engagement</h3>
          <ul className="text-slate-300 space-y-2">
            <li>• Monitor quiz performance regularly to identify struggling students</li>
            <li>• Engage with course discussions to build community</li>
            <li>• Consider adjusting quiz difficulty based on average scores</li>
            <li>• Recognize high performers with badges and achievements</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
