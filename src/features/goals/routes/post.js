import { createGoal } from '../goal.controller.js';

export default (router) => {
  router.post('/', async (req, res) => {
    const user = req.user.userId;
    const goalData = req.body;

    const { success, status, errors, goal } = await createGoal(user, goalData);

    if (!success) {
      res.status(status).json({ success: false, errors });
    }

    return res.status(201).json({ success: true, goal });
  });
};
