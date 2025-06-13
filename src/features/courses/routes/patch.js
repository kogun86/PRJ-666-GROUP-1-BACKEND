import { updateCourse } from '../course.controller.js';

export default (router) => {
  /**
   * @swagger
   * /courses/{id}:
   *  patch:
   *   tags:
   *    - Courses
   *   summary: Update a course
   *   description: Update an existing course with the provided details for the authenticated user
   *   security:
   *    - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: id
   *      description: The ID of the course to update
   *      required: true
   *      schema:
   *       type: string
   *       minLength: 24
   *       maxLength: 24
   *       example: 60c72b2f9b1e8d001c8e4f3b
   *   requestBody:
   *    required: true
   *    content:
   *     application/json:
   *      schema:
   *       $ref: '#/components/schemas/CourseUpdateInput'
   *   responses:
   *    '200':
   *     description: Course updated successfully
   *     content:
   *      application/json:
   *       schema:
   *        type: object
   *        required:
   *         - success
   *         - course
   *        properties:
   *         success:
   *          type: boolean
   *          description: Indicates if the request was successful
   *          default: true
   *         course:
   *          $ref: '#/components/schemas/Course'
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
   *    '404':
   *     description: Course not found
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
   *           example: ["Course not found"]
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.patch('/:id', async (req, res) => {
    const userId = req.user.userId;
    const courseId = req.params.id;
    const updateData = req.body;

    const { success, status, errors, course } = await updateCourse(courseId, userId, updateData);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, course });
  });
};
