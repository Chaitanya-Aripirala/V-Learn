import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { Activity, BookOpen, CheckCircle, TrendingUp, TrendingDown, Target, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentAnalytics = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/student');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return <div className="p-10 text-center">Failed to load analytics.</div>;

  const { overview, timeline, strongAreas, weakAreas } = data;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-xl">
          <p className="text-gray-500 text-xs font-bold mb-1">{label}</p>
          <p className="text-indigo-600 font-black mb-1">{`Score: ${payload[0].value}%`}</p>
          <p className="text-gray-800 text-xs truncate max-w-[200px]">{payload[0].payload.name}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-2">
             <Activity className="w-8 h-8 text-indigo-600" />
             <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your <span className="text-indigo-600">Analytics</span></h1>
          </div>
          <p className="text-gray-500 font-medium">Track your learning progress, identify your strengths, and focus on weak areas.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-8">
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enrolled Courses</p>
              <p className="text-2xl font-black text-gray-900">{overview.totalCourses}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Videos Completed</p>
              <p className="text-2xl font-black text-gray-900">{overview.totalCompletedVideos}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Exams Attempted</p>
              <p className="text-2xl font-black text-gray-900">{overview.examsTaken}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Average Score</p>
              <p className="text-2xl font-black text-gray-900">{overview.averageScore}%</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Timeline Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900">Performance Over Time</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Your exam scores tracked chronologically</p>
              </div>
            </div>
            
            {timeline && timeline.length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="Score" 
                      stroke="#4f46e5" 
                      strokeWidth={4}
                      dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
                <p className="text-gray-400 font-medium">Take some exams to see your progress chart!</p>
              </div>
            )}
          </div>

          {/* Strong / Weak Areas */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-xl font-black text-gray-900 mb-8">Subject Analysis</h2>
            
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {/* Strong Areas */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Strong Areas</h3>
                </div>
                {strongAreas.length > 0 ? (
                  <div className="space-y-3">
                    {strongAreas.map((area, idx) => (
                      <div key={idx} className="bg-green-50/50 border border-green-100 p-4 rounded-2xl flex items-center justify-between group hover:bg-green-50 transition-colors">
                        <span className="font-bold text-gray-800">{area.subject}</span>
                        <span className="text-green-700 font-black bg-green-100 px-3 py-1 rounded-lg text-sm">{area.score}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No strong areas identified yet (Score > 70%).</p>
                )}
              </div>

              {/* Weak Areas */}
              <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Needs Improvement</h3>
                </div>
                {weakAreas.length > 0 ? (
                  <div className="space-y-3">
                    {weakAreas.map((area, idx) => (
                      <div key={idx} className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex items-center justify-between group hover:bg-red-50 transition-colors">
                        <span className="font-bold text-gray-800">{area.subject}</span>
                        <span className="text-red-700 font-black bg-red-100 px-3 py-1 rounded-lg text-sm">{area.score}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Great job! No weak areas identified.</p>
                )}
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentAnalytics;
