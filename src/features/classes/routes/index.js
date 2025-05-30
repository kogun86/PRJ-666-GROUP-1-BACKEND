import express from 'express';
import getRoutes from './get.js';

const router = express.Router();

getRoutes(router);

export default router;
