const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/stats', async (req, res) => {
  try {
    const [pendingEvents, approvedEvents, rejectedEvents, totalOrganizers] = await Promise.all([
      Event.countDocuments({ status: 'pending' }),
      Event.countDocuments({ status: 'approved' }),
      Event.countDocuments({ status: 'rejected' }),
      User.countDocuments({ role: 'organizer' }),
    ]);

    return res.status(200).json({ pendingEvents, approvedEvents, rejectedEvents, totalOrganizers });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

router.get('/events/pending', async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('organizerId', 'name email organization')
      .sort({ createdAt: -1 });
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch pending events' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const events = await Event.find(query).populate('organizerId').sort({ createdAt: -1 });
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch events' });
  }
});

router.get('/event/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch event details' });
  }
});

router.patch('/events/:id/approve', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = 'approved';
    event.rejectionReason = null;
    await event.save();
    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to approve event' });
  }
});

router.patch('/events/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = 'rejected';
    event.rejectionReason = reason;
    await event.save();
    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reject event' });
  }
});

router.get('/organizers', async (req, res) => {
  try {
    const organizers = await User.find({ role: 'organizer' }).select('name email organization orgRole');

    const organizerData = await Promise.all(
      organizers.map(async (organizer) => {
        const [totalEvents, approvedCount, rejectedCount, pendingCount] = await Promise.all([
          Event.countDocuments({ organizerId: organizer._id }),
          Event.countDocuments({ organizerId: organizer._id, status: 'approved' }),
          Event.countDocuments({ organizerId: organizer._id, status: 'rejected' }),
          Event.countDocuments({ organizerId: organizer._id, status: 'pending' }),
        ]);

        return {
          ...organizer.toObject(),
          totalEvents,
          approvedCount,
          rejectedCount,
          pendingCount,
        };
      })
    );

    return res.status(200).json(organizerData);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch organizers' });
  }
});

module.exports = router;
