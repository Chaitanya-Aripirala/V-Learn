import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Video, BookOpen, Radio, Calendar, CheckCircle, MessageSquare, Users, Clock, ClipboardList, Trophy, Award, HelpCircle, X, Sparkles, ExternalLink, Coffee, FileText, File, Image as ImageIcon, Link as LinkIcon, UploadCloud, Trash2, Send } from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, addToCart } = useContext(AuthContext);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  
  // Exam state
  const [exams, setExams] = useState([]);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreInput, setScoreInput] = useState({}); // {examId: score}
  const [studentDoubts, setStudentDoubts] = useState([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  // Stuff for replies
  const [replyingTo, setReplyingTo] = useState(null); 
  const [replyText, setReplyText] = useState('');
  // Doubt state
  const [showDoubtModal, setShowDoubtModal] = useState(false);
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [isSendingDoubt, setIsSendingDoubt] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({}); // {examId: {questionIdx: answerIdx}}

  // Booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingTopic, setBookingTopic] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [sendingBooking, setSendingBooking] = useState(false);

  // New Course Resource management state
  const [courseResources, setCourseResources] = useState([]);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceLink, setNewResourceLink] = useState('');
  const [newResourceType, setNewResourceType] = useState('pdf');
  const [uploadingResource, setUploadingResource] = useState(false);
  const [isSavingResource, setIsSavingResource] = useState(false);

  // Helpers for Cloudinary resource URLs
  const getViewUrl = (url) => {
    if (!url) return '#';
    // For Cloudinary raw-uploaded files, ensure we use the raw delivery URL
    return url;
  };

  const getDownloadUrl = (url, name) => {
    if (!url) return '#';
    // Cloudinary does not support transformations on 'raw' files (like PDFs uploaded previously)
    if (url.includes('/raw/upload/')) {
      return url;
    }
    // For images/videos, add fl_attachment to force download
    if (url.includes('res.cloudinary.com')) {
      const safeFilename = (name || 'download').replace(/[^a-zA-Z0-9._-]/g, '_');
      return url.replace('/upload/', `/upload/fl_attachment:${safeFilename}/`);
    }
    return url;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!bookingTopic.trim() || !bookingDate || !bookingTime) {
      alert('Please fill in all fields.');
      return;
    }
    setSendingBooking(true);
    try {
      const scheduledFor = new Date(`${bookingDate}T${bookingTime}`);
      await api.post('/bookings', {
        mentorId: course.mentorId,
        courseId: course._id,
        topic: bookingTopic,
        scheduledFor
      });
      alert('Appointment request sent! Your mentor will review it soon.');
      setShowBookingModal(false);
      setBookingTopic('');
      setBookingDate('');
      setBookingTime('');
    } catch (err) {
      alert('Failed to send booking request. Please try again.');
    } finally {
      setSendingBooking(false);
    }
  };

  const handleAskDoubt = async (e) => {
    e.preventDefault();
    if (!doubtQuestion.trim()) return;
    setIsSendingDoubt(true);
    try {
      await api.post('/doubts', { 
        mentorId: course.mentorId, 
        courseId: course._id, 
        question: doubtQuestion 
      });
      alert('Your doubt has been sent to the mentor! You will receive a response soon.');
      setDoubtQuestion('');
      setShowDoubtModal(false);
      fetchStudentDoubts();
    } catch (error) {
      alert('Failed to send doubt');
    } finally {
      setIsSendingDoubt(false);
    }
  };


  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
    fetchReviews();
    if (user) fetchExams();

    // Auto-refresh course data every 30 seconds so students see new resources
    const pollInterval = setInterval(async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
      } catch (error) {
        // Silent fail for background polling
      }
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [id, user]);

  useEffect(() => {
    if (user && course) {
      fetchStudentDoubts();
    }
  }, [user, course]);

  const markVideoComplete = async (videoId) => {
    try {
      await api.put(`/enrollments/${id}/video-complete`, { videoId });
      fetchEnrollmentDetail();
      alert('Lesson marked as complete!');
    } catch (error) {
      console.error(error);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await api.get(`/exams/course/${id}`);
      setExams(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudentDoubts = async () => {
    if (!user || !course) return;
    setLoadingDoubts(true);
    try {
      const res = await api.get(`/doubts/student/course/${id}`);
      setStudentDoubts(res.data);
    } catch (error) {
      console.error('Error fetching student doubts:', error);
    } finally {
      setLoadingDoubts(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const [enrollmentData, setEnrollmentData] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (user && course) {
      const enrollment = user.enrolledCourses?.find(cId => (cId.course?._id || cId.course || cId._id || cId).toString() === course._id.toString());
      setIsEnrolled(!!enrollment);
      setIsMentor(user.role === 'mentor' && course.mentorId?.toString() === user._id.toString());
      if (enrollment) fetchEnrollmentDetail();
      fetchStudentDoubts();
    }
  }, [user, course]);

  useEffect(() => {
    if (course) {
      setCourseResources(course.resources || []);
    }
  }, [course]);

  const handleResourceFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResource(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const url = res.data.url;
      const originalName = res.data.originalName || file.name;
      setNewResourceLink(url);
      
      // Auto-detect type and default name from original filename
      const fileName = originalName;
      setNewResourceName(fileName.split('.').slice(0, -1).join('.') || fileName);
      
      const ext = fileName.split('.').pop().toLowerCase();
      if (ext === 'pdf') {
        setNewResourceType('pdf');
      } else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
        setNewResourceType('image');
      } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext)) {
        setNewResourceType('document');
      } else {
        setNewResourceType('other');
      }
      alert('File uploaded! Click "Publish to Course" to save.');
    } catch (error) {
      alert('File upload failed.');
    } finally {
      setUploadingResource(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!newResourceLink.trim()) {
      alert('Please upload a file or enter a link first.');
      return;
    }

    setIsSavingResource(true);
    const newRes = {
      name: newResourceName.trim() || 'Untitled Resource',
      url: newResourceLink.trim(),
      resourceType: newResourceType
    };
    
    const updatedResources = [...courseResources, newRes];

    try {
      await api.put(`/courses/${course._id}`, {
        resources: updatedResources
      });
      setCourseResources(updatedResources);
      setCourse(prev => ({ ...prev, resources: updatedResources }));
      
      // Clear inputs
      setNewResourceName('');
      setNewResourceLink('');
      setNewResourceType('pdf');
      alert('Resource published successfully!');
    } catch (error) {
      alert('Failed to save resource: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSavingResource(false);
    }
  };

  const handleDeleteResource = async (indexToDelete) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    const updatedResources = courseResources.filter((_, idx) => idx !== indexToDelete);
    
    try {
      await api.put(`/courses/${course._id}`, {
        resources: updatedResources
      });
      setCourseResources(updatedResources);
      setCourse(prev => ({ ...prev, resources: updatedResources }));
      alert('Resource deleted successfully.');
    } catch (error) {
      alert('Failed to delete resource: ' + (error.response?.data?.message || error.message));
    }
  };

  const generateSummary = async () => {
    setSummarizing(true);
    try {
      const res = await api.post(`/courses/${id}/summarize`);
      setAiSummary(res.data.summary);
    } catch (err) {
      alert('AI Summarizer is currently busy. Please try again later.');
    } finally {
      setSummarizing(false);
    }
  };

  const fetchEnrollmentDetail = async () => {
    try {
      const res = await api.get('/enrollments');
      const current = res.data.find(e => e.course._id === id);
      if (current) setEnrollmentData(current);
    } catch (err) {}
  };

  const calculateRemainingDays = () => {
    if (!user || !course) return null;
    const enrollment = user.enrolledCourses?.find(cId => (cId.course?._id || cId.course || cId._id || cId).toString() === course._id.toString());
    if (enrollment && enrollment.expiresAt) {
      const diff = new Date(enrollment.expiresAt) - new Date();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return null;
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(course._id);
      alert('Added to cart');
    } catch (error) {
      alert('Error adding to cart');
    }
  };

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/enrollments', { courseId: course._id });
      alert('Enrollment successful! You are now enrolled.');
      setIsEnrolled(true);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to complete enrollment');
    }
  };

  const handleReviewSubmit = async (e) => {

    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { rating, comment, courseId: course._id });
      alert('Review submitted!');
      setComment('');
      fetchReviews();
      // Also refresh course to update average rating
      const res = await api.get(`/courses/${course._id}`);
      setCourse(res.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const postReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
      await api.post(`/reviews/${reviewId}/reply`, { replyText });
      setReplyText('');
      setReplyingTo(null);
      fetchReviews(); // refresh to show new reply
    } catch (error) {
      alert("Couldn't post your reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const trimmedUrl = url.trim();

    // Handle Google Drive
    if (trimmedUrl.includes('drive.google.com')) {
      let fileId = '';
      if (trimmedUrl.includes('/file/d/')) {
        fileId = trimmedUrl.split('/file/d/')[1].split('/')[0].split('?')[0];
      } else if (trimmedUrl.includes('id=')) {
        fileId = trimmedUrl.split('id=')[1].split('&')[0];
      }
      
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    // Handle YouTube
    if (trimmedUrl.includes('youtube.com/watch?v=')) {
      const videoId = trimmedUrl.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (trimmedUrl.includes('youtu.be/')) {
      const videoId = trimmedUrl.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Default to the original logic if no matches but still try basic replacements
    return trimmedUrl.replace('/view', '/preview').replace('/edit', '/preview');
  };

  const handleScoreSubmit = async (examId) => {
    const score = scoreInput[examId];
    const examAnswers = quizAnswers[examId];
    
    // If it's a quiz (has answers selected)
    if (examAnswers && Object.keys(examAnswers).length > 0) {
      setSubmittingScore(true);
      try {
        const answersArray = Object.values(examAnswers);
        await api.post(`/exams/${examId}/submit`, { userAnswers: answersArray });
        alert('Quiz submitted! Your score has been calculated automatically.');
        fetchExams();
      } catch (error) {
        alert('Error submitting quiz');
      } finally {
        setSubmittingScore(false);
      }
      return;
    }

    // Fallback to manual score entry
    if (!score || score < 0) return alert('Enter a valid score');
    setSubmittingScore(true);
    try {
      await api.post(`/exams/${examId}/submit`, { score: Number(score) });
      alert('Score submitted successfully!');
      fetchExams(); 
    } catch (error) {
      alert('Error submitting score');
    } finally {
      setSubmittingScore(false);
    }
  };

  const isExamUnlocked = (unlockAt) => {
    if (!unlockAt) return true;
    return new Date(unlockAt) <= new Date();
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading course...</div>;
  if (!course) return <div className="p-10 text-center text-red-500">Course not found</div>;

  const remainingDays = calculateRemainingDays();

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10 mb-12">
          {/* Course Header Image */}
          <div className="lg:w-1/2">
            <img 
              src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'} 
              alt={course.title} 
              className="w-full rounded-xl shadow-lg border border-gray-100 object-cover aspect-video" 
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'; }}
            />
          </div>

          {/* Course Info */}
          <div className="lg:w-1/2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">{course.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-yellow-500 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < Math.floor(course.rating || 0) ? '★' : '☆'}</span>
                  ))}
                </div>
                <span className="text-sm font-bold text-purple-700">{course.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-sm text-gray-500">({course.numReviews || 0} reviews)</span>
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                  <span className="flex items-center gap-1 text-sm text-gray-600 font-medium"><Users className="w-4 h-4 text-blue-600" /> {course.numStudents || 0} students</span>
                  <span className="flex items-center gap-1 text-sm text-gray-600 font-medium"><Clock className="w-4 h-4 text-green-600" /> {course.duration || 'N/A'}</span>
                </div>
              </div>
              <p className="text-lg text-gray-600 mt-4">{course.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">
                {course.instructor[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{course.instructor}</p>
                <p className="text-xs text-gray-500">Expert Instructor</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-y border-gray-100">
              <div>
                <p className="text-3xl font-black text-gray-900">₹{course.price}</p>
                {remainingDays !== null ? (
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mt-1">{remainingDays} Days Left</p>
                ) : (
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wider mt-1">{course.accessPeriod || '30'} Days Access</p>
                )}
              </div>
              {isEnrolled ? (
                <div className="flex flex-col gap-3 items-end">
                  <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full border border-green-200">
                    <CheckCircle className="w-5 h-5" /> Enrolled
                  </div>
                  {enrollmentData?.progress >= 80 && (
                    <button 
                      onClick={() => navigate(`/certificate/${enrollmentData._id}`)}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-6 py-2 font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg shadow-yellow-200 flex items-center gap-2 animate-bounce"
                    >
                      <Award className="w-5 h-5" /> Get Certificate
                    </button>
                  )}
                </div>
              ) : isMentor ? (
                <div className="flex items-center gap-2 text-purple-600 font-bold bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                   <Users className="w-5 h-5" /> Course Mentor
                </div>
              ) : (
                <button 
                  onClick={handlePayment}
                  className="bg-purple-600 text-white px-10 py-4 font-bold rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all active:scale-95"
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-purple-100 mb-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
            <Sparkles className="w-24 h-24 text-purple-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">AI Course <span className="text-purple-700">Insights</span></h3>
            </div>
            
            {aiSummary ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/80 backdrop-blur-sm border border-purple-100 p-6 rounded-2xl">
                  <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-4">Key Takeaways</p>
                  <ul className="space-y-3">
                    {aiSummary.split('\n').map((point, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-gray-700 font-medium leading-relaxed">
                        <span className="text-purple-500 font-bold">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => setAiSummary('')} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-purple-600">Clear Summary</button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-sm text-gray-500 font-medium max-w-md">Get an instant AI-generated overview of the key concepts and learning outcomes of this course.</p>
                <button 
                  onClick={generateSummary}
                  disabled={summarizing}
                  className="bg-purple-700 text-white font-black py-4 px-8 rounded-2xl hover:bg-purple-800 transition-all shadow-lg shadow-purple-100 flex items-center gap-2 disabled:opacity-50"
                >
                  {summarizing ? (
                    <>Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate AI Summary</>
                  )}
                </button>
              </div>
            )}
          </div>
      </div>

      </div>

      {/* ── Interact with Mentor (enrolled students only) ── */}
      {isEnrolled && (
        <div className="mt-10 px-0">
          {/* CTA Banner */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-3xl p-8 relative overflow-hidden mb-8">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 10% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 90% 50%, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-black text-white">Interact with Your Mentor</h2>
                <p className="text-indigo-200 text-sm mt-1 font-medium">Get personal help — ask questions or book a 1-on-1 live session.</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  id="ask-doubt-btn"
                  onClick={() => setShowDoubtModal(true)}
                  className="bg-white text-indigo-700 font-black px-6 py-3 rounded-2xl hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2 active:scale-95"
                >
                  <HelpCircle className="w-5 h-5" /> Ask a Doubt
                </button>
                <button
                  id="book-session-btn"
                  onClick={() => setShowBookingModal(true)}
                  className="bg-indigo-800/60 border border-white/20 backdrop-blur-sm text-white font-black px-6 py-3 rounded-2xl hover:bg-indigo-800 transition-all shadow-lg flex items-center gap-2 active:scale-95"
                >
                  <Calendar className="w-5 h-5" /> Book 1-on-1 Session
                </button>
              </div>
            </div>
          </div>

          {/* Student Doubt History */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-violet-600" /> My Doubts for This Course
              </h3>
              <button
                onClick={fetchStudentDoubts}
                className="text-xs text-gray-400 hover:text-indigo-600 font-bold flex items-center gap-1 transition-colors"
              >
                <CheckCircle className="w-3 h-3" /> Refresh
              </button>
            </div>

            {loadingDoubts ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : studentDoubts.length === 0 ? (
              <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed">
                <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">No doubts submitted yet for this course.</p>
                <p className="text-xs text-gray-400 mt-1">Click "Ask a Doubt" above to get help from your mentor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentDoubts.map((doubt) => (
                  <div key={doubt._id} className={`border rounded-2xl overflow-hidden ${doubt.status === 'answered' ? 'border-emerald-100' : 'border-amber-100'}`}>
                    <div className={`h-1 w-full ${doubt.status === 'answered' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${
                          doubt.status === 'answered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {doubt.status}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(doubt.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {/* Question */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Your Question</p>
                        <p className="text-sm font-medium text-gray-800">{doubt.question}</p>
                      </div>
                      {/* AI tip */}
                      {doubt.status === 'pending' && doubt.aiAnswer && (
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 mb-3">
                          <p className="text-[10px] font-black text-purple-600 uppercase tracking-wider mb-1">✨ AI Tip (while you wait)</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{doubt.aiAnswer}</p>
                        </div>
                      )}
                      {/* Mentor reply */}
                      {doubt.status === 'answered' && doubt.answer && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1">✅ Mentor Reply</p>
                          <p className="text-sm text-gray-800 font-medium leading-relaxed">{doubt.answer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ASK DOUBT MODAL */}
      {showDoubtModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowDoubtModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">Ask Your Mentor</h3>
                    <p className="text-indigo-200 text-xs font-medium">{course?.instructor}</p>
                  </div>
                </div>
                <button onClick={() => setShowDoubtModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAskDoubt} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Question</label>
                <textarea
                  rows={5}
                  value={doubtQuestion}
                  onChange={(e) => setDoubtQuestion(e.target.value)}
                  placeholder="Describe your doubt clearly. Be specific about the topic or concept you're struggling with..."
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                  required
                  autoFocus
                />
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                <p className="text-xs text-indigo-700 font-medium">💡 Your mentor will receive this doubt and reply as soon as possible. You'll see the reply in the "My Doubts" section above and on the Doubts page.</p>
              </div>
              <button
                type="submit"
                disabled={isSendingDoubt || !doubtQuestion.trim()}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                {isSendingDoubt ? 'Sending...' : 'Send Doubt to Mentor'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOOK SESSION MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowBookingModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">Book 1-on-1 Session</h3>
                    <p className="text-indigo-200 text-xs font-medium">with {course?.instructor}</p>
                  </div>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Session Topic</label>
                <input
                  type="text"
                  value={bookingTopic}
                  onChange={(e) => setBookingTopic(e.target.value)}
                  placeholder="e.g. React Hooks, Career Guidance, Project Review"
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  required
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-3 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preferred Time</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-3 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs text-blue-700 font-medium">📅 Your mentor will review this request and send you a meeting link upon approval. Check the Sessions page for updates.</p>
              </div>
              <button
                type="submit"
                disabled={sendingBooking}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95"
              >
                <Video className="w-4 h-4" />
                {sendingBooking ? 'Sending Request...' : 'Send Session Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Course Content & Schedule (Enrolled Only) */}
      {isEnrolled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-10 border-t">
          
          {/* Videos & Resources */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Video className="w-6 h-6 text-purple-600" /> Learning Videos
              </h2>
              
              {activeVideo && activeVideo.url?.trim() !== '' && (
                <div className="mb-6 space-y-4">
                  <div className="rounded-xl overflow-hidden shadow-2xl bg-black aspect-video border-4 border-purple-100 flex items-center justify-center">
                    {activeVideo.url.includes('res.cloudinary.com') || activeVideo.url.includes('/api/upload') || activeVideo.url.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video controls controlsList="nodownload" className="w-full h-full object-contain bg-black" src={activeVideo.url}>
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <iframe 
                        src={getEmbedUrl(activeVideo.url)} 
                        className="w-full h-full" 
                        allow="autoplay; encrypted-media" 
                        allowFullScreen
                        title="Course Video Player"
                      ></iframe>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <a 
                      href={activeVideo.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                    >
                      Video not loading? Open in New Tab <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{activeVideo.title || 'Video Lesson'}</h3>
                      <p className="text-sm text-gray-600 mt-1">{activeVideo.description}</p>
                    </div>
                    {!enrollmentData?.completedVideos?.includes(activeVideo._id) ? (
                      <button 
                        onClick={() => markVideoComplete(activeVideo._id)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-700 transition-all flex items-center gap-2"
                      >
                        Mark as Complete
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {course.videos && course.videos.length > 0 ? (
                  course.videos.map((vid, idx) => {
                    const isCompleted = enrollmentData?.completedVideos?.includes(vid._id);
                    return (
                      <button 
                        key={idx} 
                        onClick={() => setActiveVideo(vid)}
                        className={`w-full flex items-start gap-4 p-4 border rounded-lg transition-all group ${activeVideo?.url === vid.url ? 'bg-white border-purple-600 ring-2 ring-purple-100' : 'hover:bg-purple-50 hover:border-purple-200 bg-white'}`}
                      >
                        <div className="relative">
                          <img 
                            src={vid.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=60'} 
                            className="w-24 h-16 object-cover rounded shadow-sm"
                            alt="Thumbnail"
                          />
                          {isCompleted && (
                            <div className="absolute top-1 right-1 bg-green-500 text-white p-0.5 rounded-full shadow-sm">
                              <CheckCircle className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <p className={`text-sm font-bold ${activeVideo?.url === vid.url ? 'text-purple-700' : 'text-gray-900'}`}>{vid.title || `Lesson ${idx + 1}`}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{vid.description}</p>
                        </div>
                        {activeVideo?.url === vid.url && <div className="bg-purple-600 text-white p-1 rounded-full"><CheckCircle className="w-3 h-3" /></div>}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-gray-500 italic">No videos uploaded yet.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {course.resources && course.resources.length > 0 ? (
                <div className="flex flex-col p-6 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    <span className="font-black text-blue-800 text-base uppercase tracking-wider">Course Resources</span>
                  </div>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {course.resources.map((res, idx) => (
                      <a 
                        key={idx}
                        href={res.url}
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-3 p-3 bg-white hover:bg-blue-100/50 border border-blue-100/50 rounded-xl transition-all shadow-sm group min-w-0"
                      >
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                          {res.resourceType === 'pdf' ? (
                            <FileText className="w-4 h-4" />
                          ) : res.resourceType === 'image' ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : res.resourceType === 'link' ? (
                            <LinkIcon className="w-4 h-4" />
                          ) : res.resourceType === 'document' ? (
                            <File className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-700 transition-colors">{res.name}</p>
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{res.resourceType || 'File'}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed text-center">
                  <BookOpen className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="font-bold text-gray-500">No Resources</span>
                  <span className="text-xs text-gray-400 mt-1">No study materials posted yet</span>
                </div>
              )}
              {course.liveLink && course.liveLink.trim() !== '' ? (
                <a href={course.liveLink} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-6 bg-green-50 border border-green-100 rounded-xl hover:shadow-md transition-shadow group text-center animate-in fade-in duration-300">
                  <Radio className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform animate-pulse" />
                  <span className="font-bold text-green-700">Live Class</span>
                  <span className="text-xs text-green-500 mt-1">Join the next session</span>
                </a>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed text-center">
                  <Radio className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="font-bold text-gray-500">No Live Class</span>
                  <span className="text-xs text-gray-400 mt-1">No live sessions scheduled yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Training Schedule */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-orange-600" /> Training Schedule
            </h2>
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              {course.schedule && course.schedule.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {course.schedule.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-bold text-gray-900">{item.topic}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" /> {item.date} • {item.time}
                        </p>
                      </div>
                      <div className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded">UPCOMING</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-gray-500 italic">No schedule posted yet.</div>
              )}
            </div>
          </div>

          {/* Exam Box Section */}
          <div className="lg:col-span-2 mt-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-indigo-600" /> Exam Box
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {exams.length > 0 ? (
                exams.map((exam) => {
                  const unlocked = isExamUnlocked(exam.unlockAt);
                  return (
                    <div key={exam._id} className={`bg-white border-2 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${unlocked ? 'border-indigo-50' : 'border-gray-200 opacity-80'}`}>
                      <div className="p-6 flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{exam.name}</h3>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${unlocked ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                              {unlocked ? 'ACTIVE' : 'LOCKED'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exam.duration || 'N/A'}</span>
                            <span className="flex items-center gap-1"><Award className="w-4 h-4" /> {exam.totalMarks} Total Marks</span>
                            {!unlocked && <span className="text-purple-600 font-bold">Unlocks at: {new Date(exam.unlockAt).toLocaleString()}</span>}
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            {/* Quiz / Exam Link */}
                            <button 
                              onClick={() => unlocked ? window.open(exam.link) : alert('This exam is locked until ' + new Date(exam.unlockAt).toLocaleString())}
                              className={`${unlocked ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'} text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-indigo-100 flex items-center gap-2`}
                            >
                              <Video className="w-4 h-4" /> {exam.questions?.length > 0 ? 'START QUIZ' : 'WRITE EXAM'}
                            </button>

                            {unlocked && (
                              <div className="w-full">
                                {exam.questions && exam.questions.length > 0 ? (
                                  <div className="mt-6 space-y-6 border-t pt-6">
                                    <h4 className="font-bold text-indigo-700 flex items-center gap-2"><Award className="w-4 h-4" /> Quick Quiz (Auto-Scored)</h4>
                                    {exam.questions.map((q, qidx) => (
                                      <div key={qidx} className="space-y-3">
                                        <p className="text-sm font-bold text-gray-800">{qidx + 1}. {q.questionText}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          {q.options.map((opt, oidx) => (
                                            <button 
                                              key={oidx}
                                              onClick={() => setQuizAnswers({
                                                ...quizAnswers, 
                                                [exam._id]: { ...(quizAnswers[exam._id] || {}), [qidx]: oidx }
                                              })}
                                              className={`text-left p-3 rounded-xl text-xs transition-all border ${
                                                quizAnswers[exam._id]?.[qidx] === oidx 
                                                  ? 'bg-indigo-600 border-indigo-600 text-white font-bold' 
                                                  : 'bg-white border-gray-100 hover:bg-indigo-50'
                                              }`}
                                            >
                                              {opt}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                    <button 
                                      onClick={() => handleScoreSubmit(exam._id)}
                                      disabled={submittingScore || !quizAnswers[exam._id] || Object.keys(quizAnswers[exam._id]).length < exam.questions.length}
                                      className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 mt-4"
                                    >
                                      {submittingScore ? 'Submitting...' : 'Submit Answers'}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 mt-4">
                                    <input 
                                      type="number" 
                                      placeholder="Enter Score" 
                                      className="border p-2 rounded-lg w-28 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                      value={scoreInput[exam._id] || ''}
                                      onChange={(e) => setScoreInput({...scoreInput, [exam._id]: e.target.value})}
                                    />
                                    <button 
                                      onClick={() => handleScoreSubmit(exam._id)}
                                      disabled={submittingScore}
                                      className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
                                    >
                                      {submittingScore ? 'Submitting...' : 'Submit Score'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                      {/* Leaderboard */}
                      <div className="w-full md:w-64 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Leaderboard</h4>
                        </div>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {exam.submissions && exam.submissions.length > 0 ? (
                            [...exam.submissions].sort((a, b) => b.score - a.score).map((sub, sidx) => (
                              <div key={sidx} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ${sidx === 0 ? 'bg-yellow-400 text-white' : sidx === 1 ? 'bg-gray-300 text-white' : sidx === 2 ? 'bg-orange-300 text-white' : 'text-gray-400'}`}>
                                    {sidx + 1}
                                  </span>
                                  <span className="text-xs font-medium text-gray-700 truncate w-24">{sub.userName || 'Student'}</span>
                                </div>
                                <span className="text-xs font-bold text-indigo-600">{sub.score}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-gray-400 italic text-center py-4">No results yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                    );
                  })
                ) : (
                <div className="p-10 border-2 border-dashed rounded-2xl text-center bg-gray-50">
                  <p className="text-gray-400 italic">No exams have been posted for this course yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Course Resources Section (Enrolled or Mentor Only) */}
      {(isEnrolled || isMentor) && (
        <div className="mt-12 pt-10 border-t space-y-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600 animate-pulse" /> Course Resources & Study Materials
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Resources List Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" /> Published Materials
                </h3>
                {courseResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courseResources.map((res, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/70 border border-gray-100 rounded-2xl hover:bg-purple-50/20 hover:border-purple-200 transition-all group">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="bg-white text-purple-600 p-2.5 rounded-xl border border-purple-50 flex-shrink-0 group-hover:scale-105 transition-transform">
                            {res.resourceType === 'pdf' ? (
                              <FileText className="w-4 h-4" />
                            ) : res.resourceType === 'image' ? (
                              <ImageIcon className="w-4 h-4" />
                            ) : res.resourceType === 'link' ? (
                              <LinkIcon className="w-4 h-4" />
                            ) : res.resourceType === 'document' ? (
                              <File className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-gray-800 truncate">{res.name}</p>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{res.resourceType || 'Resource'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* View button - opens in new tab */}
                          <a
                            href={getViewUrl(res.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-100 p-2 rounded-xl transition-all shadow-sm flex items-center justify-center"
                            title="View"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          {/* Download button - forces file download */}
                          <a
                            href={getDownloadUrl(res.url, res.name)}
                            target="_blank"
                            rel="noreferrer"
                            download={res.resourceType !== 'link' ? 
                              ((res.name || 'resource').toLowerCase().includes(`.${res.resourceType}`) ? res.name : `${res.name || 'resource'}.${res.resourceType === 'document' ? 'docx' : res.resourceType}`) 
                              : undefined}
                            className="bg-white hover:bg-purple-600 hover:text-white text-purple-600 border border-purple-100 p-2 rounded-xl transition-all shadow-sm flex items-center justify-center"
                            title="Download"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          </a>
                          {isMentor && (
                            <button
                              onClick={() => handleDeleteResource(idx)}
                              className="bg-red-50 hover:bg-red-600 hover:text-white text-red-600 p-2 rounded-xl transition-all border border-red-100 flex items-center justify-center"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed">
                    <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-500">No resources added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Study materials will appear here once published by the mentor.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mentor Upload Panel / Stats Card */}
            <div className="lg:col-span-1">
              {isMentor ? (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-blue-600 animate-bounce" /> Add New Resource
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Directly publish files or paste links to students.</p>
                  </div>

                  <form onSubmit={handleAddResource} className="space-y-4 font-sans">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Resource Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Lecture Notes, Cheatsheet"
                        className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition-all text-sm font-semibold"
                        value={newResourceName}
                        onChange={e => setNewResourceName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Resource Type</label>
                      <select 
                        className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition-all text-sm font-semibold"
                        value={newResourceType}
                        onChange={e => setNewResourceType(e.target.value)}
                      >
                        <option value="pdf">PDF Document (.pdf)</option>
                        <option value="image">Image Asset (.png, .jpg, .webp)</option>
                        <option value="link">Web Link / URL</option>
                        <option value="document">Office Document (.doc, .docx, .xlsx)</option>
                        <option value="other">Other File Type</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Resource Link or File</label>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          placeholder="Paste URL or upload a file..."
                          className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition-all text-xs font-semibold"
                          value={newResourceLink}
                          onChange={e => setNewResourceLink(e.target.value)}
                          required
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex-1 bg-purple-50 border border-purple-100 hover:bg-purple-100 text-purple-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95">
                            <UploadCloud className="w-4 h-4" />
                            {uploadingResource ? 'Uploading File...' : 'Choose File to Upload'}
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={handleResourceFileUpload} 
                              disabled={uploadingResource}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSavingResource || uploadingResource}
                      className="w-full bg-purple-600 text-white font-black py-3.5 rounded-2xl hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-100 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> {isSavingResource ? 'Publishing...' : 'Publish to Course'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-purple-600 text-white p-6 rounded-3xl shadow-lg shadow-purple-100 relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                    <h4 className="font-black text-lg">Resource Library</h4>
                    <p className="text-xs text-purple-100 leading-relaxed">
                      This repository contains files, documents, and reference links curated specifically for this course by your mentor. Download them to help with your exams and live practice!
                    </p>
                    <div className="pt-2 border-t border-purple-500/50 flex items-center justify-between text-xs font-bold">
                      <span>Total Assets</span>
                      <span className="bg-white/20 px-2.5 py-1 rounded-full">{courseResources.length} Files</span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.get(`/courses/${course._id}`);
                          setCourse(res.data);
                        } catch (e) { /* silent */ }
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      🔄 Refresh Resources
                    </button>
                  </div>
                  <div className="absolute -right-6 -bottom-6 text-white/5 pointer-events-none transform -rotate-12">
                    <BookOpen className="w-32 h-32" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isEnrolled && !isMentor && (
        <div className="mt-10 p-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
          <h3 className="text-xl font-bold text-gray-800">Content Locked</h3>
          <p className="text-gray-600 mt-2">Enroll in this course to access videos, exams, and the course resources.</p>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-20 pt-10 border-t">
        <h2 className="text-2xl font-bold mb-8">Student Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-xl border">
              <h3 className="font-bold mb-4">Write a Review</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Rating</label>
                    <select 
                      className="w-full border p-2 rounded bg-white" 
                      value={rating} 
                      onChange={e => setRating(e.target.value)}
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Comment</label>
                    <textarea 
                      className="w-full border p-2 rounded bg-white" 
                      rows="3" 
                      value={comment} 
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your experience..."
                      required
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="w-full bg-black text-white font-bold py-2 rounded hover:bg-gray-800 disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-gray-600 italic">Please <span className="underline cursor-pointer" onClick={() => navigate('/login')}>login</span> to leave a review.</p>
              )}
            </div>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev._id} className="border-b pb-8 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center font-bold text-purple-600 text-sm border border-purple-100">
                      {rev.user.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{rev.user.name}</p>
                      <div className="flex text-yellow-500 text-[10px]">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed ml-12">{rev.comment}</p>
                  
                  {/* Action row */}
                  <div className="ml-12 mt-3 flex items-center gap-4">
                    <span className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    {user && (
                      <button 
                        onClick={() => setReplyingTo(replyingTo === rev._id ? null : rev._id)}
                        className="text-[10px] font-bold text-purple-600 hover:underline"
                      >
                        {replyingTo === rev._id ? 'Cancel' : 'Reply'}
                      </button>
                    )}
                  </div>

                  {/* Replies List */}
                  {rev.replies && rev.replies.length > 0 && (
                    <div className="ml-12 mt-4 space-y-4 border-l-2 border-purple-50 pl-4">
                      {rev.replies.map((reply, ridx) => (
                        <div key={ridx} className="bg-white">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                              {reply.name ? reply.name[0] : 'U'}
                            </div>
                            <span className="text-xs font-bold text-gray-800">{reply.name}</span>
                            <span className="text-[9px] text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-600">{reply.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === rev._id && (
                    <div className="ml-12 mt-4">
                      <textarea 
                        className="w-full border p-2 text-sm rounded bg-gray-50 focus:bg-white transition-colors" 
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows="2"
                      ></textarea>
                      <button 
                        onClick={() => postReply(rev._id)}
                        disabled={isSendingReply}
                        className="mt-2 bg-purple-600 text-white text-[10px] font-bold px-4 py-2 rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {isSendingReply ? 'Sending...' : 'Post Reply'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic py-10 text-center">No reviews yet for this course.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetails;
