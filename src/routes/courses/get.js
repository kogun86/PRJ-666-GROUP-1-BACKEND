import { getCourses } from '../../controllers/courseController.js';

// TODO: Secure this route with authentication middleware
export default (router) => {
  router.get('/', async (req, res) => {
    const userId = '1234'; // TODO: Get user ID from authentication token
    const { active } = req.query;

    const { success, status, errors, courses } = await getCourses(userId, JSON.parse(active));

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, courses });
  });
};
