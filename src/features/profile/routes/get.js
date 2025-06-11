import { getProfileData } from '../profile.controller.js';

export default (router) => {
  /**
   * @swagger
   * /profile:
   *  get:
   *   tags:
   *    - Profile
   *   summary: Get profile data for the authenticated user
   *   description: |
   *     Retrieves profile data for the authenticated user, including the closest upcoming event and completion percentage for the current semester.
   *
   *     ### Example API call:
   *     - Get profile data: `GET /api/v1/profile`
   *   security:
   *    - BearerAuth: []
   *   responses:
   *    '200':
   *     description: Successfully retrieved profile data
   *     content:
   *      application/json:
   *       schema:
   *        type: object
   *        required:
   *         - success
   *         - upcomingEvent
   *         - completionPercentage
   *         - hasEvents
   *        properties:
   *         success:
   *          type: boolean
   *          description: Indicates if the request was successful
   *          default: true
   *         upcomingEvent:
   *          type: object
   *          description: The closest upcoming event (null if no upcoming events)
   *          $ref: '#/components/schemas/Event'
   *          properties:
   *           course:
   *            type: object
   *            $ref: '#/components/schemas/Course'
   *            description: Course details for the upcoming event
   *         completionPercentage:
   *          type: number
   *          description: Percentage of completed events in the current semester (0-100)
   *          minimum: 0
   *          maximum: 100
   *         hasEvents:
   *          type: boolean
   *          description: Indicates if the user has any events in the current semester
   *       examples:
   *        With upcoming event:
   *         value:
   *          success: true
   *          upcomingEvent:
   *           _id: "60c72b2f9b1e8d001c8e4f3a"
   *           userId: "user123"
   *           title: "Assignment 1"
   *           courseID: "60c72b2f9b1e8d001c8e4f3b"
   *           type: "assignment"
   *           weight: 15
   *           grade: null
   *           isCompleted: false
   *           end: "2024-10-15T23:59:00.000Z"
   *           start: "2024-09-15T00:00:00.000Z"
   *           location: "Submit online"
   *           color: "#4A90E2"
   *           course:
   *            _id: "60c72b2f9b1e8d001c8e4f3b"
   *            userId: "user123"
   *            title: "Introduction to Programming"
   *            code: "IPC144"
   *            section: "A"
   *            status: "active"
   *            startDate: "2024-09-05T00:00:00.000Z"
   *            endDate: "2025-12-15T00:00:00.000Z"
   *          completionPercentage: 75
   *          hasEvents: true
   *        No upcoming events:
   *         value:
   *          success: true
   *          upcomingEvent: null
   *          completionPercentage: 100
   *          hasEvents: true
   *        No events:
   *         value:
   *          success: true
   *          upcomingEvent: null
   *          completionPercentage: 0
   *          hasEvents: false
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.get('/', async (req, res) => {
    const userId = req.user.userId;

    const { success, status, errors, upcomingEvent, completionPercentage, hasEvents } =
      await getProfileData(userId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({
      success: true,
      upcomingEvent,
      completionPercentage,
      hasEvents,
    });
  });
};
