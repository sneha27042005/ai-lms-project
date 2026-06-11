import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Learn Smarter with AI 🚀
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Master new skills with personalized AI tutoring, interactive courses, and progress tracking.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
            <Link 
              to="/courses" 
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Why Choose AI LMS?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">AI Tutor</h3>
            <p className="text-gray-600">Get instant help from our intelligent AI tutor powered by Gemini.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Quality Courses</h3>
            <p className="text-gray-600">Access curated courses from beginner to advanced levels.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Track Progress</h3>
            <p className="text-gray-600">Monitor your learning journey with detailed analytics.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;