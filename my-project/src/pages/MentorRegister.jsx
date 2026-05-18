import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Lock, Phone, Landmark, Building, CreditCard, Hash, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const MentorRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
    }
  });

  const [otpCode, setOtpCode] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('bankDetails.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        bankDetails: {
          ...formData.bankDetails,
          [field]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.mobileNumber || !formData.password || !formData.confirmPassword) {
        return setError('Please fill all required fields');
      }
      if (formData.password !== formData.confirmPassword) {
        return setError('Passwords do not match');
      }
      setError('');
      setStep(2);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/mentor/register', formData);
      setStep(3); // OTP Step
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { email: formData.email, code: otpCode });
      alert('Verification successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Left Side: Branding/Info */}
        <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-12 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-black mb-6">Become an Instructor</h2>
            <p className="text-indigo-100 mb-8 leading-relaxed">
              Join our global community of expert instructors. Share your knowledge and earn professionally with secure direct bank transfers.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-200" />
                </div>
                <p className="text-sm font-medium">Verified Professional Onboarding</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-indigo-200" />
                </div>
                <p className="text-sm font-medium">Direct-to-Bank Earnings</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-indigo-200" />
                </div>
                <p className="text-sm font-medium">Full Course Management Suite</p>
              </div>
            </div>
          </div>
          
          <div className="pt-12 mt-12 border-t border-white/10">
            <p className="text-xs text-indigo-300 uppercase tracking-widest font-bold">Trusted by 500+ Experts</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-12">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-600' : 'bg-gray-100'}`} />
            ))}
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 1 ? 'Start your journey' : step === 2 ? 'Professional Details' : 'Verify Identity'}
          </h3>
          <p className="text-gray-500 text-sm mb-8">
            {step === 1 ? 'Enter your personal information below.' : step === 2 ? 'Provide bank details for earnings payout (optional).' : `Enter the code sent to ${formData.email}`}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-6 animate-pulse">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="name" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" name="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="tel" name="mobileNumber" placeholder="Mobile Number" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.mobileNumber} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" name="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" name="confirmPassword" placeholder="Confirm" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group">
                Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="bankDetails.accountHolderName" placeholder="Account Holder Name" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.bankDetails.accountHolderName} onChange={handleChange} />
              </div>
              <div className="relative">
                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="bankDetails.bankName" placeholder="Bank Name" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.bankDetails.bankName} onChange={handleChange} />
              </div>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="bankDetails.accountNumber" placeholder="Account Number" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.bankDetails.accountNumber} onChange={handleChange} />
              </div>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="bankDetails.ifscCode" placeholder="IFSC Code" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.bankDetails.ifscCode} onChange={handleChange} />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all">
                  Back
                </button>
                <button type="submit" disabled={loading} className="flex-[2] bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50">
                  {loading ? 'Creating Account...' : 'Complete Signup'}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center italic mt-4">By completing signup, you agree to our Instructor Terms & Conditions.</p>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex justify-center py-8">
                <input 
                  type="text" 
                  maxLength="6" 
                  placeholder="000000" 
                  className="w-full max-w-xs text-center text-4xl font-black tracking-[0.2em] py-4 bg-gray-50 border-2 border-dashed border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button type="button" className="w-full text-sm font-bold text-indigo-600 hover:underline">Resend Code</button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorRegister;
