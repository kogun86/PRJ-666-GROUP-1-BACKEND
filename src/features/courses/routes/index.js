import express from 'express';
import getRoutes from './get.js';
import postRoutes from './post.js';
import deleteRoutes from './delete.js';

const router = express.Router();

postRoutes(router);
getRoutes(router);
deleteRoutes(router);

export default router;
