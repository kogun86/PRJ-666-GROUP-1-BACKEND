import express from 'express';
import packageJson from '../../../../package.json' with { type: 'json' };

const router = express.Router();

/**
 * @swagger
 * /:
 *  get:
 *   summary: Get health status of the API
 *   description: Returns the health status of the API, including version and contributors.
 *   responses:
 *    '200':
 *     description: Health status of the API
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *         - success
 *         - version
 *         - contributors
 *         - repository
 *        properties:
 *         success:
 *          type: boolean
 *          description: Indicates if the request was successful
 *          default: true
 *         version:
 *          type: string
 *          description: Version of the API
 *          example: "0.0.1"
 *         contributors:
 *          type: array
 *          items:
 *           type: object
 *           required:
 *            - name
 *            - email
 *            - url
 *           properties:
 *            name:
 *             type: string
 *             description: Name of the contributor
 *             example: "John Doe"
 *            email:
 *             type: string
 *             description: Email of the contributor
 *             example: example@email.com
 *            url:
 *             type: string
 *             description: GitHub URL of the contributor's profile
 *             example: https://github.com/
 *         repository:
 *          type: string
 *          description: URL of the repository
 *          example: https://github.com/
 */

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
