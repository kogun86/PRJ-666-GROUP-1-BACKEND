import { getClasses } from '../class.controller.js';

/**
 * @swagger
 * /classes:
 *  get:
 *   tags:
 *    - Classes
 *   summary: Get classes for the authenticated user
 *   description: Retrieve all classes for the authenticated user within a one-week period
 *   security:
 *    - BearerAuth: []
 *   responses:
 *    '200':
 *     description: Successfully retrieved classes
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *         - success
 *         - classes
 *        properties:
 *         success:
 *          type: boolean
 *          description: Indicates if the request was successful
 *          default: true
 *         classes:
 *          type: array
 *          items:
 *           type: object
 *           $ref: '#/components/schemas/Class'
 *    '401':
 *     $ref: '#/components/responses/Unauthorized'
 *    '500':
 *     $ref: '#/components/responses/InternalServerError'
 */
export default (router) => {
  router.get('/', async (req, res) => {
    const userId = req.user.userId;

    const { success, status, errors, classes } = await getClasses(userId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, classes });
  });
};
