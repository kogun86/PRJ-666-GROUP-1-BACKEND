import { deleteGoal } from '../goal.controller.js';

/**
 * @swagger
 * /goal/{goalId}:
 *  delete:
 *   tags:
 *    - Goals
 *   summary: Delete an existing goal for the authenticated user
 *   description: Delete a specific goal for the authenticated user by its ID.
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - in: path
 *      name: goalId
 *      description: The ID of the goal to delete
 *      required: true
 *      schema:
 *       type: string
 *       example: 1234567890abcdef12345678
 *       maxLength: 24
 *       minLength: 24
 *   responses:
 *    '200':
 *     description: Goal deleted successfully
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
 *          description: The deleted goal object
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
  router.delete('/:goalId', async (req, res) => {
    const userId = req.user.userId;
    const goalId = req.params.goalId;

    const { success, status, errors } = await deleteGoal(userId, goalId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(204).send();
  });
};
