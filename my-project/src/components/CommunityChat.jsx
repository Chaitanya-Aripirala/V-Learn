import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Send, Paperclip, FileText, User, X } from 'lucide-react';

const CommunityChat = ({ courseId, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/community/${courseId}`);
        setMessages(res.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [courseId]);

  useEffect(scrollToBottom, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAttachments([...attachments, { url: res.data.url, name: file.name }]);
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      const res = await api.post('/community', {
        courseId,
        message: newMessage,
        attachments,
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      alert('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Course Community
        </h3>
        <span className="text-xs opacity-60">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 opacity-50 italic">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`flex gap-3 ${msg.sender._id === user._id ? 'flex-row-reverse' : ''}`}>
              <div className="flex-shrink-0">
                {msg.sender.profilePic ? (
                  <img src={msg.sender.profilePic} alt={msg.sender.name} className="w-10 h-10 rounded-full border border-white/20 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <User size={20} />
                  </div>
                )}
              </div>
              <div className={`max-w-[70%] ${msg.sender._id === user._id ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{msg.sender.name}</span>
                  {msg.sender.role === 'mentor' && (
                    <span className="text-[8px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">MENTOR</span>
                  )}
                </div>
                <div className={`p-3 rounded-2xl shadow-sm ${
                  msg.sender._id === user._id 
                    ? 'bg-black text-white rounded-tr-none' 
                    : 'bg-white border border-gray-100 rounded-tl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.attachments.map((file, idx) => (
                        <a 
                          key={idx} 
                          href={file.url.startsWith('http') ? file.url : `${window.location.origin}${file.url}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${
                            msg.sender._id === user._id 
                              ? 'bg-white/10 hover:bg-white/20' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <FileText size={14} />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[8px] opacity-40 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/10">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-black/5 px-2 py-1 rounded-full text-[10px] border">
                <FileText size={10} />
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button type="button" onClick={() => removeAttachment(idx)} className="hover:text-red-500">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 items-center bg-gray-50 rounded-xl border p-1 focus-within:ring-2 ring-black/5 transition-all">
          <label className="p-2 cursor-pointer hover:bg-gray-200 rounded-lg transition-all">
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            <Paperclip size={20} className={uploading ? 'animate-bounce opacity-50' : 'opacity-60'} />
          </label>
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-2"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="p-2 bg-black text-white rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            disabled={(!newMessage.trim() && attachments.length === 0) || uploading}
          >
            <Send size={20} />
          </button>
        </div>
        {uploading && <p className="text-[8px] text-center mt-1 animate-pulse italic">Uploading attachment...</p>}
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};

export default CommunityChat;
