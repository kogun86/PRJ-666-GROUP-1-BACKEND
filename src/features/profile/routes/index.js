import express from 'express';
import getRoutes from './get.js';
import postRoutes from './post.js';

const router = express.Router();

getRoutes(router);
postRoutes(router);

export default router;
