import { getAvatarUploadSignature, updateAvatar } from '../profile.controller.js';

export default (router) => {
  /**
   * @swagger
   * /profile/avatar/signature:
   *  post:
   *   tags:
   *    - Profile
   *   summary: Generate a signature for Cloudinary avatar upload
   *   description: |
   *     Generates a signature for client-side Cloudinary avatar upload.
   *     The response includes all the parameters needed for the Cloudinary upload.
   *
   *     ### Example API call:
   *     - Generate avatar upload signature: `POST /api/v1/profile/avatar/signature`
   *   security:
   *    - BearerAuth: []
   *   responses:
   *    '200':
   *     description: Successfully generated signature
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/AvatarSignatureResponse'
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.post('/avatar/signature', async (req, res) => {
    const userId = req.user.userId;

    const {
      success,
      status,
      errors,
      timestamp,
      signature,
      apiKey,
      cloudName,
      publicId,
      folder,
      transformation,
    } = await getAvatarUploadSignature(userId);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({
      success: true,
      timestamp,
      signature,
      apiKey,
      cloudName,
      publicId,
      folder,
      transformation,
    });
  });

  /**
   * @swagger
   * /profile/avatar:
   *  post:
   *   tags:
   *    - Profile
   *   summary: Update user avatar
   *   description: |
   *     Updates the user's avatar with the URL provided after uploading to Cloudinary.
   *     If the user already has an avatar, the old one will be deleted from Cloudinary.
   *
   *     ### Example API call:
   *     - Update avatar: `POST /api/v1/profile/avatar`
   *   security:
   *    - BearerAuth: []
   *   requestBody:
   *    required: true
   *    content:
   *     application/json:
   *      schema:
   *       $ref: '#/components/schemas/AvatarUpdateInput'
   *   responses:
   *    '200':
   *     description: Successfully updated avatar
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/AvatarUpdateResponse'
   *    '400':
   *     description: Bad request - Missing required fields
   *     content:
   *      application/json:
   *       schema:
   *        type: object
   *        required:
   *         - success
   *         - errors
   *        properties:
   *         success:
   *          type: boolean
   *          default: false
   *         errors:
   *          type: array
   *          items:
   *           type: string
   *    '401':
   *     $ref: '#/components/responses/Unauthorized'
   *    '500':
   *     $ref: '#/components/responses/InternalServerError'
   */
  router.post('/avatar', async (req, res) => {
    const userId = req.user.userId;
    const avatarData = req.body;

    const { success, status, errors, user } = await updateAvatar(userId, avatarData);

    if (!success) {
      return res.status(status).json({ success: false, errors });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  });
};
