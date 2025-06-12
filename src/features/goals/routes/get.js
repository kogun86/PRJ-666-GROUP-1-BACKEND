import { getGoals } from '../goal.controller.js';

export default (router) => {
  router.get('/', async (req, res) => {
    const userId = req.user.userId;

    const { success, status, errors, goals } = await getGoals(userId, {
      expandCourse: false,
    });

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, goals });
  });
};
