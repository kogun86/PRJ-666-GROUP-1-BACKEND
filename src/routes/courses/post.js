import { createCourse } from '../../controllers/courseController.js';

export default (router) => {
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
