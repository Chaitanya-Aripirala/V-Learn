import React from 'react';
import CourseCard from './CourseCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RecommendationCarousel = ({ title, courses }) => {
  const scrollRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!courses || courses.length === 0) return null;

  return (
    <div className="my-8 relative group">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 z-10 bg-black text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {courses.map((course) => (
          <div key={course._id} className="min-w-[280px] max-w-[280px] snap-start">
            <CourseCard course={course} />
          </div>
        ))}
      </div>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 z-10 bg-black text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default RecommendationCarousel;
