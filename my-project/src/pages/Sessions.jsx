import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Calendar, Clock, Video, X, CheckCircle, XCircle,
  Link as LinkIcon, RefreshCw, ExternalLink, User as UserIcon,
  BookOpen, Send, AlertCircle, Zap
} from 'lucide-react';

/* ─── helpers ─── */
const statusConfig = {
  Pending:     { color: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  Confirmed:   { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Cancelled:   { color: 'bg-red-100 text-red-600 border-red-200',         dot: 'bg-red-500' },
  Completed:   { color: 'bg-green-100 text-green-700 border-green-200',   dot: 'bg-green-600' },
  Attended:    { color: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-500' },
  Missed:      { color: 'bg-rose-100 text-rose-700 border-rose-200',      dot: 'bg-rose-500' },
  Rescheduled: { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
});
const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

/* ─── SessionCard ─── */
const SessionCard = ({ booking, isMentor, onConfirm, onReject, onStatusChange }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [meetingLink, setMeetingLink] = useState(booking.meetingLink || '');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!meetingLink.trim()) {
      alert('Please enter a meeting link first.');
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(booking._id, meetingLink);
      setShowLinkInput(false);
    } finally {
      setSubmitting(false);
    }
  };

  const fullLink = booking.meetingLink
    ? (booking.meetingLink.startsWith('http') ? booking.meetingLink : `https://${booking.meetingLink}`)
    : null;

  const isPast = new Date(booking.scheduledFor) < new Date();

  return (
    <div className={`bg-white rounded-3xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
      booking.status === 'Pending' ? 'border-amber-200' :
      booking.status === 'Confirmed' ? 'border-emerald-200' :
      booking.status === 'Cancelled' ? 'border-red-100' : 'border-gray-100'
    }`}>
      {/* Color bar */}
      <div className={`h-1.5 w-full ${
        booking.status === 'Confirmed' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
        booking.status === 'Pending' ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
        booking.status === 'Cancelled' ? 'bg-gradient-to-r from-red-400 to-rose-400' :
        'bg-gradient-to-r from-gray-200 to-gray-300'
      }`} />

      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${
              booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
              booking.status === 'Cancelled' ? 'bg-red-50 text-red-400' :
              'bg-indigo-50 text-indigo-600'
            }`}>
              {isMentor
                ? (booking.student?.name?.[0] || 'S')
                : (booking.mentor?.name?.[0] || 'M')}
            </div>
            <div>
              <p className="font-black text-gray-900 text-base">
                {isMentor
                  ? booking.student?.name
                  : `Session with ${booking.mentor?.name}`}
              </p>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">
                {booking.course?.title}
              </p>
              {isMentor && (
                <p className="text-[10px] text-gray-400 font-medium">{booking.student?.email}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={booking.status} />
            {isPast && booking.status === 'Confirmed' && (
              <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">Past</span>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Topic</p>
            <p className="text-sm font-bold text-gray-800">{booking.topic}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />Date
            </p>
            <p className="text-sm font-bold text-gray-800">{formatDate(booking.scheduledFor)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
              <Clock className="w-3 h-3 inline mr-1" />Time
            </p>
            <p className="text-sm font-bold text-gray-800">{formatTime(booking.scheduledFor)}</p>
          </div>
        </div>

        {/* Meeting link — show for both if confirmed */}
        {booking.status === 'Confirmed' && fullLink && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-0.5">Meeting Link</p>
              <p className="text-xs text-gray-600 font-medium truncate">{booking.meetingLink}</p>
            </div>
            <a
              href={fullLink}
              target="_blank"
              rel="noreferrer"
              id={`join-btn-${booking._id}`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 whitespace-nowrap active:scale-95"
            >
              <Zap className="w-4 h-4" /> Join Meeting
            </a>
          </div>
        )}

        {/* MENTOR ACTIONS for Pending */}
        {isMentor && booking.status === 'Pending' && (
          <div className="border-t border-gray-100 pt-5">
            {showLinkInput ? (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                  <LinkIcon className="w-3 h-3 inline mr-1" />Meeting Link
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/... or https://zoom.us/..."
                  className="w-full border-2 border-indigo-100 bg-indigo-50/30 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-black hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {submitting ? 'Confirming...' : 'Confirm & Send Link'}
                  </button>
                  <button
                    onClick={() => { setShowLinkInput(false); setMeetingLink(booking.meetingLink || ''); }}
                    className="px-5 bg-gray-100 text-gray-500 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLinkInput(true)}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                >
                  <CheckCircle className="w-4 h-4" /> Accept & Add Link
                </button>
                <button
                  onClick={() => onReject(booking._id)}
                  className="flex-1 bg-white border-2 border-red-100 text-red-500 py-3 rounded-xl text-sm font-black hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            )}
          </div>
        )}

        {/* MENTOR ACTIONS for Confirmed */}
        {isMentor && booking.status === 'Confirmed' && (
          <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-2">
            <button
              onClick={() => onStatusChange(booking._id, 'Completed')}
              className="flex-1 min-w-[120px] bg-green-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-all"
            >
              ✅ Mark Completed
            </button>
            <button
              onClick={() => onStatusChange(booking._id, 'Attended')}
              className="flex-1 min-w-[120px] bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
            >
              👤 Mark Attended
            </button>
            <button
              onClick={() => onStatusChange(booking._id, 'Missed')}
              className="flex-1 min-w-[120px] bg-rose-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-rose-700 transition-all"
            >
              ❌ Mark Missed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Sessions Page ─── */
const Sessions = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const isMentor = user?.role === 'mentor';

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const endpoint = isMentor ? '/bookings/mentor' : '/bookings/student';
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

  const handleConfirm = async (id, meetingLink) => {
    await api.put(`/bookings/${id}`, { status: 'Confirmed', meetingLink });
    fetchBookings();
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this booking request?')) return;
    await api.put(`/bookings/${id}`, { status: 'Cancelled' });
    fetchBookings();
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      fetchBookings();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length;

  const filtered = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white pt-20 pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 50%, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-indigo-300 text-sm font-bold uppercase tracking-widest">
                  1-on-1 Sessions
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tight">
                {isMentor ? 'Session Requests' : 'My Sessions'}
              </h1>
              <p className="text-indigo-300 mt-2 font-medium">
                {isMentor
                  ? 'Accept requests and share meeting links with your students.'
                  : 'Book sessions from enrolled course pages and join approved meetings.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {pendingCount > 0 && (
                <div className="bg-amber-400 text-amber-900 font-black text-sm px-4 py-2 rounded-full animate-pulse">
                  {pendingCount} Pending
                </div>
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

          {/* Stats */}
          <div className="flex gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-300" />
              <div>
                <p className="text-2xl font-black">{bookings.length}</p>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Total</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-2xl font-black">{pendingCount}</p>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Pending</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-300" />
              <div>
                <p className="text-2xl font-black">{confirmedCount}</p>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Confirmed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="max-w-5xl mx-auto px-6 -mt-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 inline-flex flex-wrap gap-1">
          {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-indigo-600'}`}
            >
              {f === 'all' ? 'All' : f} {f !== 'all' && `(${bookings.filter(b => b.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">No Sessions Found</h3>
            <p className="text-gray-500 font-medium">
              {isMentor
                ? 'No students have requested a session yet.'
                : 'Book a 1-on-1 session from any enrolled course page.'}
            </p>
            {!isMentor && (
              <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mx-auto max-w-sm">
                <p className="text-xs text-indigo-700 font-bold flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4" />
                  Go to an enrolled course → Book Session button
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((booking) => (
              <SessionCard
                key={booking._id}
                booking={booking}
                isMentor={isMentor}
                onConfirm={handleConfirm}
                onReject={handleReject}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;
