import { getProfileData, getUserAvatar } from '../profile.controller.js';

export default (router) => {
  /**
   * @swagger
   * /profile:
   *  get:
   *   tags:
   *    - Profile
   *   summary: Get profile data for the authenticated user
   *   description: |
   *     Retrieves profile data for the authenticated user, including the closest upcoming pending event and completion percentage for the current semester.
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
   *        $ref: '#/components/schemas/Profile'
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

  /**
   * @swagger
   * /profile/avatar:
   *  get:
   *   tags:
   *    - Profile
   *   summary: Get avatar URL for the authenticated user
   *   description: |
   *     Retrieves the avatar URL for the authenticated user.
   *
   *     ### Example API call:
   *     - Get avatar URL: `GET /api/v1/profile/avatar`
   *   security:
   *    - BearerAuth: []
   *   responses:
   *    '200':
   *     description: Successfully retrieved avatar URL
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/AvatarResponse'
   *    '404':
   *     description: User not found
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
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.get('/avatar', async (req, res) => {
    const userId = req.user.userId;

    const { success, status, errors, avatarURL } = await getUserAvatar(userId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({
      success: true,
      avatarURL,
    });
  });
};
