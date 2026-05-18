import express from 'express';
import LibraryItem from '../models/LibraryItem.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all library items
// @route   GET /api/library
router.get('/', protect, async (req, res) => {
  try {
    const items = await LibraryItem.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add item to library
// @route   POST /api/library
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'mentor') return res.status(403).json({ message: 'Only mentors can add items' });
  
  const { title, description, itemType, content } = req.body;
  try {
    const item = await LibraryItem.create({
      title,
      description,
      itemType,
      content,
      mentor: req.user._id,
      mentorName: req.user.name
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete item from library
// @route   DELETE /api/library/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    if (item.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await LibraryItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
