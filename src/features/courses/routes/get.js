import { getCourses } from '../course.controller.js';

export default (router) => {
  router.get('/', async (req, res) => {
    const userId = req.user.userId;
    const { active } = req.query;

    const { success, status, errors, courses } = await getCourses(userId, JSON.parse(active));

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, courses });
  });
};
