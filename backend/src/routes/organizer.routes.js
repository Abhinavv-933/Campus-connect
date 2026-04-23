const express = require('express');
const Event = require('../models/Event');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { uploadImage } = require('../config/cloudinary');

const router = express.Router();

router.use(protect, restrictTo('organizer'));

router.post('/events', uploadImage, async (req, res) => {
  try {
    const {
      title, description, category, venue, date, endDate,
      startTime, endTime, maxParticipants, imageUrl
    } = req.body;

    // Image URL: from Cloudinary upload OR from imageUrl body field
    let image = null;
    if (req.file) {
      image = req.file.path; // Cloudinary URL set by multer-storage-cloudinary
    } else if (imageUrl) {
      image = imageUrl;
    }

    const event = await Event.create({
      title,
      description,
      category,
      venue,
      date,
      endDate: endDate || null,
      startTime,
      endTime: endTime || null,
      maxParticipants: maxParticipants || 100,
      image,
      organizerId: req.user.id,
      organizerName: req.user.name,
      status: 'pending',
    });

    return res.status(201).json({ message: 'Event submitted for approval', event });
  } catch (error) {
    console.error('CREATE EVENT ERROR:', error);
    return res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
});

router.get('/events', async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = { organizerId: req.user.id };
    if (status) query.status = status;
    if (category) query.category = category;

    const [events, pending, approved, rejected, total] = await Promise.all([
      Event.find(query).sort({ createdAt: -1 }).lean(),
      Event.countDocuments({ organizerId: req.user.id, status: 'pending' }),
      Event.countDocuments({ organizerId: req.user.id, status: 'approved' }),
      Event.countDocuments({ organizerId: req.user.id, status: 'rejected' }),
      Event.countDocuments({ organizerId: req.user.id }),
    ]);

    const eventsWithCount = events.map(event => ({
      ...event,
      registrationCount: event.registrations?.length || 0,
      spotsRemaining: (event.maxParticipants || 100) - (event.registrations?.length || 0)
    }));

    return res.status(200).json({
      events: eventsWithCount,
      counts: { pending, approved, rejected, total },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch organizer events' });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizerId: req.user.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch event' });
  }
});

router.patch('/events/:id', uploadImage, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizerId: req.user.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!['pending', 'rejected'].includes(event.status)) {
      return res.status(400).json({ message: 'Only pending or rejected events can be edited' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.image = req.file.path;
    } else if (req.body.imageUrl) {
      updates.image = req.body.imageUrl;
    }

    if (event.status === 'rejected') {
      updates.status = 'pending';
      updates.rejectionReason = null;
    }

    const updatedEvent = await Event.findByIdAndUpdate(event._id, updates, { new: true, runValidators: true });
    return res.status(200).json(updatedEvent);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update event' });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizerId: req.user.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending events can be deleted' });
    }

    await Event.findByIdAndDelete(event._id);
    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete event' });
  }
});

module.exports = router;
