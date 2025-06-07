import { deleteClass } from '../class.controller.js';

export default (router) => {
  /**
   * @swagger
   * /classes/{id}:
   *  delete:
   *   tags:
   *    - Classes
   *   summary: Delete a class
   *   description: Delete a class by ID for the authenticated user
   *   security:
   *    - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: id
   *      description: The ID of the class to delete
   *      required: true
   *      schema:
   *       type: string
   *       minLength: 24
   *       maxLength: 24
   *       example: 60c72b2f9b1e8d001c8e4f3a
   *   responses:
   *    '200':
   *     description: Successfully deleted the class
   *     content:
   *      application/json:
   *       schema:
   *        type: object
   *        required:
   *         - success
   *        properties:
   *         success:
   *          type: boolean
   *          description: Indicates if the request was successful
   *          default: true
   *    '404':
   *     description: Class not found
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
   *          description: Indicates if the request was successful
   *          default: false
   *         errors:
   *          type: array
   *          items:
   *           type: string
   *           description: List of error messages
   *           example: ["Class not found"]
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.delete('/:id', async (req, res) => {
    const userId = req.user.userId;
    const classId = req.params.id;

    const { success, status, errors } = await deleteClass(classId, userId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true });
  });
};
