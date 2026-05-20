import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  HelpCircle, MessageSquare, CheckCircle, Clock, Send,
  RefreshCw, ChevronDown, ChevronUp, BookOpen, Sparkles,
  User as UserIcon, AlertCircle
} from 'lucide-react';

/* ─── helpers ─── */
const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const StatusBadge = ({ status }) => {
  const map = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    answered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${map[status] || map.pending}`}>
      {status}
    </span>
  );
};

/* ─── DoubtCard used for both student & mentor views ─── */
const DoubtCard = ({ doubt, isMentor, onReplySubmit }) => {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReplySubmit(doubt._id, replyText);
      setReplyText('');
      setExpanded(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${doubt.status === 'pending' ? 'border-amber-100' : 'border-emerald-100'}`}>
      {/* Top accent bar */}
      <div className={`h-1 w-full ${doubt.status === 'pending' ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-emerald-400 to-teal-400'}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isMentor ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {isMentor ? (doubt.student?.name?.[0] || 'S') : (doubt.mentor?.name?.[0] || 'M')}
            </div>
            <div className="min-w-0">
              <p className="font-black text-gray-900 text-sm">
                {isMentor ? doubt.student?.name : `To: ${doubt.mentor?.name}`}
              </p>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest truncate">
                {doubt.course?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={doubt.status} />
            <span className="text-[10px] text-gray-400 font-medium">{timeAgo(doubt.createdAt)}</span>
          </div>
        </div>

        {/* Question */}
        <div className="bg-gray-50 rounded-xl p-4 mb-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Question
          </p>
          <p className="text-sm font-medium text-gray-800 leading-relaxed">{doubt.question}</p>
        </div>

        {/* AI suggestion (student view only, pending only) */}
        {!isMentor && doubt.status === 'pending' && doubt.aiAnswer && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4 mb-3">
            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Tip (while you wait)
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">{doubt.aiAnswer}</p>
          </div>
        )}

        {/* Mentor's reply */}
        {doubt.status === 'answered' && doubt.answer && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-3">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Mentor Reply
            </p>
            <p className="text-sm text-gray-800 leading-relaxed font-medium">{doubt.answer}</p>
            {doubt.answeredAt && (
              <p className="text-[10px] text-emerald-500 mt-2 font-bold">Replied {timeAgo(doubt.answeredAt)}</p>
            )}
          </div>
        )}

        {/* Mentor reply box */}
        {isMentor && doubt.status === 'pending' && (
          <div className="mt-2">
            {expanded ? (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply to the student..."
                  className="w-full border-2 border-indigo-100 bg-indigo-50/30 rounded-xl p-3 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReply}
                    disabled={submitting || !replyText.trim()}
                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-black hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-100"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Sending...' : 'Send Reply'}
                  </button>
                  <button
                    onClick={() => { setExpanded(false); setReplyText(''); }}
                    className="px-5 bg-gray-100 text-gray-500 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setExpanded(true)}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
              >
                <MessageSquare className="w-4 h-4" /> Reply to Student
              </button>
            )}
          </div>
        )}

        {/* Already answered – show expand toggle for mentor */}
        {isMentor && doubt.status === 'answered' && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-2 flex items-center justify-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-wider hover:text-emerald-600 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Collapse' : 'View Full Thread'}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const Doubts = () => {
  const { user } = useContext(AuthContext);
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | answered
  const isMentor = user?.role === 'mentor';

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const endpoint = isMentor ? '/doubts/mentor' : '/doubts/student';
      const res = await api.get(endpoint);
      setDoubts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDoubts();
  }, [user]);

  const handleMentorReply = async (doubtId, answer) => {
    await api.put(`/doubts/${doubtId}/answer`, { answer });
    fetchDoubts();
  };

  const filtered = doubts.filter((d) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  const pendingCount = doubts.filter((d) => d.status === 'pending').length;
  const answeredCount = doubts.filter((d) => d.status === 'answered').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-900 text-white pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 50%, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-violet-300 text-sm font-bold uppercase tracking-widest">
                  {isMentor ? 'Student Doubts' : 'My Doubts'}
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tight">
                {isMentor ? 'Doubt Inbox' : 'Doubt & Replies'}
              </h1>
              <p className="text-indigo-300 mt-2 font-medium">
                {isMentor
                  ? 'Review and reply to your enrolled students\' questions.'
                  : 'Track your questions and get mentor replies here.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {pendingCount > 0 && (
                <div className="bg-amber-400 text-amber-900 font-black text-sm px-4 py-2 rounded-full animate-pulse">
                  {pendingCount} Pending
                </div>
              )}
              <button
                onClick={fetchDoubts}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-xl transition-all"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-2xl font-black">{doubts.length}</p>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Total Doubts</p>
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
                <p className="text-2xl font-black">{answeredCount}</p>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Answered</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="max-w-5xl mx-auto px-6 -mt-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 inline-flex gap-1">
          {['all', 'pending', 'answered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-sm font-black capitalize transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-indigo-600'}`}
            >
              {f} {f !== 'all' && `(${f === 'pending' ? pendingCount : answeredCount})`}
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
              <MessageSquare className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">
              {filter === 'all' ? 'No Doubts Yet' : `No ${filter} doubts`}
            </h3>
            <p className="text-gray-500 font-medium">
              {isMentor
                ? 'No students have submitted doubts yet.'
                : 'Ask your first question from the course page under an enrolled course.'}
            </p>
            {!isMentor && (
              <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mx-auto max-w-sm">
                <p className="text-xs text-indigo-700 font-bold flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4" />
                  Go to any enrolled course → Ask Doubt button
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((doubt) => (
              <DoubtCard
                key={doubt._id}
                doubt={doubt}
                isMentor={isMentor}
                onReplySubmit={handleMentorReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doubts;
