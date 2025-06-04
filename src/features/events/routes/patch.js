import { updateCompletionStatus, updateGrade } from '../event.controller.js';

export default (router) => {
  /**
   * @swagger
   * /{id}/grade:
   *  patch:
   *   tags:
   *    - Events
   *   summary: Update the grade of an event
   *   description: Change the grade of an event for the authenticated user
   *   security:
   *    - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: id
   *      description: The ID of the event to update
   *      required: true
   *      schema:
   *       type: string
   *       minLength: 24
   *       maxLength: 24
   *       example: 60c72b2f9b1d8c001c8e4f3a
   *   requestBody:
   *    required: true
   *    content:
   *     application/json:
   *      schema:
   *       type: object
   *       required:
   *        - grade
   *       properties:
   *        grade:
   *         type: number
   *         description: The new grade for the event
   *         format: float
   *         minimum: 0
   *         maximum: 100
   *         example: 85
   *   responses:
   *    '200':
   *     description: Successfully updated the event's grade
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
   *          description: The updated event object
   *          $ref: '#/components/schemas/Event'
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
  router.patch('/:id/grade', async (req, res) => {
    const userId = req.user.userId;
    const eventId = req.params.id;
    const grade = req.body.grade;

    const { success, status, errors, event } = await updateGrade(eventId, userId, grade);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, event });
  });

  /**
   * @swagger
   * /{id}/grade/{status}:
   *  patch:
   *   tags:
   *    - Events
   *   summary: Update the completion status of an event
   *   description: Change the completion status of an event for the authenticated user
   *   security:
   *    - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: id
   *      description: The ID of the event to update
   *      required: true
   *      schema:
   *       type: string
   *       minLength: 24
   *       maxLength: 24
   *       example: 60c72b2f9b1d8c001c8e4f3a
   *    - in: path
   *      name: status
   *      description: The new completion status of the event (completed or pending)
   *      required: true
   *      schema:
   *       type: string
   *       enum: [completed, pending]
   *   responses:
   *    '200':
   *     description: Successfully updated the event's completion status
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
   *          description: The updated event object
   *          $ref: '#/components/schemas/Event'
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
  router.patch('/:id/grade/:status', async (req, res) => {
    const userId = req.user.userId;
    const eventId = req.params.id;
    const eventStatus = req.params.status;

    const { success, status, errors, event } = await updateCompletionStatus(
      eventId,
      userId,
      eventStatus == 'completed'
    );

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, event });
  });
};
