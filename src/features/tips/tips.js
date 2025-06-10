import { getStudyTips } from './tips.controller.js';

export default (router) => {
  /**
   * @swagger
   * /tips:
   *  get:
   *   tags:
   *    - Chat
   *   summary: Get AI-generated personalized study tips
   *   description: |
   *     Retrieve AI-generated personalized study tips based on the user's upcoming and completed events.
   *
   *     The tips are generated using the OpenRouter AI API and are tailored to the user's specific
   *     academic situation, including upcoming deadlines, completed work, available study time,
   *     and preferred study style.
   *
   *     ### Example API calls:
   *     - Basic request: `GET /api/v1/tips`
   *     - With study preferences: `GET /api/v1/tips?timeAvailable=20&studyStyle=pomodoro`
   *   security:
   *    - BearerAuth: []
   *   parameters:
   *    - in: query
   *      name: timeAvailable
   *      description: Amount of time available for studying (in hours)
   *      required: false
   *      schema:
   *       type: number
   *      example: 20
   *    - in: query
   *      name: studyStyle
   *      description: User's preferred study style or technique
   *      required: false
   *      schema:
   *       type: string
   *      example: pomodoro
   *   responses:
   *    '200':
   *     description: Successfully generated study tips
   *     content:
   *      application/json:
   *       schema:
   *        type: object
   *        required:
   *         - success
   *         - tips
   *        properties:
   *         success:
   *          type: boolean
   *          description: Indicates if the request was successful
   *          default: true
   *         tips:
   *          type: string
   *          description: AI-generated study tips and recommendations
   *       examples:
   *        Default response:
   *         value:
   *          success: true
   *          tips: "Based on your upcoming assignments, I recommend prioritizing your Programming Project due next week. Here's a study schedule: Monday - Research phase (2 hours), Tuesday - Planning (1.5 hours)..."
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.get('/', async (req, res) => {
    const userId = req.user.userId;
    const timeAvailable = req.query.timeAvailable ? parseFloat(req.query.timeAvailable) : null;
    const studyStyle = req.query.studyStyle || null;

    const options = {
      timeAvailable,
      studyStyle,
    };

    const { success, status, errors, tips } = await getStudyTips(userId, options);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, tips });
  });
};
