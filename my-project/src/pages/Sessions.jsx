import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Clock, Video, X, CheckCircle, XCircle, Link as LinkIcon, RefreshCw } from 'lucide-react';

const Sessions = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mentor confirm state
  const [confirmingId, setConfirmingId] = useState(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const endpoint = user?.role === 'mentor' ? '/bookings/mentor' : '/bookings/student';
      const res = await api.get(endpoint);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const handleConfirm = async (id) => {
    if (!meetingLinkInput.trim()) {
      alert('Please enter a meeting link before confirming.');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/bookings/${id}`, { status: 'Confirmed', meetingLink: meetingLinkInput });
      setConfirmingId(null);
      setMeetingLinkInput('');
      fetchBookings();
    } catch (err) {
      alert('Failed to confirm booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this booking request?')) return;
    try {
      await api.put(`/bookings/${id}`, { status: 'Cancelled' });
      fetchBookings();
    } catch (err) {
      alert('Failed to reject booking');
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Attended':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Missed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Rescheduled':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const pendingCount = bookings.filter(b => b.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 50%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-indigo-300 text-sm font-bold uppercase tracking-widest">1-on-1 Sessions</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight">
                {user?.role === 'mentor' ? 'Session Requests' : 'My Sessions'}
              </h1>
              <p className="text-indigo-300 mt-2 font-medium">
                {user?.role === 'mentor'
                  ? 'Review student appointment requests and send meeting links.'
                  : 'Track your booked sessions and join approved meetings.'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {pendingCount > 0 && (
                <div className="bg-amber-400 text-amber-900 font-black text-sm px-4 py-2 rounded-full animate-pulse">
                  {pendingCount} Pending
                </div>
              )}
              {user?.role === 'mentor' && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear all session history? This cannot be undone.')) {
                      setBookings([]);
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-all"
                >
                  Clear History
                </button>
              )}
              <button
                onClick={fetchBookings}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-xl transition-all"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">No Sessions Yet</h3>
            <p className="text-gray-500 font-medium">
              {user?.role === 'mentor'
                ? 'No students have requested a session yet.'
                : 'Book a 1-on-1 session from any enrolled course page.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className={`bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                  booking.status === 'Pending' ? 'border-amber-200' :
                  booking.status === 'Confirmed' ? 'border-emerald-200' : 'border-gray-100'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${
                        booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
                        booking.status === 'Cancelled' ? 'bg-red-50 text-red-400' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        {user?.role === 'mentor'
                          ? (booking.student?.name?.[0] || 'S')
                          : (booking.mentor?.name?.[0] || 'M')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-black text-gray-900">
                            {user?.role === 'mentor'
                              ? `${booking.student?.name}`
                              : `Session with ${booking.mentor?.name}`}
                          </p>
                          <span className={`text-[10px] font-black px-3 py-0.5 rounded-full border uppercase tracking-widest ${statusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mb-3">
                          {booking.course?.title}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Topic</p>
                            <p className="text-sm font-bold text-gray-800">{booking.topic}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Requested Date & Time</p>
                            <p className="text-sm font-bold text-gray-800">
                              {new Date(booking.scheduledFor).toLocaleDateString('en-IN', {
                                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(booking.scheduledFor).toLocaleTimeString('en-IN', {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Confirmed: show meeting link for both roles */}
                        {booking.status === 'Confirmed' && booking.meetingLink && (
                          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                            <LinkIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                            <p className="text-xs text-emerald-700 font-bold truncate flex-1">{booking.meetingLink}</p>
                            <a
                              href={booking.meetingLink.startsWith('http') ? booking.meetingLink : `https://${booking.meetingLink}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-black hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 whitespace-nowrap"
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}
                        
                        {user?.role === 'mentor' && booking.status === 'Confirmed' && (
                          <div className="mt-4 flex gap-3">
                            <button
                              onClick={async () => {
                                try {
                                  await api.put(`/bookings/${booking._id}`, { status: 'Completed' });
                                  fetchBookings();
                                } catch (err) {
                                  alert('Failed to mark as completed');
                                }
                              }}
                              className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-all"
                            >
                              Mark Completed
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await api.put(`/bookings/${booking._id}`, { status: 'Attended' });
                                  fetchBookings();
                                } catch (err) {
                                  alert('Failed to mark as attended');
                                }
                              }}
                              className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
                            >
                              Mark Attended
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await api.put(`/bookings/${booking._id}`, { status: 'Missed' });
                                  fetchBookings();
                                } catch (err) {
                                  alert('Failed to mark as missed');
                                }
                              }}
                              className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-all"
                            >
                              Mark Missed
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MENTOR ACTIONS */}
                  {user?.role === 'mentor' && booking.status === 'Pending' && (
                    <div className="mt-6 border-t border-gray-100 pt-5">
                      {confirmingId === booking._id ? (
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Meeting Link</label>
                          <input
                            type="url"
                            placeholder="https://meet.google.com/... or https://zoom.us/..."
                            className="w-full border-2 border-indigo-100 bg-indigo-50/30 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                            value={meetingLinkInput}
                            onChange={e => setMeetingLinkInput(e.target.value)}
                            autoFocus
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleConfirm(booking._id)}
                              disabled={submitting}
                              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-black hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {submitting ? 'Sending...' : 'Confirm & Send Link'}
                            </button>
                            <button
                              onClick={() => { setConfirmingId(null); setMeetingLinkInput(''); }}
                              className="px-5 bg-gray-100 text-gray-500 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => setConfirmingId(booking._id)}
                            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                          >
                            <CheckCircle className="w-4 h-4" /> Accept & Add Link
                          </button>
                          <button
                            onClick={() => handleReject(booking._id)}
                            className="flex-1 bg-white border-2 border-red-100 text-red-500 py-3 rounded-xl text-sm font-black hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;
