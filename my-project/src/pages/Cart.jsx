import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';

const Cart = () => {
  const { user, removeFromCart, setUser } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        setCartItems(res.data);
      } catch (error) {
        console.error('Failed to fetch cart items', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchCart();
    }
  }, [user]);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      // Directly enroll in all courses in cart
      for (const item of cartItems) {
        await api.post('/enrollments', { courseId: item._id });
        await removeFromCart(item._id);
      }
      
      alert('Enrollment successful! You can now access your courses.');
      
      setCartItems([]); // Clear local UI
      const profile = await api.get('/auth/profile');
      setUser({ ...user, cart: [], enrolledCourses: profile.data.enrolledCourses });
      
      navigate('/my-courses');
    } catch (error) {
      alert('Failed to complete enrollment. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (courseId) => {
    await removeFromCart(courseId);
    setCartItems(cartItems.filter(item => item._id !== courseId));
  };

  if (!user) return <Navigate to="/login" />;

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black mb-10 border-b pb-6">Your Shopping Cart</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
             <span className="text-3xl">🛒</span>
          </div>
          <p className="text-gray-600 mb-6 font-medium">Your cart is empty. Keep shopping to find a course!</p>
          <button onClick={() => navigate('/')} className="bg-purple-700 text-white font-black py-3 px-8 rounded-xl hover:bg-purple-800 transition-all shadow-lg shadow-purple-100">
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item._id} className="flex gap-6 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group relative">
                <div className="w-40 h-24 shrink-0 rounded-xl overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="font-black text-gray-900 truncate hover:text-purple-700 cursor-pointer" onClick={() => navigate(`/course/${item._id}`)}>{item.title}</h3>
                  <p className="text-xs text-gray-500 font-medium mb-4">{item.instructor}</p>
                  <p className="text-xl font-black text-gray-900">₹{item.price.toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleRemove(item._id)} 
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2"
                >
                  <span className="text-sm font-bold uppercase tracking-widest">Remove</span>
                </button>
              </div>
            ))}
          </div>

          {/* Right Column: Total Bill Summary */}
          <div>
            <div className="bg-white p-8 border border-gray-100 rounded-3xl shadow-2xl shadow-gray-100/50 sticky top-24">
              <h2 className="text-xl font-black text-gray-900 mb-8 pb-4 border-b border-gray-50">Total Bill</h2>
              
              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-gray-500 font-bold text-sm uppercase tracking-wider">
                  <span>Price ({cartItems.length} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold text-sm uppercase tracking-wider">
                  <span>Discount</span>
                  <span className="text-green-600">- ₹0</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold text-sm uppercase tracking-wider pb-6 border-b border-gray-50">
                  <span>Tax (GST)</span>
                  <span className="text-[10px] bg-gray-100 px-2 py-1 rounded">INCLUDED</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-black text-gray-900">Total Amount</span>
                  <span className="text-3xl font-black text-purple-700">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout} 
                className="w-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-100 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Checkout Now
              </button>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest leading-relaxed">
                  Instant Access Guaranteed <br/>
                  Cancel anytime before course starts
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
