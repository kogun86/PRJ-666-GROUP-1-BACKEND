import { getEvents } from '../event.controller.js';

export default (router) => {
  /**
   * @swagger
   * /events:
   *  get:
   *   tags:
   *    - Events
   *   summary: Get events for the authenticated user
   *   description: |
   *     Retrieve all events for the authenticated user with optional filters and expansions.
   *
   *     ### Example API calls:
   *     - Get all events: `GET /api/v1/events`
   *     - Expand course details: `GET /api/v1/events?expand=course`
   *     - Filter by date range: `GET /api/v1/events?from=2023-09-01T00:00:00Z&to=2023-12-31T23:59:59Z`
   *     - Combine multiple filters: `GET /api/v1/events?completed=true&expand=course&from=2023-09-01T00:00:00Z&to=2023-12-31T23:59:59Z`
   *   security:
   *    - BearerAuth: []
   *   parameters:
   *    - in: query
   *      name: completed
   *      description: Filter events by their completion status
   *      required: false
   *      schema:
   *       type: boolean
   *       default: false
   *      example: false
   *    - in: query
   *      name: expand
   *      description: Expand additional resources related to events (e.g., 'course' to include course details)
   *      required: false
   *      schema:
   *       type: string
   *       enum: [course]
   *      example: course
   *    - in: query
   *      name: from
   *      description: Filter events that start or end after this date (ISO format)
   *      required: false
   *      schema:
   *       type: string
   *       format: date-time
   *      example: 2023-09-01T00:00:00Z
   *    - in: query
   *      name: courseId
   *      description: Only return events for this course (Mongo ObjectId)
   *      schema:
   *       type: string
   *       pattern: '^[0-9a-fA-F]{24}$'
   *      example: 60c72b2f9b1e8d001c8e4f3b
   *    - in: query
   *      name: to
   *      description: Filter events that start or end before this date (ISO format)
   *      required: false
   *      schema:
   *       type: string
   *       format: date-time
   *      example: 2023-12-31T23:59:59Z
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
   *           properties:
   *            course:
   *             type: object
   *             $ref: '#/components/schemas/Course'
   *             description: Course details (only included when expand=course is specified)
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
   *        With expanded course:
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
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.get('/', async (req, res) => {
    const userId = req.user.userId;
    const isCompleted = req.query.completed === 'true';
    const expandCourse = req.query.expand === 'course';
    const fromDate = req.query.from || null;
    const toDate = req.query.to || null;
    const courseId = req.query.courseId || null;

    const { success, status, errors, events } = await getEvents(
      userId,
      isCompleted,
      expandCourse,
      fromDate,
      toDate,
      courseId
    );

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, events });
  });

  /**
   * @swagger
   * /events/{status}:
   *  get:
   *   tags:
   *    - Events
   *   summary: Get events for the authenticated user by status
   *   description: |
   *     Retrieve all events for the authenticated user, filtered by their completion status.
   *
   *     ### Example API calls:
   *     - Get pending events: `GET /api/events/pending`
   *     - Get completed events: `GET /api/events/completed`
   *     - Get pending events with course details: `GET /api/events/pending?expand=course`
   *     - Get pending events after a specific date: `GET /api/events/pending?from=2023-09-01T00:00:00Z`
   *     - Combined filtering: `GET /api/events/completed?expand=course&from=2023-09-01T00:00:00Z&to=2023-12-31T23:59:59Z`
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
   *      example: pending
   *    - in: query
   *      name: expand
   *      description: Expand additional resources related to events (e.g., 'course' to include course details)
   *      required: false
   *      schema:
   *       type: string
   *       enum: [course]
   *      example: course
   *    - in: query
   *      name: from
   *      description: Filter events that start or end after this date (ISO format)
   *      required: false
   *      schema:
   *       type: string
   *       format: date-time
   *      example: 2023-09-01T00:00:00Z
   *    - in: query
   *      name: to
   *      description: Filter events that start or end before this date (ISO format)
   *      required: false
   *      schema:
   *       type: string
   *       format: date-time
   *      example: 2023-12-31T23:59:59Z
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
   *           properties:
   *            course:
   *             type: object
   *             $ref: '#/components/schemas/Course'
   *             description: Course details (only included when expand=course is specified)
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
   *        With expanded course:
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
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.get('/:status', async (req, res) => {
    const userId = req.user.userId;
    const eventStatus = req.params.status;
    const expandCourse = req.query.expand === 'course';
    const fromDate = req.query.from || null;
    const toDate = req.query.to || null;

    const { success, status, errors, events } = await getEvents(
      userId,
      eventStatus === 'completed',
      expandCourse,
      fromDate,
      toDate
    );

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, events });
  });
};
