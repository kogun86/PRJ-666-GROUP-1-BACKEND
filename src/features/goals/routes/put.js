import { updateGoal } from '../goal.controller.js';

/**
 * @swagger
 * /goal/{goalId}:
 *  put:
 *   tags:
 *    - Goals
 *   summary: Update an existing goal for the authenticated user
 *   description: Update the details of an existing goal for the authenticated user
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - in: path
 *      name: goalId
 *      description: The ID of the goal to update
 *      required: true
 *      schema:
 *       type: string
 *       example: 1234567890abcdef12345678
 *       maxLength: 24
 *       minLength: 24
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       required:
 *        - targetGrade
 *       properties:
 *        targetGrade:
 *         type: number
 *         description: The target grade for the goal
 *         example: 85
 *         minimum: 0
 *         maximum: 100
 *   responses:
 *    '200':
 *     description: Goal updated successfully
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
 *          default: true
 *         goal:
 *          $ref: '#/components/schemas/Goal'
 *    '404':
 *     description: Goal not found
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *         - success
 *         - errors
 *        properties:
 *         success:
 *          type: boolean
 *          default: false
 *         errors:
 *          type: array
 *          items:
 *           type: string
 *           example: Goal not found
 *    '401':
 *     $ref: '#/components/responses/Unauthorized'
 *    '500':
 *     $ref: '#/components/responses/InternalServerError'
 */
export default (router) => {
  router.put('/:goalId', async (req, res) => {
    const userId = req.user.userId;
    const goalId = req.params.goalId;
    const targetGrade = req.body.targetGrade;

    if (typeof targetGrade !== 'number' || targetGrade < 0 || targetGrade > 100) {
      return res.status(400).json({
        success: false,
        errors: ['Invalid target grade. It must be a number between 0 and 100.'],
      });
    }

    const { success, status, errors, goal } = await updateGoal(userId, goalId, targetGrade);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, goal });
  });
};
