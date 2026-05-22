import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      alert('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-[80vh] items-center py-20 px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl shadow-purple-100/50 border border-purple-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2"></div>
        
        <h2 className="text-2xl font-black mb-8 text-center text-gray-900">
          Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">V-Learn</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full border-2 border-gray-100 p-4 font-medium rounded-xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              className="w-full border-2 border-gray-100 p-4 font-medium rounded-xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="mt-8 text-center text-sm space-y-6 relative z-10">
          <p className="text-gray-500 font-medium">Don't have an account? <Link to="/register" className="text-purple-600 font-bold hover:underline">Sign up</Link></p>
          <div className="pt-6 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Want to teach?</p>
            <Link to="/mentor-register" className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
              Register as a Mentor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
