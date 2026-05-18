import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Users, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const CourseCard = ({ course }) => {
  const { addToCart, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMentor = user?.role === 'mentor';
  const isEnrolled = user?.enrolledCourses?.some(c => 
    (c.course?._id || c.course || c._id || c).toString() === course._id.toString()
  );


  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(course._id);
      alert('Added to cart');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding to cart');
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(126,34,206,0.3)] hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full">
      <Link to={`/course/${course._id}`} className="flex flex-col h-full">
        <div className="relative overflow-hidden aspect-video">
          <img 
            src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'} 
            alt={course.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" 
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {course.category && (
            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#7e22ce] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              {course.category}
            </span>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-extrabold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-[#7e22ce] transition-colors">{course.title}</h3>
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-[#7e22ce] flex items-center justify-center text-[10px]">{course.instructor?.[0] || 'I'}</span>
            {course.instructor}
          </p>
          
          <div className="flex items-center gap-2 mb-4 mt-auto">
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
              <span className="font-bold text-sm text-yellow-700">{course.rating?.toFixed(1) || "0.0"}</span>
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
            </div>
            <span className="text-xs font-medium text-gray-400">({course.numReviews || 0} reviews)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-gray-500 mb-5 font-semibold bg-gray-50 p-2 rounded-lg">
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#7e22ce]" /> {course.numStudents || 0} enrolled</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#7e22ce]" /> {course.duration || 'Self-paced'}</span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <span className="font-black text-2xl text-gray-900">₹{course.price}</span>
            {!isMentor && (
              isEnrolled ? (
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 flex items-center gap-1">
                  Enrolled ✓
                </span>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  className="text-xs font-bold bg-[#00041a] text-white px-5 py-2.5 rounded-xl hover:bg-[#7e22ce] transition-colors shadow-md transform hover:scale-105 active:scale-95"
                >
                  Add to Cart
                </button>
              )
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
