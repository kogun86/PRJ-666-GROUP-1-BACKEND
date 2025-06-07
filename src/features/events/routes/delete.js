import { deleteEvent } from '../event.controller.js';

export default (router) => {
  /**
   * @swagger
   * /events/{id}:
   *  delete:
   *   tags:
   *    - Events
   *   summary: Delete an event
   *   description: Delete an event by ID for the authenticated user
   *   security:
   *    - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: id
   *      description: The ID of the event to delete
   *      required: true
   *      schema:
   *       type: string
   *       minLength: 24
   *       maxLength: 24
   *       example: 60c72b2f9b1d8c001c8e4f3a
   *   responses:
   *    '200':
   *     description: Successfully deleted the event
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
   *     description: Event not found
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
   *           example: ["Event not found"]
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.delete('/:id', async (req, res) => {
    const userId = req.user.userId;
    const eventId = req.params.id;

    const { success, status, errors } = await deleteEvent(eventId, userId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true });
  });
};
