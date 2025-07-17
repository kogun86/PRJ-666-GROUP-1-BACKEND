import { getCourses } from '../course.controller.js';

export default (router) => {
  /**
   * @swagger
   * /courses:
   *  get:
   *   tags:
   *    - Courses
   *   summary: Get courses for the authenticated user
   *   description: |
   *     Retrieve all courses for the authenticated user, filtered by their completion status. Each course includes its current grade, if available.
   *
   *     ### Example API calls:
   *     - Get active courses: `GET /api/v1/courses`
   *     - Get completed courses: `GET /api/v1/courses?active=false`
   *     - Get past courses: `GET /api/v1/courses?past=true`
   *   security:
   *    - BearerAuth: []
   *   parameters:
   *    - in: query
   *      name: active
   *      description: Filter courses by their completion status (true for active, false for completed)
   *      schema:
   *       type: boolean
   *       default: true
   *    - in: query
   *      name: past
   *      description: Filter courses that have ended (endDate < current date)
   *      schema:
   *       type: boolean
   *       default: false
   *   responses:
   *    '200':
   *      description: Successfully retrieved courses
   *      content:
   *       application/json:
   *        schema:
   *         type: object
   *         required:
   *          - success
   *          - courses
   *         properties:
   *          success:
   *           type: boolean
   *           description: Indicates if the request was successful
   *           default: true
   *          courses:
   *           type: array
   *           items:
   *            type: object
   *            $ref: '#/components/schemas/Course'
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.get('/', async (req, res) => {
    const userId = req.user.userId;
    const { active, past } = req.query;

    const { success, status, errors, courses } = await getCourses(
      userId,
      active ? JSON.parse(active) : undefined,
      past ? JSON.parse(past) : false
    );

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, courses });
  });
};
