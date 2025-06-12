import { deleteGoal } from '../goal.controller.js';

export default (router) => {
  router.delete('/:goalId', async (req, res) => {
    const userId = req.user.userId;
    const goalId = req.params.goalId;

    const { success, status, errors } = await deleteGoal(userId, goalId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(204).send();
  });
};
