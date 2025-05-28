import express from 'express';
import getRoutes from './get.js';
import postRoutes from './post.js';

const router = express.Router();

postRoutes(router);
getRoutes(router);

export default router;
