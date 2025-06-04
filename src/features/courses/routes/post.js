import { createCourse } from '../course.controller.js';

export default (router) => {
  /**
   * @swagger
   * /courses:
   *  post:
   *   tags:
   *    - Courses
   *   summary: Create a new course for the authenticated user
   *   description: Create a new course with the provided details for the authenticated user
   *   security:
   *    - BearerAuth: []
   *   requestBody:
   *    required: true
   *    content:
   *     application/json:
   *      schema:
   *       $ref: '#/components/schemas/CourseInput'
   *   responses:
   *    '201':
   *     description: Course created successfully
   *     content:
   *      application/json:
   *       schema:
   *        type: object
   *        required:
   *         - success
   *         - message
   *        properties:
   *         success:
   *          type: boolean
   *          description: Indicates if the request was successful
   *          default: true
   *         message:
   *          type: string
   *          description: Confirmation message for successful course creation
   *          default: Course created successfully
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
    const courseData = req.body;

    const { success, status, errors } = await createCourse(userId, courseData);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(201).json({ success: true, message: 'Course created successfully' });
  });
};
