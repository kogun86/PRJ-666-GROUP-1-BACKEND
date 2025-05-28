import express from 'express';

import packageJson from '../../package.json' with { type: 'json' };
import { authenticate } from '../auth.js';
import apiRouter from './api/index.js';
import { createSuccessResponse } from '../utils/response.js';
const router = express.Router();
router.use('/v1', authenticate(), apiRouter);

// Health Check
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(createSuccessResponse({
    version: packageJson.version, 
    contributors: packageJson.contributors, 
    repository: packageJson.repository.url
  }));
});

export default router;
