import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Award, ArrowLeft, Printer, ShieldCheck, BookOpen, Star, UserCheck } from 'lucide-react';

const Certificate = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Custom Name states
  const [studentName, setStudentName] = useState(user?.name || '');
  const [nameConfirmed, setNameConfirmed] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await api.get('/enrollments/certificates');
        const found = res.data.find(e => e._id === enrollmentId);
        if (found) {
          setEnrollment(found);
        } else {
          alert('Certificate not available. You must complete at least 80% of the course to generate it!');
          navigate('/dashboard');
        }
      } catch (err) {
        console.error(err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [enrollmentId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Loading your credential...</p>
      </div>
    );
  }
  
  if (!enrollment) return null;

  const completionDate = new Date(enrollment.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Screen 1: Prompt for Name
  if (!nameConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border border-gray-100 text-center space-y-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Before We Generate...</h2>
            <p className="text-sm text-gray-500 mt-2">Please enter your name exactly as you would like it to appear on your official certificate.</p>
          </div>
          
          <input 
            type="text" 
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full text-center text-xl font-bold p-4 border-2 border-purple-100 rounded-xl focus:border-purple-600 outline-none transition-all"
            placeholder="Your Full Name"
            autoFocus
          />

          <button 
            onClick={() => {
              if(!studentName.trim()) return alert("Name cannot be empty");
              setNameConfirmed(true);
            }}
            className="w-full bg-purple-600 text-white font-black py-4 rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all"
          >
            Generate My Certificate
          </button>
          
          <button onClick={() => navigate('/dashboard')} className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Screen 2: Render Certificate
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-12 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-5xl mx-auto">

        {/* Action Bar — hidden on print */}
        <div className="mb-8 flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-700 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
          >
            <Printer className="w-5 h-5" /> Download Certificate
          </button>
        </div>

        {/* ====== CERTIFICATE ====== */}
        <div className="bg-white relative overflow-hidden shadow-2xl rounded-2xl print:shadow-none print:rounded-none"
          style={{ border: '12px double #5b21b6' }}
        >
          {/* Subtle background watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <Award className="w-[600px] h-[600px] text-purple-900" />
          </div>

          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-100 rounded-full opacity-40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-100 rounded-full opacity-40 blur-3xl" />

          {/* Corner ornaments */}
          <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-purple-700 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-purple-700 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-purple-700 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-purple-700 rounded-br-lg" />

          <div className="relative z-10 p-12 text-center">
            {/* Logo / Badge */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full flex items-center justify-center shadow-xl shadow-purple-300">
                <Award className="w-10 h-10 text-white" />
              </div>
            </div>

            <p className="text-xs font-black text-purple-500 uppercase tracking-[0.3em] mb-2 flex items-center justify-center gap-1">
              <span className="w-5 h-5 bg-[#7e22ce] text-white rounded-[5px] flex items-center justify-center font-black text-xs leading-none">V</span>
              <span className="text-[#7e22ce] font-black">-LEARN</span>
              <span className="text-gray-400 font-bold">· Verified Credential</span>
            </p>
            <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
              Certificate of Completion
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full mx-auto mb-6" />

            <p className="text-gray-500 text-lg italic mb-2">This is to proudly certify that</p>

            <h2 className="text-5xl font-black text-purple-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              {studentName}
            </h2>

            <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed mb-6">
              has successfully completed all the requirements, including practical lessons and assessments, of the comprehensive course:
            </p>
            
            <div className="inline-block bg-purple-50 border border-purple-100 rounded-2xl px-10 py-4 mb-6">
              <div className="flex items-center gap-3 justify-center mb-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <span className="text-2xl font-black text-gray-900">{enrollment.course?.title}</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <p>Instructor: <strong className="text-gray-900">{enrollment.course?.instructor || 'Course Mentor'}</strong></p>
              </div>
            </div>

            {/* Performance Analysis Section */}
            {enrollment.examScores && enrollment.examScores.length > 0 && (
              <div className="max-w-md mx-auto mb-6 bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative">
                <p className="text-[10px] absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 font-black uppercase text-purple-600 tracking-widest">
                  Academic Performance
                </p>
                <div className="space-y-2 mt-2">
                  {enrollment.examScores.slice(0, 3).map((es, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-700">{es.exam?.name || `Assessment ${idx + 1}`}</span>
                      <div className="flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3" />
                        {es.score} / {es.exam?.totalMarks || 100}
                      </div>
                    </div>
                  ))}
                  {enrollment.examScores.length > 3 && (
                    <p className="text-xs text-gray-400 italic">...and {enrollment.examScores.length - 3} more assessments passed.</p>
                  )}
                </div>
              </div>
            )}

            {/* Footer row */}
            <div className="flex justify-between items-end mt-8 px-8 pt-6 border-t border-gray-100">
              <div className="text-left">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Issued On</p>
                <p className="text-base font-bold text-gray-800">{completionDate}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <ShieldCheck className="w-8 h-8 text-purple-300" />
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Verified</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Certificate ID</p>
                <p className="text-[10px] font-mono text-gray-600 max-w-[160px] break-all">{enrollmentId}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6 print:hidden">
          💡 Tip: Click <strong>Download Certificate</strong> → set Destination to <em>"Save as PDF"</em>.
        </p>
      </div>
    </div>
  );
};

export default Certificate;
