import { createCourse } from '../../controllers/courseController.js';

// TODO: Secure the endpoint with authentication middleware
export default (router) => {
  router.post('/', async (req, res) => {
    const courseData = req.body;
    // TODO: Get user ID from authentication token
    const userId = '1234';

    const { success, status, errors } = await createCourse(userId, courseData);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(201).json({ success: true, message: 'Course created successfully' });
  });
};
