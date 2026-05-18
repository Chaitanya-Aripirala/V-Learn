import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Landmark, Building, CreditCard, Hash, ShieldCheck, Lock, Camera, Trash2 } from 'lucide-react';

const EditProfile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });
  const [profilePic, setProfilePic] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setMobileNumber(user.mobileNumber || '');
      setBranch(user.branch || '');
      setBankDetails(user.bankDetails || {
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
      });
      setProfilePic(user.profilePic || '');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankDetails({ ...bankDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name,
        email,
        mobileNumber,
        branch,
        bankDetails,
        profilePic,
        password: password || undefined,
      });
      alert('Profile updated successfully!');
      navigate(user.role === 'mentor' ? '/mentor-dashboard' : '/dashboard');
    } catch (error) {
      console.error(error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-center font-bold">Please log in.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          
          {/* Sidebar */}
          <div className="w-full md:w-72 bg-gray-900 p-8 text-white">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative group mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-800 shadow-xl">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-3xl font-black">
                      {name[0]}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white text-gray-900 p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">{user.role}</p>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium">Account Settings</span>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="flex-1 p-8 md:p-12">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Edit Profile</h1>
            <p className="text-gray-500 text-sm mb-10">Manage your account information and preferences.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{user.role === 'mentor' ? 'Specialization' : 'Branch'}</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" value={branch} onChange={e => setBranch(e.target.value)} />
                  </div>
                </div>
              </div>

              {user.role === 'mentor' && (
                <div className="pt-8 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-indigo-600" /> Professional Payment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Account Holder Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" name="accountHolderName" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" value={bankDetails.accountHolderName} onChange={handleBankChange} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Bank Name</label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" name="bankName" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" value={bankDetails.bankName} onChange={handleBankChange} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Account Number</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" name="accountNumber" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" value={bankDetails.accountNumber} onChange={handleBankChange} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">IFSC Code</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" name="ifscCode" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" value={bankDetails.ifscCode} onChange={handleBankChange} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-600" /> Security
                </h3>
                <div className="max-w-md space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" placeholder="Leave blank to keep current" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50">
                  {loading ? 'Saving Changes...' : 'Update Profile'}
                </button>
                <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all">
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

