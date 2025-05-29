import express from 'express';
import packageJson from '../../package.json' with { type: 'json' };

const router = express.Router();

// Health Check
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    success: true,
    version: packageJson.version,
    contributors: packageJson.contributors,
    repository: packageJson.repository.url,
  });
});

export default router;
