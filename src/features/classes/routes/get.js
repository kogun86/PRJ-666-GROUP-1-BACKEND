import { getClasses } from '../class.controller.js';

/**
 * @swagger
 * /classes:
 *  get:
 *   tags:
 *    - Classes
 *   summary: Get classes for the authenticated user
 *   description: |
 *     Retrieve classes for the authenticated user with optional filtering and expansion.
 *
 *     ### Example API calls:
 *     - Get all classes: `GET /api/v1/classes`
 *     - Expand course details: `GET /api/v1/classes?expand=course`
 *     - Filter by date range: `GET /api/v1/classes?from=2023-09-01T00:00:00Z&to=2023-12-31T23:59:59Z`
 *     - Combine expansion with date filtering: `GET /api/v1/classes?expand=course&from=2023-09-01T00:00:00Z&to=2023-12-31T23:59:59Z`
 *   security:
 *    - BearerAuth: []
 *   parameters:
 *    - in: query
 *      name: from
 *      schema:
 *       type: string
 *       format: date-time
 *      description: Optional start date filter (ISO-8601 format)
 *    - in: query
 *      name: to
 *      schema:
 *       type: string
 *       format: date-time
 *      description: Optional end date filter (ISO-8601 format)
 *    - in: query
 *      name: expand
 *      schema:
 *       type: string
 *       enum: [course]
 *      description: Optional parameter to expand related data (can be combined with date filters)
 *   responses:
 *    '200':
 *     description: Successfully retrieved classes
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *         - success
 *         - classes
 *        properties:
 *         success:
 *          type: boolean
 *          description: Indicates if the request was successful
 *          default: true
 *         classes:
 *          type: array
 *          items:
 *           type: object
 *           $ref: '#/components/schemas/Class'
 *           properties:
 *            courseId:
 *             type: object
 *             $ref: '#/components/schemas/Course'
 *             description: Course details (only included when expand=course is specified)
 *       examples:
 *        Default response:
 *         value:
 *          success: true
 *          classes:
 *           - _id: "60c72b2f9b1e8d001c8e4f3a"
 *             userId: "user123"
 *             courseId: "60c72b2f9b1e8d001c8e4f3b"
 *             classType: "lecture"
 *             startTime: "2024-09-15T09:00:00.000Z"
 *             endTime: "2024-09-15T11:00:00.000Z"
 *             events: []
 *             topics: ["Introduction to Programming"]
 *        With expanded course:
 *         value:
 *          success: true
 *          classes:
 *           - _id: "60c72b2f9b1e8d001c8e4f3a"
 *             userId: "user123"
 *             classType: "lecture"
 *             startTime: "2024-09-15T09:00:00.000Z"
 *             endTime: "2024-09-15T11:00:00.000Z"
 *             events: []
 *             topics: ["Introduction to Programming"]
 *             courseId:
 *              _id: "60c72b2f9b1e8d001c8e4f3b"
 *              userId: "user123"
 *              title: "Introduction to Programming"
 *              code: "IPC144"
 *              section: "A"
 *              color: "#3498db"
 *              status: "active"
 *              startDate: "2024-09-05T00:00:00.000Z"
 *              endDate: "2025-12-15T00:00:00.000Z"
 *              instructor:
 *               name: "John Smith"
 *               email: "john.smith@example.com"
 *               availableTimeSlots:
 *                - weekday: 1
 *                  startTime: 32400
 *                  endTime: 39600
 *              schedule:
 *               - classType: "lecture"
 *                 weekday: 1
 *                 startTime: 32400
 *                 endTime: 39600
 *                 location: "Room S1042"
 *        With date filtering:
 *         value:
 *          success: true
 *          classes:
 *           - _id: "60c72b2f9b1e8d001c8e4f3a"
 *             userId: "user123"
 *             courseId: "60c72b2f9b1e8d001c8e4f3b"
 *             classType: "lecture"
 *             startTime: "2024-09-15T09:00:00.000Z"
 *             endTime: "2024-09-15T11:00:00.000Z"
 *             events: []
 *             topics: ["Introduction to Programming"]
 *    '401':
 *     $ref: '#/components/responses/Unauthorized'
 *    '500':
 *     $ref: '#/components/responses/InternalServerError'
 */
export default (router) => {
  router.get('/', async (req, res) => {
    const userId = req.user.userId;

    // Extract query parameters
    const options = {
      from: req.query.from,
      to: req.query.to,
      expand: req.query.expand,
    };

    const { success, status, errors, classes } = await getClasses(userId, options);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, classes });
  });
};
