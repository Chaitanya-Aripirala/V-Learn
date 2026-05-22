import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import api from '../services/api';
import { CreditCard, Award, TrendingUp, BarChart3 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell 
} from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ progressData: [], examData: [] });
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [payRes, statsRes, certRes] = await Promise.all([
        api.get('/payments/student/history'),
        api.get('/enrollments/stats'),
        api.get('/enrollments/certificates')
      ]);
      setPayments(payRes.data);
      setStats(statsRes.data);
      setCertificates(certRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Navigate to="/login" />;

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="bg-white shadow-2xl shadow-purple-50 rounded-3xl overflow-hidden border border-gray-100">
        {/* Profile Header Banner */}
        <div className="relative bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 px-8 py-16 text-white overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 bg-white/10 p-1 rounded-full backdrop-blur-sm border border-white/20 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-5xl font-black overflow-hidden shadow-inner">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-black mb-2 tracking-tight">{user.name}</h1>
              <p className="text-indigo-200 font-medium text-lg flex items-center justify-center md:justify-start gap-2">
                {user.email}
              </p>
              <div className="flex justify-center md:justify-start gap-3 mt-4">
                <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-white/10 shadow-sm">
                  {user.role}
                </span>
                {user.isVerified && (
                  <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/20 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    Verified Account
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-6 md:mt-0">
              <Link to="/profile" className="px-8 py-3 bg-white text-indigo-900 rounded-xl text-sm font-black hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Statistics Cards */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-gray-900">
              <TrendingUp className="w-7 h-7 text-purple-600 p-1 bg-purple-100 rounded-lg" /> Your Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative overflow-hidden border-0 p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50 shadow-sm hover:shadow-md transition-all group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-200/50 rounded-full blur-2xl group-hover:bg-purple-300/50 transition-colors"></div>
                <div className="relative z-10">
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">{user.enrolledCourses?.length || 0}</div>
                  <div className="text-gray-500 font-bold uppercase text-xs tracking-widest">Enrolled Courses</div>
                </div>
              </div>
              <div className="relative overflow-hidden border-0 p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 shadow-sm hover:shadow-md transition-all group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-200/50 rounded-full blur-2xl group-hover:bg-blue-300/50 transition-colors"></div>
                <div className="relative z-10">
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-2">{payments.length}</div>
                  <div className="text-gray-500 font-bold uppercase text-xs tracking-widest">Total Purchases</div>
                </div>
              </div>
              <div className="relative overflow-hidden border-0 p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm hover:shadow-md transition-all group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-200/50 rounded-full blur-2xl group-hover:bg-emerald-300/50 transition-colors"></div>
                <div className="relative z-10">
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-2">{certificates.length}</div>
                  <div className="text-gray-500 font-bold uppercase text-xs tracking-widest">Earned Certificates</div>
                </div>
              </div>
            </div>
          </div>

        {/* Analysis Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" /> Learning Analysis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Progress Chart */}
            <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Course Progress (%)</h3>
              <div className="h-[300px] w-full">
                {stats.progressData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.progressData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" hide />
                      <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f3f4f6' }}
                      />
                      <Bar dataKey="progress" radius={[6, 6, 0, 0]} barSize={40}>
                        {stats.progressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium italic">No progress data available</div>
                )}
              </div>
            </div>

            {/* Exam Scores Line Chart */}
            <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Exam Performance Score</h3>
              <div className="h-[300px] w-full">
                {stats.examData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.examData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#8b5cf6" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium italic">No exam records found</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Section */}
        {certificates.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-600" /> My Certificates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div key={cert._id} className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-100 transition-all duration-300">
                  <div className="w-full h-32 bg-gray-50 rounded-xl mb-4 overflow-hidden relative">
                    <img src={cert.course?.image} alt="" className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Award className="w-12 h-12 text-yellow-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{cert.course?.title}</h3>
                  <p className="text-xs text-gray-500 mb-4 italic">Completed on {new Date(cert.updatedAt).toLocaleDateString()}</p>
                  <Link 
                    to={`/certificate/${cert._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-black text-white text-sm font-bold py-3 rounded-xl hover:bg-gray-800 transition-all"
                  >
                    View Certificate
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Payment History */}
        <div>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-gray-600" /> Payment History
          </h2>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-5">
                        <Link to={`/course/${p.course?._id}`} className="flex items-center gap-4">
                          <img src={p.course?.image} alt="" className="w-12 h-8 object-cover rounded-md shadow-sm" />
                          <span className="text-sm font-bold text-gray-900 hover:text-purple-600 transition-colors">{p.course?.title}</span>
                        </Link>
                      </td>
                      <td className="p-5 text-xs font-mono text-gray-500">{p.razorpayOrderId}</td>
                      <td className="p-5 font-black text-gray-900">₹{p.amount}</td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">{new Date(p.createdAt).toLocaleDateString()}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Completed</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                          <CreditCard className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium">No payment records found.</p>
                        <Link to="/" className="text-purple-600 font-bold text-sm hover:underline">Explore Courses</Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


