import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, BookOpen, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, branch });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      alert('Registration successful!');
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Error registering');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, code: otp });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      alert('Verification successful!');
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-purple-100/50 p-8 border border-purple-50 relative z-10">
        {!isVerifying ? (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-900">Create Account</h2>
              <p className="text-gray-500 mt-2 text-sm">Join the world's largest learning marketplace</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Branch (e.g. CS, IT)" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" 
                  value={branch} 
                  onChange={e => setBranch(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
 
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-50 hover:-translate-y-0.5"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900">Verify Email</h2>
              <p className="text-gray-500 mt-2 text-sm">Enter the 6-digit code sent to <b>{email}</b></p>
            </div>
 
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <input 
                type="text" 
                placeholder="000000" 
                className="w-full text-center text-3xl font-black tracking-[1rem] py-4 bg-gray-50 border-2 border-purple-100 rounded-xl focus:border-purple-600 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={otp}
                maxLength={6}
                onChange={e => setOtp(e.target.value)}
                required
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <p className="text-center text-xs text-gray-500">
                Didn't receive code? <button type="button" onClick={() => setIsVerifying(false)} disabled={loading} className="text-purple-600 font-bold hover:underline disabled:opacity-50">Change Email</button>
              </p>
            </form>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-4">
          <p className="text-sm text-gray-600">
            Have an account? <Link to="/login" className="text-purple-600 font-bold hover:underline">Log In</Link>
          </p>
          <div className="pt-4 border-t border-gray-50">
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

export default Register;
