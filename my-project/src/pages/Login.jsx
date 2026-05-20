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
    <div className="flex justify-center py-20 px-6">
      <div className="w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">Log in to your V-Learn account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="sr-only">Email</label>
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full border border-gray-900 p-4 font-bold rounded-sm outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="sr-only">Password</label>
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full border border-gray-900 p-4 font-bold rounded-sm outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-4 rounded-sm hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm space-y-4">
          <p>Don't have an account? <Link to="/register" className="text-primary font-bold underline">Sign up</Link></p>
          <div className="pt-6 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Want to teach?</p>
            <Link to="/mentor-register" className="inline-block bg-gray-50 text-gray-700 px-6 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all border border-gray-100">
              Register as a Mentor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
