import { getClasses } from '../class.controller.js';

/**
 * @swagger
 * /classes:
 *  get:
 *   tags:
 *    - Classes
 *   summary: Get classes for the authenticated user
 *   description: |
 *     Retrieve classes for the authenticated user with optional filtering and expansion.
 *
 *     ### Example API calls:
 *     - Get all classes: `GET /api/v1/classes`
 *     - Expand course details: `GET /api/v1/classes?expand=course`
 *     - Filter by date range: `GET /api/v1/classes?from=2023-09-01T00:00:00Z&to=2023-12-31T23:59:59Z`
 *     - Combine expansion with date filtering: `GET /api/v1/classes?expand=course&from=2023-09-01T00:00:00Z&to=2023-12-31T23:59:59Z`
 *   security:
 *    - BearerAuth: []
 *   parameters:
 *    - in: query
 *      name: from
 *      schema:
 *       type: string
 *       format: date-time
 *      description: Optional start date filter (ISO-8601 format)
 *    - in: query
 *      name: to
 *      schema:
 *       type: string
 *       format: date-time
 *      description: Optional end date filter (ISO-8601 format)
 *    - in: query
 *      name: expand
 *      schema:
 *       type: string
 *       enum: [course]
 *      description: Optional parameter to expand related data (can be combined with date filters)
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

    // Extract query parameters
    const options = {
      from: req.query.from,
      to: req.query.to,
      expand: req.query.expand,
    };

    const { success, status, errors, classes } = await getClasses(userId, options);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, classes });
  });
};
