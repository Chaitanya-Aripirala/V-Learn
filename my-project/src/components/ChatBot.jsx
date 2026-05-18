import React, { useState, useRef, useEffect, useContext } from 'react';
import { MessageCircle, X, Send, Sparkles, BookOpen, Star } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const QUICK_CHIPS = [
  '📚 Recommend a course',
  '💳 How to enroll?',
  '🎓 My certificates',
  '📝 About exams',
  '👨‍🏫 Become a mentor',
  '⏰ Course access duration',
];

const getBotResponse = (msg, courses, user) => {
  const input = msg.toLowerCase();

  // Course recommendation intent
  if (
    input.includes('recommend') || input.includes('suggest') ||
    input.includes('course for me') || input.includes('what should i learn') ||
    input.includes('best course') || input.includes('which course')
  ) {
    const branch = user?.branch?.toLowerCase() || '';
    let matched = courses.filter(c =>
      branch && (
        c.category?.toLowerCase().includes(branch) ||
        c.title?.toLowerCase().includes(branch) ||
        c.tags?.some(t => t.toLowerCase().includes(branch))
      )
    ).slice(0, 3);

    if (matched.length === 0) {
      matched = [...courses].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
    }

    return {
      text: `Based on your profile${branch ? ` (${user.branch})` : ''}, here are my top picks for you! 🎯`,
      courses: matched,
    };
  }

  if (input.includes('hi') || input.includes('hello') || input.includes('hey')) {
    return { text: `Hello${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋 How can I help you today? Try asking me to **recommend a course** or ask about enrollment, exams, or your certificates!` };
  }
  if (input.includes('enroll') || input.includes('buy') || input.includes('purchase') || input.includes('cart')) {
    return { text: "To enroll in a course:\n1️⃣ Click on any course card\n2️⃣ Press **Add to Cart**\n3️⃣ Go to your Cart & complete checkout\n4️⃣ Your course will appear under **My Learning** instantly!" };
  }
  if (input.includes('exam') || input.includes('test') || input.includes('quiz')) {
    return { text: "📝 Exams are found inside each **Course Details** page in the *Exam Box* section. Some exams have a scheduled unlock time — look for the countdown timer. Your score appears on the leaderboard after submission!" };
  }
  if (input.includes('certificate') || input.includes('certif')) {
    return { text: "🎓 Certificates are auto-generated once you complete **80%** of a course. Go to **My Learning** → open your course → scroll down to find the **Get Certificate** button. You can download it as a PDF!" };
  }
  if (input.includes('mentor') || input.includes('teach') || input.includes('instructor')) {
    return { text: "👨‍🏫 Want to teach on V-Learn? Click **Teach on V-Learn** (visible when logged out) or go to **/mentor-register**. Mentors can create unlimited courses, add videos, set exams, and manage 1-on-1 sessions from the Mentor Dashboard!" };
  }
  if (input.includes('video') || input.includes('lesson') || input.includes('watch')) {
    return { text: "🎬 Videos are streamed directly from Cloudinary — no Drive links needed! Click on a video in the **Course Content** section to start watching. If buffering, check your internet connection." };
  }
  if (input.includes('duration') || input.includes('access') || input.includes('expire') || input.includes('how long')) {
    return { text: "⏰ Each course has a specific access duration set by the mentor (e.g., 30 days, 6 months, or lifetime). You can see your **remaining access time** on the Course Details page once enrolled." };
  }
  if (input.includes('doubt') || input.includes('question') || input.includes('ask mentor')) {
    return { text: "💬 You can ask your mentor a question from the **Course Details** page! Scroll down to the **Ask a Doubt** section, type your question, and your mentor will respond directly from their dashboard." };
  }
  if (input.includes('payment') || input.includes('price') || input.includes('fee') || input.includes('cost')) {
    return { text: "💳 Payments are processed securely via **Razorpay**. All prices are listed in ₹ (Indian Rupees). If you face any payment issue, please contact support with your Order ID." };
  }
  if (input.includes('leaderboard') || input.includes('rank') || input.includes('score')) {
    return { text: "🏆 After submitting an exam, your score and rank appear on the **Leaderboard** inside the Exam Box. You can compete with other students enrolled in the same course!" };
  }
  if (input.includes('session') || input.includes('1-on-1') || input.includes('one on one') || input.includes('booking')) {
    return { text: "📅 You can book a **1-on-1 session** with a mentor from the Course Details page. Your mentor will confirm and share a meeting link (Zoom/Google Meet). Check the **Sessions** page for your bookings!" };
  }
  if (input.includes('library') || input.includes('resource') || input.includes('pdf') || input.includes('notes')) {
    return { text: "📚 The **Virtual Library** (in the navbar) contains PDFs, notes, and useful links shared by mentors. Students can browse all resources — click **Open PDF** or **Visit Link** on any card!" };
  }
  if (input.includes('profile') || input.includes('account') || input.includes('settings')) {
    return { text: "👤 You can edit your profile by clicking your **avatar** in the top-right corner → **Edit Profile**. Update your name, profile picture, and branch/specialization." };
  }
  if (input.includes('thank')) {
    return { text: "You're welcome! 😊 Is there anything else I can help you with?" };
  }

  // Fallback: try to find course by keyword
  const matchedCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(input) || c.category?.toLowerCase().includes(input)
  ).slice(0, 3);

  if (matchedCourses.length > 0) {
    return {
      text: `I found some courses matching "**${msg}**" for you:`,
      courses: matchedCourses,
    };
  }

  return { text: "🤔 I'm not sure about that yet. Try asking me to **recommend a course**, or ask about enrollment, exams, certificates, or 1-on-1 sessions!" };
};

const ChatBot = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `Hey there! 👋 I'm **Vee**, your V-Learn AI assistant. I can recommend courses, answer questions, and help you navigate the platform. What can I do for you?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get('/courses').then(res => setCourses(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = (text) => {
    if (!text.trim() || isLoading) return;
    const userMsg = {
      role: 'user',
      content: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const reply = getBotResponse(text, courses, user);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: reply.text,
        courses: reply.courses,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setIsLoading(false);
    }, 800 + Math.random() * 400);
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans print:hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 group relative ${
          isOpen ? 'bg-gray-700 rotate-90' : 'bg-gradient-to-br from-[#7e22ce] to-indigo-600'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-7 h-7 text-white" />}
        {!isOpen && (
          <span className="absolute right-16 bg-white text-[#7e22ce] px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all border border-purple-100">
            Chat with Vee ✨
          </span>
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[370px] sm:w-[420px] h-[580px] bg-white rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden border border-gray-100">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#7e22ce] to-indigo-600 p-4 flex items-center gap-3 text-white flex-shrink-0">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 font-black text-xl shadow-inner">
              V
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-sm tracking-wide">Vee — V-Learn AI</h3>
              <p className="text-[11px] opacity-80 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse"></span>
                Online · Always here to help
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/30 to-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#7e22ce] to-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}>
                  <p
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
                  />
                  {/* Inline Course Cards */}
                  {msg.courses && msg.courses.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.courses.map(course => (
                        <div
                          key={course._id}
                          onClick={() => { navigate(`/course/${course._id}`); setIsOpen(false); }}
                          className="bg-purple-50 border border-purple-100 rounded-xl p-3 cursor-pointer hover:bg-purple-100 transition-colors flex items-center gap-3 group"
                        >
                          <img
                            src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format'}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            alt={course.title}
                            onError={e => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format'}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-gray-900 truncate group-hover:text-[#7e22ce]">{course.title}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              <span className="text-[10px] font-bold text-yellow-600">{course.rating?.toFixed(1) || '0.0'}</span>
                              <span className="text-[10px] text-gray-400 ml-1">₹{course.price}</span>
                            </div>
                          </div>
                          <BookOpen className="w-4 h-4 text-[#7e22ce] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 px-1">{msg.time}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#7e22ce] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-[#7e22ce] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-[#7e22ce] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Chips */}
          <div className="px-3 py-2 border-t border-gray-50 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0 bg-gray-50/50">
            {QUICK_CHIPS.map((chip, i) => (
              <button
                key={i}
                onClick={() => sendMessage(chip.replace(/^[^\s]+ /, ''))}
                className="whitespace-nowrap text-[10px] font-bold text-[#7e22ce] bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
            <input
              type="text"
              placeholder="Ask Vee anything..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7e22ce] focus:ring-1 focus:ring-purple-200 transition-all"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus={isOpen}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 bg-gradient-to-br from-[#7e22ce] to-indigo-600 text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all shadow-md flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
