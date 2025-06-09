import { deleteCourse } from '../course.controller.js';

export default (router) => {
  /**
   * @swagger
   * /courses/{id}:
   *  delete:
   *   tags:
   *    - Courses
   *   summary: Delete a course
   *   description: Delete a course by ID for the authenticated user. This will also delete all classes and events associated with the course.
   *   security:
   *    - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: id
   *      description: The ID of the course to delete
   *      required: true
   *      schema:
   *       type: string
   *       minLength: 24
   *       maxLength: 24
   *       example: 60c72b2f9b1e8d001c8e4f3b
   *   responses:
   *    '200':
   *     description: Successfully deleted the course
   *     content:
   *      application/json:
   *       schema:
   *        type: object
   *        required:
   *         - success
   *        properties:
   *         success:
   *          type: boolean
   *          description: Indicates if the request was successful
   *          default: true
   *         deletedClassCount:
   *          type: integer
   *          description: Number of classes that were deleted along with the course
   *          example: 15
   *         deletedEventCount:
   *          type: integer
   *          description: Number of events that were deleted along with the course
   *          example: 8
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
  router.delete('/:id', async (req, res) => {
    const userId = req.user.userId;
    const courseId = req.params.id;

    const { success, status, errors, deletedClassCount, deletedEventCount } = await deleteCourse(
      courseId,
      userId
    );

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({
      success: true,
      deletedClassCount,
      deletedEventCount,
    });
  });
};
