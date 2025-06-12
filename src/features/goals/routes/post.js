import { createGoal } from '../goal.controller.js';

export default (router) => {
  /**
   * @swagger
   * /goal:
   *  post:
   *   tags:
   *    - Goals
   *   summary: Create a new goal for the authenticated user
   *   description: Create a new goal with the provided details for the authenticated user
   *   security:
   *    - bearerAuth: []
   *   requestBody:
   *    required: true
   *    content:
   *     application/json:
   *      schema:
   *       $ref: '#/components/schemas/GoalInput'
   *   responses:
   *    '201':
   *     description: Goal created successfully
   *     content:
   *      application/json:
   *       schema:
   *        type: object
   *        required:
   *         - success
   *         - goal
   *        properties:
   *         success:
   *          type: boolean
   *          description: Indicates if the request was successful
   *          default: true
   *         goal:
   *          $ref: '#/components/schemas/Goal'
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.post('/', async (req, res) => {
    const user = req.user.userId;
    const goalData = req.body;

    const { success, status, errors, goal } = await createGoal(user, goalData);

    if (!success) {
      res.status(status).json({ success: false, errors });
    }

    return res.status(201).json({ success: true, goal });
  });
};
