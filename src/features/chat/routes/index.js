import express from 'express';
import postRoutes from './post.js';

// TODO: Refactor post routes to use a controller
const router = express.Router();
router.post('/', postRoutes);

export default router;
