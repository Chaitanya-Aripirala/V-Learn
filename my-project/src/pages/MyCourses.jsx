import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Clock, PlayCircle, Trophy, BarChart3, GraduationCap } from 'lucide-react';

const MyCourses = () => {
  const { user } = useContext(AuthContext);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get('/enrollments');
        setEnrollments(res.data);
      } catch (error) {
        console.error('Failed to fetch enrollments', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
               <div className="flex items-center gap-3 mb-4">
                 <span className="bg-purple-600 text-[10px] font-black px-2 py-1 rounded-full tracking-widest uppercase">Student Portal</span>
                 <div className="h-1 w-8 bg-gray-600 rounded-full"></div>
               </div>
              <h1 className="text-5xl font-black mb-2 tracking-tight">My Learning <span className="text-purple-500">Journey</span></h1>
              <p className="text-gray-400 font-medium">You have enrolled in {enrollments.length} professional courses.</p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avg Progress</p>
                  <p className="text-xl font-black">
                    {enrollments.length > 0 
                      ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0) / enrollments.length) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 pb-20">
        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Your library is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto font-medium">Explore our catalog and start your learning adventure today. Your future self will thank you.</p>
            <button onClick={() => navigate('/')} className="bg-purple-700 text-white font-black py-4 px-10 rounded-2xl hover:bg-purple-800 transition-all shadow-lg shadow-purple-100">
              Browse All Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrollments.map((enrollment) => (
              <div 
                key={enrollment._id} 
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col"
                onClick={() => navigate(`/course/${enrollment.course._id}`)}
              >
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={enrollment.course.image} 
                    alt={enrollment.course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                      {enrollment.course.category || 'General'}
                    </span>
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-black text-gray-900 text-lg mb-2 line-clamp-2 leading-snug group-hover:text-purple-700 transition-colors">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-gray-500 text-xs font-bold mb-6 flex items-center gap-1 uppercase tracking-widest">
                    By {enrollment.course.instructor}
                  </p>

                  <div className="mt-auto space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span>Course Progress</span>
                        <span className="text-purple-700">{enrollment.progress || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${enrollment.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                       <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                           <PlayCircle className="w-3 h-3" />
                           {enrollment.completedVideos?.length || 0} Lessons
                         </div>
                       </div>
                       <button className="text-[10px] font-black uppercase tracking-widest text-purple-700 hover:translate-x-1 transition-transform flex items-center gap-1">
                         Continue <span className="text-sm">→</span>
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
