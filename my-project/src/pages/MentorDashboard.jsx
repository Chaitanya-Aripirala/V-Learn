import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import { Trash2, Edit3, PlusCircle, Video, BookOpen, Radio, Calendar, X, ClipboardList, Link as LinkIcon, MessageSquare, HelpCircle, Coffee, UploadCloud, CheckCircle, FileText, File, Image as ImageIcon } from 'lucide-react';

const MentorDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [earnings, setEarnings] = useState({ totalRevenue: 0, totalEnrollments: 0, payments: [] });
  const [loading, setLoading] = useState(true);


  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [liveLink, setLiveLink] = useState('');
  const [duration, setDuration] = useState('');
  const [accessPeriod, setAccessPeriod] = useState('');
  
  // Lists
  const [videos, setVideos] = useState([{ title: '', url: '', description: '', thumbnail: '' }]); 
  const [schedule, setSchedule] = useState([{ topic: '', date: '', time: '' }]);
  const [accessUnit, setAccessUnit] = useState('Days'); // Days or Months
  
  const [submitting, setSubmitting] = useState(false);
  
  // Exam Management State
  const [showExamManager, setShowExamManager] = useState(false);
  const [selectedCourseForExam, setSelectedCourseForExam] = useState(null);
  const [exams, setExams] = useState([]);
  const [examName, setExamName] = useState('');
  const [examLink, setExamLink] = useState('');
  const [examDuration, setExamDuration] = useState('');
  const [examMarks, setExamMarks] = useState('');
  const [examUnlockAt, setExamUnlockAt] = useState('');
  const [examQuestions, setExamQuestions] = useState([]); // Array of questions
  const [editingExamId, setEditingExamId] = useState(null);

  // Doubts State
  const [doubts, setDoubts] = useState([]);
  const [showDoubtResponse, setShowDoubtResponse] = useState(null); // ID of doubt being answered
  const [doubtAnswer, setDoubtAnswer] = useState('');

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [updatingBooking, setUpdatingBooking] = useState(false);

  // File Upload State
  const [uploadingFiles, setUploadingFiles] = useState({});

  // Resource Management State
  const [showResourceManager, setShowResourceManager] = useState(false);
  const [selectedCourseForResource, setSelectedCourseForResource] = useState(null);
  const [modalResources, setModalResources] = useState([]);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceLink, setNewResourceLink] = useState('');
  const [newResourceType, setNewResourceType] = useState('other');
  const [isSavingResource, setIsSavingResource] = useState(false);

  useEffect(() => {
    if (user?.role !== 'mentor') {
      navigate('/');
      return;
    }
    fetchMyCourses();
    fetchEarnings();
    fetchDoubts();
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/mentor');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingUpdate = async (id, status, meetingLink = '') => {
    setUpdatingBooking(true);
    try {
      await api.put(`/bookings/${id}`, { status, meetingLink });
      alert('Booking updated successfully!');
      fetchBookings();
    } catch (err) {
      alert('Failed to update booking');
    } finally {
      setUpdatingBooking(false);
    }
  };

  const handleFileUpload = async (e, fieldType, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set uploading state for UI feedback
    const uploadKey = index !== null ? `${fieldType}-${index}` : fieldType;
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const url = res.data.url;
      
      if (fieldType === 'modal-resources') {
        setNewResourceLink(url);
        // Auto-detect type and default name
        const fileName = file.name;
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
      } else if (fieldType === 'videoUrl' && index !== null) {
        updateVideoRow(index, 'url', url);
      }
    } catch (error) {
      alert('File upload failed. Ensure file is within limits.');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const fetchDoubts = async () => {
    try {
      const res = await api.get('/doubts/mentor');
      setDoubts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerDoubt = async (id) => {
    try {
      await api.put(`/doubts/${id}/answer`, { answer: doubtAnswer });
      setDoubtAnswer('');
      setShowDoubtResponse(null);
      fetchDoubts();
      alert('Answer sent!');
    } catch (err) {
      alert('Failed to send answer');
    }
  };


  const fetchMyCourses = async () => {
    try {
      const res = await api.get('/courses/mentor');
      setCourses(res.data);
    } catch (error) {
      console.error('Failed to fetch mentor courses', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await api.get('/payments/mentor/earnings');
      setEarnings(res.data);
    } catch (error) {
      console.error('Failed to fetch earnings', error);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to 70% quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setImage(compressed);
  };

  const handleVideoThumbnailUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file);
    updateVideoRow(index, 'thumbnail', compressed);
  };

  // Video Management Logic
  const addVideoRow = () => setVideos([...videos, { title: '', url: '', description: '', thumbnail: '' }]);
  const removeVideoRow = (index) => setVideos(videos.filter((_, i) => i !== index));
  const updateVideoRow = (index, field, value) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], [field]: value };
    setVideos(updated);
  };

  // Schedule Management
  const addScheduleField = () => setSchedule([...schedule, { topic: '', date: '', time: '' }]);
  const removeScheduleField = (index) => setSchedule(schedule.filter((_, i) => i !== index));
  const updateScheduleField = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Convert months to days if needed for the backend (or handle in backend)
    // Actually, I'll pass both and let backend decide or just pass total days
    const totalDays = accessUnit === 'Months' ? Number(accessPeriod) * 30 : Number(accessPeriod);

    const courseData = {
      title,
      description,
      category,
      tags: [category],
      price: Number(price),
      image,
      videos: videos.filter(v => v.url.trim() !== ''),
      liveLink,
      duration, 
      accessPeriod: totalDays, 
      schedule: schedule.filter(s => s.topic.trim() !== '')
    };

    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, courseData);
        alert('Course updated successfully!');
      } else {
        await api.post('/courses', courseData);
        alert('Course created successfully!');
      }
      resetForm();
      fetchMyCourses();
    } catch (error) {
      alert('Operation failed: ' + (error.response?.data?.message || 'Check all fields'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('Development');
    setPrice('');
    setImage('');
    setLiveLink('');
    setDuration('');
    setAccessPeriod('');
    setAccessUnit('Days');
    setVideos([{ title: '', url: '', description: '', thumbnail: '' }]);
    setSchedule([{ topic: '', date: '', time: '' }]);
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setTitle(course.title);
    setDescription(course.description);
    setCategory(course.category);
    setPrice(course.price);
    setImage(course.image);
    setLiveLink(course.liveLink || '');
    setDuration(course.duration || '');
    setAccessPeriod(course.accessPeriod || '');
    setAccessUnit('Days');
    setVideos(course.videos?.length > 0 ? course.videos.map(v => ({ title: '', description: '', url: '', thumbnail: '', ...v })) : [{ title: '', url: '', description: '', thumbnail: '' }]);
    setSchedule(course.schedule?.length > 0 ? course.schedule.map(s => ({ topic: '', date: '', time: '', ...s })) : [{ topic: '', date: '', time: '' }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenExamManager = async (course) => {
    setSelectedCourseForExam(course);
    setShowExamManager(true);
    fetchExams(course._id);
  };

  const handleOpenResourceManager = (course) => {
    setSelectedCourseForResource(course);
    setModalResources(course.resources || []);
    setNewResourceName('');
    setNewResourceLink('');
    setNewResourceType('other');
    setShowResourceManager(true);
  };

  const handleAddResource = () => {
    if (!newResourceLink.trim()) {
      alert('Please upload a file or paste a link first.');
      return;
    }
    const nameToUse = newResourceName.trim() || 'Untitled Resource';
    const newRes = {
      name: nameToUse,
      url: newResourceLink.trim(),
      resourceType: newResourceType
    };
    setModalResources([...modalResources, newRes]);
    
    // Reset inputs
    setNewResourceName('');
    setNewResourceLink('');
    setNewResourceType('other');
  };

  const handleRemoveResource = (indexToRemove) => {
    setModalResources(modalResources.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveResource = async () => {
    if (!selectedCourseForResource) return;
    setIsSavingResource(true);
    try {
      await api.put(`/courses/${selectedCourseForResource._id}`, {
        resources: modalResources
      });
      alert('Resources updated and published successfully!');
      setCourses(prev => prev.map(c => c._id === selectedCourseForResource._id ? { ...c, resources: modalResources } : c));
      setShowResourceManager(false);
    } catch (error) {
      alert('Failed to save resources: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSavingResource(false);
    }
  };

  const fetchExams = async (courseId) => {
    try {
      const res = await api.get(`/exams/course/${courseId}`);
      setExams(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
      const payload = {
        courseId: selectedCourseForExam._id,
        name: examName,
        link: examLink,
        duration: examDuration,
        totalMarks: examMarks,
        unlockAt: examUnlockAt,
        questions: examQuestions
      };

    try {
      if (editingExamId) {
        await api.put(`/exams/${editingExamId}`, payload);
      } else {
        await api.post('/exams', payload);
      }
      setExamName('');
      setExamLink('');
      setExamDuration('');
      setExamMarks('');
      setExamUnlockAt('');
      setExamQuestions([]);
      setEditingExamId(null);
      fetchExams(selectedCourseForExam._id);
    } catch (error) {
      alert('Exam operation failed');
    }
  };

  const deleteExam = async (id) => {
    if (!window.confirm('Delete exam?')) return;
    await api.delete(`/exams/${id}`);
    fetchExams(selectedCourseForExam._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(courses.filter(c => c._id !== id));
    } catch (error) {
      alert('Delete failed');
    }
  };

  if (!user || user.role !== 'mentor') return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-indigo-900 rounded-3xl p-10 mb-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">Mentor Dashboard</h1>
            <p className="text-indigo-200 font-medium text-lg">Manage your courses, students, and earnings from one central hub.</p>
          </div>
          {editingId && (
            <button onClick={resetForm} className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl text-sm font-bold border border-white/20 transition-all shadow-lg flex items-center gap-2">
              <X className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-8 rounded-3xl shadow-xl shadow-purple-200 hover:-translate-y-1 transition-transform group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
          <p className="text-purple-100 text-sm font-bold uppercase tracking-widest mb-3 relative z-10">Total Revenue</p>
          <h3 className="text-5xl font-black relative z-10 tracking-tight">₹{earnings.totalRevenue}</h3>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-8 rounded-3xl shadow-xl shadow-blue-200 hover:-translate-y-1 transition-transform group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
          <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-3 relative z-10">Total Enrollments</p>
          <h3 className="text-5xl font-black relative z-10 tracking-tight">{earnings.totalEnrollments}</h3>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-3xl shadow-xl shadow-gray-300 hover:-translate-y-1 transition-transform group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-3 relative z-10">Active Courses</p>
          <h3 className="text-5xl font-black relative z-10 tracking-tight">{courses.length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              {editingId ? 'Edit Course' : 'Create New Course'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Basic Info</h3>
                <input type="text" placeholder="Course Title" className="w-full border p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <textarea placeholder="Description" className="w-full border p-2 rounded" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                <div className="grid grid-cols-2 gap-4">
                  <select className="border p-2 rounded bg-white text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Development">Development</option>
                    <option value="DataScience">Data Science</option>
                    <option value="ML">Machine Learning</option>
                    <option value="CyberSecurity">Cyber Security</option>
                    <option value="IT">IT & Software</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                  </select>
                  <input type="number" placeholder="Price (₹)" className="border p-2 rounded" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Course Time (e.g. 40 hours)" className="border p-2 rounded" value={duration} onChange={(e) => setDuration(e.target.value)} />
                  <div className="flex gap-1">
                    <input type="number" placeholder="Duration" className="w-2/3 border p-2 rounded" value={accessPeriod} onChange={(e) => setAccessPeriod(e.target.value)} />
                    <select className="w-1/3 border p-2 rounded text-xs" value={accessUnit} onChange={(e) => setAccessUnit(e.target.value)}>
                      <option value="Days">Days</option>
                      <option value="Months">Months</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Main Course Thumbnail</label>
                  <input type="file" className="w-full text-xs border p-2 rounded" onChange={handleImageUpload} />
                  {image && <img src={image} className="h-10 mt-1 rounded" alt="Preview" />}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2"><Video className="w-4 h-4" /> Course Videos (Direct Upload)</h3>
                {videos.map((vid, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-gray-50 space-y-3 relative">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Upload Video File (Max 100MB)</label>
                      <div className="flex items-center gap-2">
                        <input type="file" accept="video/*" className="flex-1 text-xs border p-2 rounded bg-white" onChange={(e) => handleFileUpload(e, 'videoUrl', idx)} disabled={uploadingFiles[`videoUrl-${idx}`]} />
                        {uploadingFiles[`videoUrl-${idx}`] && <span className="text-xs text-purple-600 font-bold animate-pulse flex items-center gap-1"><UploadCloud className="w-4 h-4" /> Uploading...</span>}
                      </div>
                      {vid.url && <p className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Video Uploaded</p>}
                    </div>
                    
                    <input type="text" placeholder="Video Title" className="w-full border p-2 rounded text-xs" value={vid.title} onChange={(e) => updateVideoRow(idx, 'title', e.target.value)} />
                    <textarea placeholder="Video Description" className="w-full border p-2 rounded text-xs" value={vid.description} onChange={(e) => updateVideoRow(idx, 'description', e.target.value)} required></textarea>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Video Thumbnail</label>
                      <input type="file" accept="image/*" className="w-full text-xs border p-2 rounded" onChange={(e) => handleVideoThumbnailUpload(idx, e)} />
                      {vid.thumbnail && <img src={vid.thumbnail} className="h-8 mt-1 rounded" alt="Vid Preview" />}
                    </div>
                    {videos.length > 1 && (
                      <button type="button" onClick={() => removeVideoRow(idx)} className="absolute top-2 right-2 text-red-500"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addVideoRow} className="text-xs font-bold text-purple-600 underline">+ Add Video Row</button>
              </div>



              {(() => {
                const isAnyFileUploading = Object.values(uploadingFiles).some(status => status === true);
                return (
                  <button type="submit" disabled={submitting || isAnyFileUploading} className="w-full bg-black text-white font-bold py-3 rounded hover:bg-gray-800 disabled:opacity-50">
                    {submitting ? 'Saving...' : isAnyFileUploading ? 'Uploading Files...' : (editingId ? 'Update Course' : 'Create Course')}
                  </button>
                );
              })()}
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-12">

          {/* 1-on-1 Sessions Section */}
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Coffee className="w-6 h-6 text-indigo-600" /> 1-on-1 Sessions
              {bookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                  {bookings.filter(b => b.status === 'pending').length} NEW
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map(booking => (
                  <div key={booking._id} className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center uppercase">
                          {booking.student?.name?.[0] || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{booking.student?.name}</p>
                          <p className="text-[10px] text-gray-500">{booking.course?.title}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 font-medium">Topic: <span className="font-normal">{booking.topic}</span></p>
                      <p className="text-xs text-indigo-600 mt-1 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(booking.scheduledFor).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
                        booking.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                        booking.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                      
                      {booking.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => {
                            const link = prompt('Enter meeting link (e.g. Google Meet, Zoom):');
                            if (link) handleBookingUpdate(booking._id, 'accepted', link);
                          }} disabled={updatingBooking} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">
                            Accept & Add Link
                          </button>
                          <button onClick={() => handleBookingUpdate(booking._id, 'rejected')} disabled={updatingBooking} className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 disabled:opacity-50">
                            Decline
                          </button>
                        </div>
                      )}
                      {booking.status === 'accepted' && booking.meetingLink && (
                        <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-2">
                          <LinkIcon className="w-3 h-3" /> Meeting Link
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-gray-400 italic text-sm border-2 border-dashed rounded-xl">No 1-on-1 session requests yet.</p>
              )}
            </div>
          </div>

          {/* Doubts Section */}
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-purple-600" /> Student Doubts 
              {doubts.filter(d => !d.isResolved).length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                  {doubts.filter(d => !d.isResolved).length} NEW
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {doubts.length > 0 ? (
                doubts.map(doubt => (
                  <div key={doubt._id} className={`border rounded-2xl p-6 transition-all ${doubt.isResolved ? 'bg-gray-50 border-gray-100' : 'bg-white border-purple-100 shadow-lg shadow-purple-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700 uppercase">
                          {doubt.student?.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{doubt.student?.name}</p>
                          <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest">{doubt.course?.title}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${doubt.isResolved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {doubt.isResolved ? 'Resolved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-6 bg-white p-4 rounded-xl border border-gray-50 italic">"{doubt.question}"</p>
                    
                    {doubt.isResolved ? (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Your Response:</p>
                        <p className="text-sm text-gray-600">{doubt.answer}</p>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-gray-100">
                        {showDoubtResponse === doubt._id ? (
                          <div className="space-y-3">
                            <textarea 
                              className="w-full border p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Write your answer here..."
                              rows="3"
                              value={doubtAnswer}
                              onChange={e => setDoubtAnswer(e.target.value)}
                            ></textarea>
                            <div className="flex gap-2">
                              <button onClick={() => handleAnswerDoubt(doubt._id)} className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-all">Send Answer</button>
                              <button onClick={() => setShowDoubtResponse(null)} className="text-sm font-bold text-gray-500">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setShowDoubtResponse(doubt._id)}
                            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" /> Reply to Student
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-gray-400 italic text-sm">No student doubts yet.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-6">Your Catalog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {courses.map(course => (
                <div key={course._id} className="border rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group">
                  <CourseCard course={course} />
                  <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(course)} className="p-2 bg-white border rounded hover:bg-gray-100" title="Edit"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(course._id)} className="p-2 bg-white border rounded hover:bg-red-50 text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex gap-1 text-[10px] font-bold text-gray-500">
                      <span>{course.duration}</span>
                      <span className="mx-1">•</span>
                      <span>{course.accessPeriod} Days Access</span>
                    </div>
                  </div>
                  <div className="flex border-t">
                    <button 
                      onClick={() => handleOpenExamManager(course)}
                      className="flex-1 bg-indigo-600 text-white py-2 text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 border-r border-indigo-500"
                    >
                      <ClipboardList className="w-4 h-4" /> MANAGE EXAMS
                    </button>
                    <button 
                      onClick={() => handleOpenResourceManager(course)}
                      className="flex-1 bg-blue-600 text-white py-2 text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" /> UPLOAD RESOURCES
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exam Manager Overlay */}
        {showExamManager && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b flex items-center justify-between bg-indigo-600 text-white">
                <div>
                  <h2 className="text-xl font-bold">Exam Manager</h2>
                  <p className="text-xs opacity-80">{selectedCourseForExam.title}</p>
                </div>
                <button onClick={() => setShowExamManager(false)} className="hover:bg-white/20 p-1 rounded"><X /></button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-8">
                {/* Exam Form */}
                <form onSubmit={handleExamSubmit} className="bg-gray-50 p-4 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold uppercase text-gray-500">{editingExamId ? 'Edit Exam' : 'New Exam'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Exam Name (e.g. Midterm)" className="border p-2 rounded text-sm" value={examName} onChange={e => setExamName(e.target.value)} required />
                    <input type="text" placeholder="Duration (e.g. 60 mins)" className="border p-2 rounded text-sm" value={examDuration} onChange={e => setExamDuration(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="url" placeholder="Exam Link (Google Form/Quiz)" className="border p-2 rounded text-sm" value={examLink} onChange={e => setExamLink(e.target.value)} required />
                    <input type="number" placeholder="Total Marks" className="border p-2 rounded text-sm" value={examMarks} onChange={e => setExamMarks(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">UNLOCK EXAM AT:</label>
                    <input type="datetime-local" className="w-full border p-2 rounded text-sm" value={examUnlockAt} onChange={e => setExamUnlockAt(e.target.value)} />
                  </div>

                  {/* Quiz Questions Builder */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Quiz Questions (Optional)</h4>
                      <button 
                        type="button" 
                        onClick={() => setExamQuestions([...examQuestions, { questionText: '', options: ['', '', '', ''], correctOption: 0 }])}
                        className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-100"
                      >
                        + Add Question
                      </button>
                    </div>
                    
                    <div className="space-y-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {examQuestions.map((q, qidx) => (
                        <div key={qidx} className="bg-white p-4 rounded-xl border border-indigo-50 relative group">
                          <button 
                            type="button" 
                            onClick={() => setExamQuestions(examQuestions.filter((_, i) => i !== qidx))}
                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <input 
                            type="text" 
                            placeholder={`Question ${qidx + 1}`}
                            className="w-full border-b mb-3 py-1 font-bold text-sm outline-none focus:border-indigo-600"
                            value={q.questionText}
                            onChange={(e) => {
                              const newQs = [...examQuestions];
                              newQs[qidx].questionText = e.target.value;
                              setExamQuestions(newQs);
                            }}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, oidx) => (
                              <div key={oidx} className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name={`correct-${qidx}`} 
                                  checked={q.correctOption === oidx}
                                  onChange={() => {
                                    const newQs = [...examQuestions];
                                    newQs[qidx].correctOption = oidx;
                                    setExamQuestions(newQs);
                                  }}
                                />
                                <input 
                                  type="text" 
                                  placeholder={`Option ${oidx + 1}`}
                                  className="w-full text-xs border-b outline-none focus:border-indigo-400"
                                  value={opt}
                                  onChange={(e) => {
                                    const newQs = [...examQuestions];
                                    newQs[qidx].options[oidx] = e.target.value;
                                    setExamQuestions(newQs);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded text-sm hover:bg-indigo-700">
                      {editingExamId ? 'Update Exam' : 'Create Exam'}
                    </button>
                    {editingExamId && <button type="button" onClick={() => setEditingExamId(null)} className="px-4 border rounded text-sm">Cancel</button>}
                  </div>
                </form>

                {/* Exams List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase text-gray-500">Existing Exams</h3>
                  {exams.length > 0 ? (
                    exams.map(exam => (
                      <div key={exam._id} className="border p-4 rounded-xl flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <p className="font-bold text-gray-900">{exam.name}</p>
                          <div className="flex gap-4 text-[10px] text-gray-500 font-medium mt-1">
                            <span>{exam.duration}</span>
                            <span>{exam.totalMarks} Marks</span>
                            {exam.unlockAt && <span className="text-purple-600">Unlocks: {new Date(exam.unlockAt).toLocaleString()}</span>}
                            <a href={exam.link} target="_blank" rel="noreferrer" className="text-indigo-600 flex items-center gap-1 hover:underline"><LinkIcon className="w-3 h-3" /> View Link</a>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => {
                            setEditingExamId(exam._id);
                            setExamName(exam.name);
                            setExamLink(exam.link);
                             setExamDuration(exam.duration || '');
                             setExamMarks(exam.totalMarks || '');
                             setExamUnlockAt(exam.unlockAt ? new Date(exam.unlockAt).toISOString().slice(0, 16) : '');
                             setExamQuestions(exam.questions || []);
                           }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => deleteExam(exam._id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-10 text-gray-400 text-sm">No exams created for this course.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resource Manager Overlay */}
        {showResourceManager && selectedCourseForResource && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh]">
              <div className="p-6 border-b flex items-center justify-between bg-blue-600 text-white">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Resource Manager
                  </h2>
                  <p className="text-xs opacity-90">{selectedCourseForResource.title}</p>
                </div>
                <button onClick={() => setShowResourceManager(false)} className="hover:bg-white/20 p-2 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Current Resources List */}
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Course Resources ({modalResources.length})</h3>
                  {modalResources.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {modalResources.map((res, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex items-center justify-between gap-3 group">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl flex-shrink-0">
                              {res.resourceType === 'pdf' ? (
                                <FileText className="w-5 h-5" />
                              ) : res.resourceType === 'image' ? (
                                <ImageIcon className="w-5 h-5" />
                              ) : res.resourceType === 'link' ? (
                                <LinkIcon className="w-5 h-5" />
                              ) : res.resourceType === 'document' ? (
                                <File className="w-5 h-5" />
                              ) : (
                                <FileText className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-gray-800 truncate">{res.name}</p>
                              <a href={res.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline font-bold truncate block">
                                {res.url}
                              </a>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveResource(idx)} 
                            className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                            title="Remove resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 p-6 rounded-2xl text-center text-gray-400">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm font-bold">No resources uploaded yet</p>
                      <p className="text-xs mt-1 text-gray-400">Add resources using the form below to publish them for students.</p>
                    </div>
                  )}
                </div>

                {/* Add New Resource Form */}
                <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest">Add New Resource</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Resource Name / Display Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Lecture Notes PDF, Syllabus Sheet" 
                      className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                      value={newResourceName}
                      onChange={e => setNewResourceName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Resource Type</label>
                      <select 
                        className="w-full border border-gray-200 p-3 rounded-xl text-sm bg-white outline-none focus:border-blue-500"
                        value={newResourceType}
                        onChange={e => setNewResourceType(e.target.value)}
                      >
                        <option value="pdf">PDF Document</option>
                        <option value="image">Image Asset</option>
                        <option value="link">Web Link</option>
                        <option value="document">Office Document</option>
                        <option value="other">Other File</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Upload File</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          className="w-full border border-gray-200 p-2 rounded-xl text-xs bg-white focus:bg-white outline-none cursor-pointer"
                          onChange={(e) => handleFileUpload(e, 'modal-resources')} 
                          disabled={uploadingFiles['modal-resources']} 
                        />
                        {uploadingFiles['modal-resources'] && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-blue-600 font-bold animate-pulse">
                            Uploading...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Or Paste Link/URL</label>
                    <input 
                      type="url" 
                      placeholder="e.g. https://drive.google.com/..." 
                      className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                      value={newResourceLink} 
                      onChange={e => setNewResourceLink(e.target.value)} 
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={handleAddResource}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-blue-100"
                  >
                    <PlusCircle className="w-4 h-4" /> Add to Resources List
                  </button>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="p-6 border-t bg-gray-50 flex gap-3">
                <button 
                  onClick={handleSaveResource}
                  disabled={isSavingResource}
                  className="flex-1 bg-black hover:bg-gray-800 text-white font-black py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  {isSavingResource ? 'Saving...' : 'Save & Publish Resources'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowResourceManager(false)} 
                  className="px-6 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Enrollments Table */}
        <div className="lg:col-span-3 mt-12">
          <h2 className="text-xl font-bold mb-6">Recent Sales & Enrollments</h2>
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Course</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {earnings.payments.length > 0 ? (
                  earnings.payments.map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-bold">{p.user?.name}</p>
                        <p className="text-xs text-gray-500">{p.user?.email}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium">{p.course?.title}</p>
                      </td>
                      <td className="p-4 font-bold text-green-600">₹{p.amount}</td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-gray-400 italic">No sales yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default MentorDashboard;
