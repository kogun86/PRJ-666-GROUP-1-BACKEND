import { getGoalReport, getGoals } from '../goal.controller.js';

export default (router) => {
  /**
   * @swagger
   * /goal:
   *  get:
   *   tags:
   *    - Goals
   *   summary: Get all goals for the authenticated user
   *   description: Retrieve all goals associated with the authenticated user.
   *   security:
   *    - bearerAuth: []
   *   parameters:
   *    - in: path
   *      name: expandCourse
   *      schema:
   *       type: boolean
   *       description: Whether to expand course details in the response
   *   responses:
   *    '200':
   *     description: Successfully retrieved goals
   *     content:
   *      application/json:
   *       schema:
   *        type: object
   *        required:
   *         - success
   *         - goals
   *        properties:
   *         success:
   *          type: boolean
   *          description: Indicates if the request was successful
   *          default: true
   *         goals:
   *          type: array
   *          items:
   *            oneOf:
   *             - $ref: '#/components/schemas/Goal'
   *             - $ref: '#/components/schemas/GoalExpanded'
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.get('/', async (req, res) => {
    const userId = req.user.userId;

    const { success, status, errors, goals } = await getGoals(userId, {
      expandCourse: false,
    });

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, goals });
  });

  // Swagger Documentation for report endpoint

  router.get('/:goalId/report', async (req, res) => {
    const userId = req.user.userId;
    const {success, status, errors, report} = await getGoalReport(userId, req.params.goalId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, report });
  });
};
