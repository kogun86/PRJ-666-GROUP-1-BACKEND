import { getClasses } from '../../controllers/classController.js';

export default (router) => {
  router.get('/', async (req, res) => {
    const userId = req.user.userId;

    const { success, status, errors, classes } = await getClasses(userId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, classes });
  });
};
