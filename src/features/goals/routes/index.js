import express from 'express';
import getRoutes from './get.js';
import patchRoutes from './patch.js';
import postRoutes from './post.js';
import deleteRoutes from './delete.js';

const router = express.Router();

getRoutes(router);
patchRoutes(router);
postRoutes(router);
deleteRoutes(router);

export default router;
