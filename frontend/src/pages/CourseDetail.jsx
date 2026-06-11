import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourse, getLessons, markLessonComplete } from '../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        getCourse(id),
        getLessons(id),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      if (lessonsRes.data.length > 0) {
        setSelectedLesson(lessonsRes.data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (lessonId) => {
    try {
      await markLessonComplete(lessonId);
      alert('Lesson marked as complete! 🎉');
    } catch (error) {
      alert('Failed to mark complete');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <p className="mt-2">{course.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 grid md:grid-cols-3 gap-6">
        {/* Lessons Sidebar */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📚 Lessons</h2>
          {lessons.length === 0 ? (
            <p className="text-gray-500">No lessons yet</p>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, idx) => (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedLesson?.id === lesson.id
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {idx + 1}. {lesson.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lesson Content */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-8">
          {selectedLesson ? (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {selectedLesson.title}
              </h2>
              <div className="text-sm text-gray-500 mb-6">
                ⏱ {selectedLesson.duration} minutes
              </div>
              <div className="prose max-w-none mb-8">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedLesson.content}
                </p>
              </div>
              {selectedLesson.video_url && (
                <div className="mb-6">
                  <a
                    href={selectedLesson.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    🎥 Watch Video
                  </a>
                </div>
              )}
              <button
                onClick={() => handleComplete(selectedLesson.id)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
              >
                ✅ Mark as Complete
              </button>
            </>
          ) : (
            <p className="text-gray-500">Select a lesson to view content</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;