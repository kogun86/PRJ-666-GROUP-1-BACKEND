import express from 'express';
import { getEventsHandler, getUpcomingEventsHandler } from './events/get.js';
import { postEventHandler } from './events/post.js';

const router = express.Router();

// Event Routes
router.get('/events', getEventsHandler);
router.get('/events/upcoming', getUpcomingEventsHandler);
router.post('/events', postEventHandler);

// Other Routes

export default router;
