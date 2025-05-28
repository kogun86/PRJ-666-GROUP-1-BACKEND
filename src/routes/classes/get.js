import { getClasses } from '../../controllers/classController.js';

// TODO: Secure this route with authentication middleware
export default (router) => {
  router.get('/', async (req, res) => {
    const userId = '1234'; // TODO: Get user ID from authentication token

    const { success, status, errors, classes } = await getClasses(userId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, classes });
  });
};
