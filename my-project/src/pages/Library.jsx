import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { FileText, Image as ImageIcon, Link as LinkIcon, Plus, Trash2, Download, ExternalLink, Library as LibraryIcon, X } from 'lucide-react';

const Library = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState('link');
  const [linkContent, setLinkContent] = useState('');
  const [fileContent, setFileContent] = useState([]);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const res = await api.get('/library');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setFileContent(files);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (itemType !== 'link' && fileContent.length > 0) {
        const uploadedUrls = [];
        for (let i = 0; i < fileContent.length; i++) {
          const file = fileContent[i];
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          uploadedUrls.push(uploadRes.data.url);
        }
        
        await api.post('/library', {
          title,
          description,
          itemType,
          content: uploadedUrls.join(',')
        });
      } else if (itemType === 'link') {
        const urls = linkContent.split(',').map(u => u.trim()).filter(Boolean);
        await api.post('/library', {
          title,
          description,
          itemType,
          content: urls.join(',')
        });
      }

      alert('Item added to library!');
      setShowAddModal(false);
      resetForm();
      fetchLibrary();
    } catch (err) {
      alert('Failed to add item');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setItemType('link');
    setLinkContent('');
    setFileContent([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/library/${id}`);
      fetchLibrary();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <LibraryIcon className="w-8 h-8 text-purple-700" />
               <h1 className="text-4xl font-black text-gray-900 tracking-tight">Virtual <span className="text-purple-700">Library</span></h1>
            </div>
            <p className="text-gray-500 font-medium max-w-lg">A curated knowledge base of PDFs, useful links, and technical resources shared by our expert mentors.</p>
          </div>
          {user?.role === 'mentor' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-purple-700 text-white font-black py-4 px-8 rounded-2xl hover:bg-purple-800 transition-all shadow-lg shadow-purple-100 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Contribution
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${
                      item.itemType === 'pdf' ? 'bg-red-50 text-red-600' : 
                      item.itemType === 'image' ? 'bg-blue-50 text-blue-600' : 
                      'bg-purple-50 text-purple-600'
                    }`}>
                      {item.itemType === 'pdf' ? <FileText className="w-6 h-6" /> : 
                       item.itemType === 'image' ? <ImageIcon className="w-6 h-6" /> : 
                       <LinkIcon className="w-6 h-6" />}
                    </div>
                    {user?._id === item.mentor && (
                      <button onClick={() => handleDelete(item._id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <h3 className="font-black text-gray-900 text-lg mb-2 truncate group-hover:text-purple-700 transition-colors">{item.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-6 font-medium">{item.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black text-gray-500">
                      {item.mentorName[0]}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Added by {item.mentorName}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2 max-h-40 overflow-y-auto">
                  {item.content && item.content.split(',').map((url, idx) => {
                    const isHttp = url.startsWith('http');
                    const href = isHttp ? url : (item.itemType === 'link' ? `https://${url}` : `http://localhost:5000${url}`);
                    
                    if (item.itemType === 'link') {
                      return (
                        <a 
                          key={idx}
                          href={href} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full bg-white border border-gray-200 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-between hover:bg-gray-100 transition-all truncate"
                        >
                          <span className="truncate flex-1 text-left mr-2">Link {idx + 1}</span> <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      );
                    } else {
                      return (
                        <a 
                          key={idx}
                          href={href} 
                          target="_blank" 
                          rel="noreferrer"
                          download={(item.title || 'resource').toLowerCase().includes(`.${item.itemType}`) ? item.title : `${item.title || 'resource'}.${item.itemType}`}
                          className="w-full bg-purple-700 text-white py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-between hover:bg-purple-800 transition-all shadow-md truncate"
                        >
                          <span className="truncate flex-1 text-left mr-2">{item.itemType === 'pdf' ? `Open PDF ${idx + 1}` : `View Image ${idx + 1}`}</span> <Download className="w-3 h-3 flex-shrink-0" />
                        </a>
                      );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contribution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-purple-700 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Knowledge Share</h3>
                <p className="text-purple-200 text-sm font-medium mt-1">Add a new resource to the global student library.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleAddItem} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Resource Title</label>
                  <input 
                    className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition-all font-bold" 
                    placeholder="Enter catchy title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Brief Description</label>
                  <textarea 
                    className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition-all text-sm" 
                    placeholder="What is this resource about?"
                    rows="3"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {['link', 'pdf', 'image'].map((type) => (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => setItemType(type)}
                      className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                        itemType === type ? 'bg-purple-50 border-purple-600 text-purple-700' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {itemType === 'link' ? (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">External URLs (Comma Separated)</label>
                    <input 
                      className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition-all font-mono text-xs" 
                      placeholder="https://example.com/1, https://example.com/2"
                      value={linkContent}
                      onChange={e => setLinkContent(e.target.value)}
                      required={itemType === 'link'}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Upload {itemType.toUpperCase()} (Select Multiple)</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        multiple
                        accept={itemType === 'pdf' ? '.pdf' : 'image/*'}
                        onChange={handleFileUpload}
                        className="hidden"
                        id="library-file"
                      />
                      <label 
                        htmlFor="library-file"
                        className="w-full border-2 border-dashed border-gray-200 p-8 rounded-2xl flex flex-col items-center justify-center hover:bg-gray-50 hover:border-purple-300 transition-all cursor-pointer group"
                      >
                        <Plus className="w-8 h-8 text-gray-300 group-hover:text-purple-500 mb-2" />
                        <span className="text-xs font-bold text-gray-400">
                          {fileContent.length > 0 ? `${fileContent.length} file(s) selected` : `Click to select multiple ${itemType}s`}
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-purple-700 text-white font-black py-4 rounded-2xl hover:bg-purple-800 transition-all disabled:opacity-50 shadow-xl shadow-purple-100 mt-4"
              >
                {uploading ? 'Processing Contribution...' : 'Publish to Library'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
