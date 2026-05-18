import React from 'react';
import { Mail, Globe, Info, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <Link to="/" className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-0 hover:opacity-90 transition-opacity w-max">
            <div className="w-10 h-10 bg-[#7e22ce] text-white rounded-[10px] flex items-center justify-center shadow-md mr-1">
              <span className="font-black text-2xl leading-none">V</span>
            </div>
            <span className="text-[#7e22ce]">-Learn</span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">
            The world's largest selection of courses. Empowering people through learning and connecting mentors with students worldwide.
          </p>
          <div className="flex gap-4 pt-2">
            <Globe className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            <Info className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            <MessageCircle className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-lg">V-Learn for Business</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="hover:text-white cursor-pointer transition-colors">Teach on V-Learn</li>
            <li className="hover:text-white cursor-pointer transition-colors">Get the app</li>
            <li className="hover:text-white cursor-pointer transition-colors">About us</li>
            <li className="hover:text-white cursor-pointer transition-colors">Contact us</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-lg">Resources</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
            <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
            <li className="hover:text-white cursor-pointer transition-colors">Help and Support</li>
            <li className="hover:text-white cursor-pointer transition-colors">Affiliate</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-lg">Subscribe</h4>
          <p className="text-gray-400 text-sm mb-4">Get the latest course updates and career tips.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-gray-800 border-none rounded-sm p-3 text-sm flex-1 focus:ring-1 ring-purple-500"
            />
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-sm transition-colors">
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-xs">© 2026 V-Learn, Inc. All rights reserved.</p>
        <div className="flex gap-6 text-gray-500 text-xs">
          <span className="hover:text-white cursor-pointer transition-colors">Privacy policy</span>
          <span className="hover:text-white cursor-pointer transition-colors">Cookie settings</span>
          <span className="hover:text-white cursor-pointer transition-colors">Terms of Use</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
