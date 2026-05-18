import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CourseDetails from './pages/CourseDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import Library from './pages/Library';
import Cart from './pages/Cart';
import MentorDashboard from './pages/MentorDashboard';
import MentorRegister from './pages/MentorRegister';
import EditProfile from './pages/EditProfile';
import Certificate from './pages/Certificate';
import Sessions from './pages/Sessions';

import Footer from './components/Footer';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/course/:id" element={<CourseDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mentor-register" element={<MentorRegister />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/mentor-dashboard" element={<MentorDashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/library" element={<Library />} />
            <Route path="/profile" element={<EditProfile />} />
            <Route path="/certificate/:enrollmentId" element={<Certificate />} />
            <Route path="/sessions" element={<Sessions />} />
          </Routes>
        </main>
        <Footer />
        <ChatBot />
      </div>
    </Router>
  );
}

export default App;
