import { getEvents } from '../event.controller.js';

export default (router) => {
  /**
   * @swagger
   * /events/{status}:
   *  get:
   *   tags:
   *    - Events
   *   summary: Get events for the authenticated user
   *   description: Retrieve all events for the authenticated user, filtered by their completion status
   *   security:
   *    - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: status
   *      description: Filter events by their completion status (completed or pending)
   *      required: true
   *      schema:
   *       type: string
   *       enum: [completed, pending]
   *   responses:
   *    '200':
   *     description: Successfully retrieved events
   *     content:
   *      application/json:
   *       schema:
   *        type: object
   *        required:
   *         - success
   *         - events
   *        properties:
   *         success:
   *          type: boolean
   *          description: Indicates if the request was successful
   *          default: true
   *         events:
   *          type: array
   *          items:
   *           type: object
   *           $ref: '#/components/schemas/Event'
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */

  router.get('/:status', async (req, res) => {
    const userId = req.user.userId;
    const eventStatus = req.params.status;

    const { success, status, errors, events } = await getEvents(userId, eventStatus == 'completed');

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, events });
  });
};
