import { getCourses, getCurrentGrades } from '../course.controller.js';

export default (router) => {
  /**
   * @swagger
   * /courses:
   *  get:
   *   tags:
   *    - Courses
   *   summary: Get courses for the authenticated user
   *   description: Retrieve all courses for the authenticated user, filtered by their completion status
   *   security:
   *    - BearerAuth: []
   *   parameters:
   *    - in: query
   *      name: active
   *      description: Filter courses by their completion status (true for active, false for completed)
   *      schema:
   *       type: boolean
   *       default: true
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
    const { active } = req.query;

    const { success, status, errors, courses } = await getCourses(
      userId,
      active ? JSON.parse(active) : undefined
    );

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, courses });
  });

  /**
 * @swagger
 * /courses/grades:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get current weighted grade for each active course
 *     description: >
 *       Returns a list of all **active** courses for the authenticated user,
 *       each with the user's current weighted grade calculated from completed
 *       tasks. Courses with no graded tasks yet will have `currentGrade = null`.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved active courses with grades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - courses
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   default: true
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Course ID
 *                       code:
 *                         type: string
 *                         description: Course code
 *                       title:
 *                         type: string
 *                         description: Course title
 *                       currentGrade:
 *                         type: number
 *                         nullable: true
 *                         description: >
 *                           Weighted average grade (0‑100). Null if no graded tasks yet.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */

  router.get('/grades', async (req, res) => {
    const userId = req.user.userId;
    const { active } = req.query;
    
    const { success, status, errors, courses } = await getCurrentGrades(
      userId,
      active ? JSON.parse(active) : undefined
    );

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, courses });

  });

}