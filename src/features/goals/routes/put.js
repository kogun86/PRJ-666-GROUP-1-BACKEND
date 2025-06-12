import { updateGoal } from '../goal.controller.js';

export default (router) => {
  router.put('/:goalId', async (req, res) => {
    const userId = req.user.userId;
    const goalId = req.params.goalId;
    const goalData = req.body;

    const { success, status, errors, goal } = await updateGoal(userId, goalId, goalData);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, goal });
  });
};
