import { createEvent } from '../event.controller.js';

export default (router) => {
  router.post('/', async (req, res) => {
    const userId = req.user.userId;
    const eventData = req.body;

    const { success, status, errors, event } = await createEvent(userId, eventData);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(201).json({ success: true, event });
  });
};
