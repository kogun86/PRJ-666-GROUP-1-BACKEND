import express from 'express';
import { getUpcomingEventsHandler, getCompletedEventsHandler } from './events/get.js';
import { postEventHandler } from './events/post.js';
import { postChatMessageHandler } from './chat/post.js';
import { patchCompletedEventHandler, patchGradeCompletedEventHandler } from './events/patch.js';

const router = express.Router();

// Event Routes
router.get('/events/upcoming', getUpcomingEventsHandler);
router.get('/events/completed', getCompletedEventsHandler);
router.post('/events', postEventHandler);

router.patch('/events/:id/grade/completed', patchCompletedEventHandler);
router.patch('/events/:id/grade', patchGradeCompletedEventHandler);

// Chat Routes
router.post('/chat', postChatMessageHandler);

// Other Routes

export default router;
