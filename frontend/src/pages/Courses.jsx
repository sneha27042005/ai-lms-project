import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, enrollCourse } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      alert('Please login to enroll');
      return;
    }
    try {
      const res = await enrollCourse(courseId);
      alert(res.data.message);
    } catch (error) {
      alert('Failed to enroll');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">All Courses</h1>
        
        {courses.length === 0 ? (
          <p className="text-gray-600">No courses available yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-6xl">📚</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      course.level === 'beginner' ? 'bg-green-100 text-green-700' :
                      course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="text-sm text-gray-500 mb-4">
                    👨‍🏫 {course.instructor_name} • 📖 {course.total_lessons} lessons
                  </div>
                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Enroll Now
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

export default Courses;