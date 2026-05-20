import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, ShoppingCart, Library as LibraryIcon, Video as VideoIcon, MessageSquare } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Fetch all courses once to power the search suggestions
    const fetchAll = async () => {
      try {
        const res = await api.get('/courses');
        setAllCourses(res.data);
      } catch (err) {}
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (keyword.trim().length > 1) {
      const filtered = allCourses.filter(c => 
        c.title.toLowerCase().includes(keyword.toLowerCase()) ||
        c.category.toLowerCase().includes(keyword.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [keyword, allCourses]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?search=${keyword}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4 px-6 sticky top-0 z-50 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.05)] transition-all duration-300">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
        {/* Left Section: Logo & Categories */}
        <div className="flex items-center gap-8 shrink-0">
          <Link to="/" className="text-3xl font-extrabold text-[#00041a] tracking-tight flex items-center gap-0 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-[#7e22ce] text-white rounded-[10px] flex items-center justify-center shadow-md mr-1">
              <span className="font-black text-2xl leading-none">V</span>
            </div>
            <span className="text-[#7e22ce]">-Learn</span>
          </Link>
          
          {user?.role !== 'mentor' && (
            <div className="hidden lg:block group relative">
              <button className="text-sm font-medium text-gray-600 hover:text-purple-700 py-2 transition-colors">
                Categories
              </button>
              <div className="absolute left-0 top-full bg-white border border-gray-100 shadow-xl rounded-md hidden group-hover:block w-56 py-2">
                <Link to="/?category=Development" className="block px-6 py-2 hover:bg-gray-50 text-sm font-medium">Development</Link>
                <Link to="/?category=DataScience" className="block px-6 py-2 hover:bg-gray-50 text-sm font-medium">Data Science</Link>
                <Link to="/?category=ML" className="block px-6 py-2 hover:bg-gray-50 text-sm font-medium">Machine Learning</Link>
                <Link to="/?category=CyberSecurity" className="block px-6 py-2 hover:bg-gray-50 text-sm font-medium">Cyber Security</Link>
                <Link to="/?category=IT" className="block px-6 py-2 hover:bg-gray-50 text-sm font-medium">IT & Software</Link>
                <Link to="/?category=Mechanical" className="block px-6 py-2 hover:bg-gray-50 text-sm font-medium">Mechanical</Link>
                <Link to="/?category=Business" className="block px-6 py-2 hover:bg-gray-50 text-sm font-medium">Business</Link>
                <Link to="/?category=Design" className="block px-6 py-2 hover:bg-gray-50 text-sm font-medium">Design</Link>
              </div>
            </div>
          )}
        </div>

        {/* Center Section: Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-3xl relative">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search for anything..." 
              className="w-full bg-gray-50 border border-gray-300 rounded-full py-2.5 pl-14 pr-4 text-sm text-gray-900 focus:outline-none focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onFocus={() => keyword.length > 1 && setShowSuggestions(true)}
            />
            <button 
              type="submit"
              className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors group-focus-within:text-gray-900"
            >
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
            </button>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 shadow-2xl rounded-2xl mt-2 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map(course => (
                  <div 
                    key={course._id} 
                    onMouseDown={(e) => {
                      // Prevent onBlur from hiding suggestions before navigate
                      e.preventDefault();
                      navigate(`/course/${course._id}`);
                      setKeyword('');
                      setShowSuggestions(false);
                    }}
                    className="px-6 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-3 h-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">{course.title}</span>
                    </div>
                    <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded font-bold uppercase">{course.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-5 shrink-0">
          {user?.role !== 'mentor' && (
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-all group">
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-purple-700" />
              {user?.cart?.length > 0 && (
                <span className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                  {user.cart.length}
                </span>
              )}
            </Link>
          )}

          {!user && (
            <Link to="/mentor-register" className="hidden xl:block text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors">
              Teach on V-Learn
            </Link>
          )}

          {user ? (

            <div className="flex items-center gap-6">
              <Link to="/library" className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-purple-600 transition-colors">
                <LibraryIcon className="w-4 h-4" /> Library
              </Link>
              <Link to="/sessions" className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors">
                <VideoIcon className="w-4 h-4" /> Sessions
              </Link>
              <Link to="/doubts" className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-violet-600 transition-colors">
                <MessageSquare className="w-4 h-4" /> Doubts
              </Link>
              <Link to={user.role === 'mentor' ? '/mentor-dashboard' : '/my-courses'} className="text-sm font-semibold text-gray-700 hover:text-purple-700 transition-colors">
                {user.role === 'mentor' ? 'Instructor Dashboard' : 'My Learning'}
              </Link>
              <div className="group relative py-2">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center font-bold text-white overflow-hidden cursor-pointer hover:opacity-90 border border-gray-100 shadow-sm">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="uppercase text-sm">{user.name[0]}</span>
                  )}
                </div>
                <div className="absolute right-0 top-full bg-white border border-gray-100 shadow-2xl rounded-xl hidden group-hover:block w-64 py-3 mt-1">
                  <div className="px-5 py-3 border-b border-gray-50 mb-2">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link to="/profile" className="block px-5 py-2 hover:bg-gray-50 text-sm text-gray-700 font-medium">Edit profile</Link>
                  <button onClick={handleLogout} className="w-full text-left px-5 py-2 hover:bg-gray-50 text-sm text-red-600 font-medium">Log out</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-bold border border-gray-900 px-5 py-2.5 hover:bg-gray-50 transition-all">Log in</Link>
              <Link to="/register" className="text-sm font-bold bg-gray-900 text-white px-5 py-2.5 hover:bg-gray-800 transition-all shadow-sm">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
