import express from 'express';
import tipsRoutes from './tips.js';

const router = express.Router();

// Register the tips routes
tipsRoutes(router);

export default router;
