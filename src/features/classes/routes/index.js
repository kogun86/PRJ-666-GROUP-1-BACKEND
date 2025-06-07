import express from 'express';
import getRoutes from './get.js';
import deleteRoutes from './delete.js';

const router = express.Router();

getRoutes(router);
deleteRoutes(router);

export default router;
