const express = require('express');
const Event = require('../models/Event');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect, restrictTo('student'));

router.get('/events', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { status: 'approved' };
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const events = await Event.find(query).sort({ date: 1 });
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch events' });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, status: 'approved' });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    return res.status(200).json({
      ...event.toObject(),
      registrationCount: event.registrations.length,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch event' });
  }
});

router.post('/events/:id/register', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.status !== 'approved') {
      return res.status(404).json({ message: 'Approved event not found' });
    }

    const alreadyRegistered = event.registrations.some((userId) => userId.toString() === req.user.id.toString());
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    if (event.registrations.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event registration is full' });
    }

    event.registrations.push(req.user.id);
    await event.save();
    return res.status(200).json({ message: 'Registered successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register for event' });
  }
});

router.delete('/events/:id/register', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.registrations = event.registrations.filter((userId) => userId.toString() !== req.user.id.toString());
    await event.save();
    return res.status(200).json({ message: 'Unregistered successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to unregister from event' });
  }
});

router.get('/my-registrations', async (req, res) => {
  try {
    const events = await Event.find({ registrations: req.user.id }).sort({ date: 1 });
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    const [myRegistrations, availableEvents, upcomingSoon] = await Promise.all([
      Event.countDocuments({ registrations: req.user.id }),
      Event.countDocuments({ status: 'approved' }),
      Event.countDocuments({
        status: 'approved',
        date: { $gte: now, $lte: next7Days },
      }),
    ]);

    return res.status(200).json({ myRegistrations, availableEvents, upcomingSoon });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch student stats' });
  }
});

module.exports = router;
