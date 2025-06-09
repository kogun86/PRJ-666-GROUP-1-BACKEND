import { getSmartTodo } from '../todo.controller.js';

export default (router) => {
  /**
   * @swagger
   * /smart-todo:
   *  get:
   *   tags:
   *    - Todo
   *   summary: Get smart prioritized todo list for the authenticated user
   *   description: |
   *     Retrieve a prioritized list of upcoming events for the authenticated user.
   *     Events are sorted by calculated importance score based on multiple factors:
   *     - Time left before deadline (sooner = more urgent)
   *     - Weight of the task (higher = more important)
   *     - User's current course grade (low grade = more urgent)
   *     - Course goal vs grade gap (bigger gap = more urgent for high-weight tasks)
   *
   *     ### Example API call:
   *     - Get prioritized todo list: `GET /api/v1/smart-todo`
   *   security:
   *    - BearerAuth: []
   *   responses:
   *    '200':
   *     description: Successfully retrieved prioritized todo list
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
   *           allOf:
   *            - $ref: '#/components/schemas/Event'
   *            - type: object
   *              properties:
   *               importanceScore:
   *                type: number
   *                description: Calculated importance score for prioritization
   *                format: float
   *               course:
   *                type: object
   *                $ref: '#/components/schemas/Course'
   *                description: Course details
   *       examples:
   *        Default response:
   *         value:
   *          success: true
   *          events:
   *           - _id: "60c72b2f9b1e8d001c8e4f3a"
   *             userId: "user123"
   *             title: "Assignment 1"
   *             courseID: "60c72b2f9b1e8d001c8e4f3b"
   *             type: "assignment"
   *             weight: 15
   *             grade: null
   *             isCompleted: false
   *             end: "2024-10-15T23:59:00.000Z"
   *             start: "2024-09-15T00:00:00.000Z"
   *             location: "Submit online"
   *             color: "#4A90E2"
   *             importanceScore: 75.5
   *             course:
   *              _id: "60c72b2f9b1e8d001c8e4f3b"
   *              userId: "user123"
   *              title: "Introduction to Programming"
   *              code: "IPC144"
   *              section: "A"
   *              status: "active"
   *              startDate: "2024-09-05T00:00:00.000Z"
   *              endDate: "2025-12-15T00:00:00.000Z"
   *              instructor:
   *               name: "John Smith"
   *               email: "john.smith@example.com"
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.get('/', async (req, res) => {
    const userId = req.user.userId;

    const { success, status, errors, events } = await getSmartTodo(userId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, events });
  });
};
