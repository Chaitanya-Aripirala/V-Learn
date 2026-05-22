import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useContext } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const category = query.get('category');
  const searchKeyword = query.get('search');
  const [recommendations, setRecommendations] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        // Sort by rating descending for "Popular Courses"
        const sorted = (res.data || []).sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setCourses(sorted);
        setFilteredCourses(sorted);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/courses/recommendations');
        setRecommendations(res.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };
    if (user && user.token) {
      fetchRecommendations();
    }
  }, [user]);

  useEffect(() => {
    let result = [...courses];
    
    if (category) {
      result = result.filter(c => c.category === category);
    }
    
    if (searchKeyword) {
      const keywords = searchKeyword.toLowerCase().split(' ').filter(k => k.trim() !== '');
      result = result.filter(c => {
        const textToSearch = `${c.title} ${c.description} ${c.instructor} ${c.category} ${c.tags?.join(' ')}`.toLowerCase();
        // Match if ALL keywords are found somewhere in the course data
        return keywords.every(kw => textToSearch.includes(kw));
      });
    }
    
    setFilteredCourses(result);
  }, [category, searchKeyword, courses]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-purple-100 border-t-[#7e22ce] animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-[#7e22ce] rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-lg">v</span>
          </div>
        </div>
      </div>
      <p className="text-gray-500 font-semibold tracking-wide">Loading courses...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Extreme Hero Section for Students/Visitors */}
      {(!user || user.role !== 'mentor') && !category && !searchKeyword && (
        <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900 overflow-hidden mb-12 shadow-sm border-b border-purple-100/50">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-4000"></div>

          <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-purple-100 backdrop-blur-md mb-8 animate-fade-in-up shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold tracking-wide text-purple-700 uppercase">Welcome to the future of learning</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 animate-fade-in-up animation-delay-100 text-gray-900">
              Master your craft with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600">V-Learn</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200 font-medium">
              Unlock your potential with world-class courses designed by industry experts. Learn at your own pace, anytime, anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
              <button onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})} className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-purple-200 transition-all transform hover:-translate-y-1 group">
                <span className="relative z-10 flex items-center gap-2">Explore Courses <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /></span>
              </button>
              {!user && (
                <button onClick={() => navigate('/register')} className="bg-white hover:bg-gray-50 border border-purple-100 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group shadow-sm">
                  Join for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-purple-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      {(!user || user.role !== 'mentor') && !category && !searchKeyword && (
        <div className="bg-white border-y border-gray-100 py-6 mb-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10,000+', label: 'Students Enrolled' },
              { value: '200+', label: 'Expert Mentors' },
              { value: '500+', label: 'Courses Available' },
              { value: '98%', label: 'Satisfaction Rate' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-[#7e22ce] mb-1">{stat.value}</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
      {/* Mentor Quick Access */}
      {user && user.role === 'mentor' && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Welcome Back, Mentor!</h2>
            <p className="text-sm text-gray-500">You have {courses.filter(c => c.mentorId === user._id).length} courses published. Manage your content or create something new.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/mentor-dashboard')} className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-all">Go to Dashboard</button>
            <button onClick={() => navigate('/mentor-dashboard')} className="border border-gray-300 px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all">Create Course</button>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {user && user.role !== 'mentor' && !category && !searchKeyword && recommendations.length > 0 && (
        <div className="mb-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 px-4 py-2 rounded-full mb-3">
                <Sparkles className="w-4 h-4 text-[#7e22ce]" />
                <span className="text-[11px] font-black text-[#7e22ce] uppercase tracking-widest">AI Powered</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900">Picked For You</h2>
              <p className="text-gray-400 text-sm font-medium mt-1">
                Based on your {user.branch ? <strong className="text-[#7e22ce]">{user.branch}</strong> : 'interests'} {user.branch ? 'specialization' : ''} and learning history
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="self-start md:self-auto text-xs font-black text-[#7e22ce] bg-purple-50 border border-purple-100 px-4 py-2 rounded-xl hover:bg-purple-100 transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.map((course, i) => (
              <div key={course._id} className="relative">
                {i < 3 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#7e22ce] to-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg z-10 uppercase tracking-wider">
                    {i === 0 ? '🥇 Top Pick' : i === 1 ? '🔥 Trending' : '⭐ Highly Rated'}
                  </div>
                )}
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </div>
      )}

      {user && user.role === 'mentor' ? (
        <div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
            <h2 className="text-2xl font-black text-gray-900">Your Published Courses</h2>
            <button onClick={() => navigate('/mentor-dashboard')} className="text-sm font-bold text-purple-700 hover:underline">Manage All &rarr;</button>
          </div>
          
          {courses.filter(c => c.mentorId === user._id).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {courses.filter(c => c.mentorId === user._id).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
              <p className="text-gray-500 font-medium mb-4">You haven't published any courses yet.</p>
              <button onClick={() => navigate('/mentor-dashboard')} className="bg-black text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-gray-200 hover:scale-105 transition-all">Create Your First Course</button>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <h2 className="text-3xl font-black mb-8 pb-4 border-b border-gray-200 flex items-center justify-between text-gray-900">
            <span>{searchKeyword ? `Search results for "${searchKeyword}"` : (category ? `${category} Courses` : 'Popular Courses')}</span>
            {!searchKeyword && !category && <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-widest border border-purple-100">Top Picks</span>}
          </h2>
          
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {(searchKeyword || category ? filteredCourses : filteredCourses.slice(0, 10)).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50 border border-dashed border-gray-300 rounded">
              <p className="text-gray-500">
                {searchKeyword ? `No courses found for "${searchKeyword}".` : 'Currently, no courses are available.'}
              </p>
            </div>
          )}
        </div>
      )}

        {/* Become a Mentor CTA */}
        {(!user || user.role !== 'mentor') && !category && !searchKeyword && (
          <div className="my-20 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-purple-100 p-12 md:p-16 text-center relative overflow-hidden shadow-xl shadow-purple-50">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-300 rounded-full blur-[100px] opacity-30"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-300 rounded-full blur-[100px] opacity-30"></div>
            <div className="relative z-10">
              <p className="text-purple-600 font-black text-sm uppercase tracking-[0.3em] mb-4">Share Your Knowledge</p>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-gray-900">
                Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">V-Learn</span> Mentor
              </h2>
              <p className="text-gray-600 font-medium max-w-xl mx-auto mb-10 leading-relaxed text-lg">
                Join hundreds of expert instructors and reach thousands of students. Build your brand and earn while you teach.
              </p>
              <button
                onClick={() => navigate('/mentor-register')}
                className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-purple-200 transition-all transform hover:-translate-y-1 group"
              >
                <span className="relative z-10 flex items-center gap-2">Start Teaching Today <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
