import { updateCompletionStatus, updateGrade } from '../../controllers/eventsController.js';

export default (router) => {
  router.patch('/:id/grade/:status', async (req, res) => {
    const userId = req.user.userId;
    const eventId = req.params.id;
    const eventStatus = req.params.status;

    const { success, status, errors, event } = await updateCompletionStatus(
      eventId,
      userId,
      eventStatus == 'completed'
    );

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, event });
  });

  router.patch('/:id/grade', async (req, res) => {
    const userId = req.user.userId;
    const eventId = req.params.id;
    const grade = req.body.grade;

    const { success, status, errors, event } = await updateGrade(eventId, userId, grade);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, event });
  });
};
