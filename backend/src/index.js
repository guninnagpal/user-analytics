require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Event = require('./Event');

const app = express();
app.use(cors());
// sendBeacon sends text/plain, so parse that too
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

// store an event
app.post('/api/events', async (req, res) => {
  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const { session_id, type, url, timestamp, x, y, page_width, page_height } = body;
    if (!session_id || !type || !url) {
      return res.status(400).json({ error: 'session_id, type and url are required' });
    }
    if (!['page_view', 'click'].includes(type)) {
      return res.status(400).json({ error: 'invalid event type' });
    }
    if (type === 'click' && (typeof x !== 'number' || typeof y !== 'number')) {
      return res.status(400).json({ error: 'click events need numeric x and y' });
    }

    const event = await Event.create({
      session_id,
      type,
      url,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      x,
      y,
      page_width,
      page_height,
    });
    res.status(201).json({ id: event._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'could not save event' });
  }
});

// all sessions with event counts
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: '$session_id',
          event_count: { $sum: 1 },
          first_seen: { $min: '$timestamp' },
          last_seen: { $max: '$timestamp' },
        },
      },
      { $sort: { last_seen: -1 } },
      {
        $project: {
          _id: 0,
          session_id: '$_id',
          event_count: 1,
          first_seen: 1,
          last_seen: 1,
        },
      },
    ]);
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'could not fetch sessions' });
  }
});

// events of one session, in order
app.get('/api/sessions/:id/events', async (req, res) => {
  try {
    const events = await Event.find({ session_id: req.params.id })
      .sort({ timestamp: 1 })
      .lean();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'could not fetch events' });
  }
});

// distinct page urls (for the heatmap dropdown)
app.get('/api/pages', async (req, res) => {
  try {
    const urls = await Event.distinct('url');
    res.json(urls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'could not fetch pages' });
  }
});

// click data for one page
app.get('/api/heatmap', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url query param is required' });
  try {
    const clicks = await Event.find(
      { url, type: 'click' },
      { x: 1, y: 1, page_width: 1, page_height: 1, _id: 0 }
    ).lean();
    res.json(clicks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'could not fetch clicks' });
  }
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
