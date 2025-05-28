import express from 'express';
import postRoutes from './post.js';

const router = express.Router();

postRoutes(router);

export default router;
