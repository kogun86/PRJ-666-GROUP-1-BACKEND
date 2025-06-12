import express from 'express';
import getRoutes from './get.js';
import putRoutes from './put.js';
import postRoutes from './post.js';
import deleteRoutes from './delete.js';

const router = express.Router();

getRoutes(router);
putRoutes(router);
postRoutes(router);
deleteRoutes(router);

export default router;
