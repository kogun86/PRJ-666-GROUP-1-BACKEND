import { getEvents } from '../event.controller.js';

export default (router) => {
  router.get('/:status', async (req, res) => {
    const userId = req.user.userId;
    const eventStatus = req.params.status;

    const { success, status, errors, events } = await getEvents(userId, eventStatus == 'completed');

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, events });
  });
};
