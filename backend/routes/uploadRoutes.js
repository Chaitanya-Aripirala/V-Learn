import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';
import { cloudinary } from '../config/cloudinary.js';
import streamifier from 'streamifier';
import path from 'path';

const router = express.Router();

// Use memory storage for intermediate processing
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max file size
});

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    let resource_type = 'raw'; // Default: PDFs, docs, etc. must be 'raw'
    
    if (file.mimetype.startsWith('video/')) {
      resource_type = 'video';
    } else if (file.mimetype.startsWith('image/')) {
      resource_type = 'image';
    }
    // PDFs, Word docs, Excel, PPT, ZIP, etc. → 'raw'
    // This gives a proper /raw/upload/ URL that browsers can download

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'vlearn_uploads',
        resource_type: resource_type,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// @desc    Upload file to Cloudinary
// @route   POST /api/upload
// @access  Public
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const result = await uploadToCloudinary(req.file);
    console.log('File uploaded successfully to Cloudinary:', result.secure_url);
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// @desc    Get file from MongoDB GridFS (Legacy Fallback for existing media)
// @route   GET /api/upload/media/:filename
// @access  Public
router.get('/media/:filename', async (req, res) => {
  try {
    const conn = mongoose.connection;
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'uploads'
    });

    const cursor = bucket.find({ filename: req.params.filename });
    const files = await cursor.toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];

    // Set correct headers for display/download
    res.set({
      'Content-Type': file.contentType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Cache-Control': 'public, max-age=31536000'
    });
    
    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
    
    downloadStream.on('error', (err) => {
      console.error('Stream Error:', err);
      if (!res.headersSent) {
        res.status(404).json({ message: 'Error streaming file' });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('File Access Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
