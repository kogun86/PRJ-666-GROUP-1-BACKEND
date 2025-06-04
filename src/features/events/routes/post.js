import { createEvent } from '../event.controller.js';

export default (router) => {
  /**
   * @swagger
   * /events:
   *  post:
   *   tags:
   *    - Events
   *   summary: Create a new event
   *   description: Create a new event for the authenticated user
   *   security:
   *    - BearerAuth: []
   *   requestBody:
   *    required: true
   *    content:
   *     application/json:
   *      schema:
   *       type: object
   *       $ref: '#/components/schemas/EventInput'
   *   responses:
   *    '201':
   *     description: Successfully created the event
   *     content:
   *      application/json:
   *       schema:
   *        type: object
   *        required:
   *         - success
   *         - event
   *        properties:
   *         success:
   *          type: boolean
   *          description: Indicates if the request was successful
   *          default: true
   *         event:
   *          type: object
   *          description: The created event object
   *          $ref: '#/components/schemas/Event'
   *    '400':
   *     description: Bad request due to validation errors
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
   *           description: List of validation error messages
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.post('/', async (req, res) => {
    const userId = req.user.userId;
    const eventData = req.body;

    const { success, status, errors, event } = await createEvent(userId, eventData);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(201).json({ success: true, event });
  });
};
