import { createUser } from '../user.controller.js';

// TODO: Secure the endpoint with authentication middleware
export default (router) => {
  router.post('/', async (req, res) => {
    // TODO: Get user ID from authentication token
    const userId = '1234';

    const { success, status, errors } = await createUser(userId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(201).json({ success: true, message: 'User created successfully' });
  });
};
