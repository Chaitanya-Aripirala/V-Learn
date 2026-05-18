import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { connectCloudinary } from './config/cloudinary.js';

// Connect to database & cloud storage
connectDB();
connectCloudinary();

const app = express();

// Body parser
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Enable CORS
app.use(cors());

// Route files
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import examRoutes from './routes/examRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import doubtRoutes from './routes/doubtRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'V-Learn Backend Server is running successfully!' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'V-Learn API is active!' });
});



import { notFound, errorHandler } from './middleware/errorMiddleware.js';

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));

