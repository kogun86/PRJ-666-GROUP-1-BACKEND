import logger from '../../shared/utils/logger.js';
import Event from '../../shared/models/event.model.js';
import Course from '../../shared/models/course.model.js';
import User from '../../shared/models/user.model.js';
import {
  generateSignature,
  deleteImage,
  getPublicIdFromUrl,
} from '../../shared/utils/cloudinary.js';
import config from '../../config.js';

/**
 * Get user's avatar URL
 * @param {string} userId - The ID of the user
 * @returns {Object} - Object containing success status and avatar URL
 */
async function getUserAvatar(userId) {
  logger.debug(`Fetching avatar for user ${userId}`);

  try {
    // Find user
    const user = await User.findById(userId);

    if (!user) {
      logger.warn(`User ${userId} not found when fetching avatar`);
      return {
        success: false,
        status: 404,
        errors: ['User not found'],
      };
    }

    logger.info(`Successfully fetched avatar for user ${userId}`);

    return {
      success: true,
      avatarURL: user.avatarURL,
    };
  } catch (error) {
    logger.error({ error }, `Error fetching avatar for user ${userId}`);
    return {
      success: false,
      status: 500,
      errors: ['Internal server error'],
    };
  }
}

/**
 * Get the closest upcoming event and completion percentage for the current semester
 * @param {string} userId - The ID of the user
 * @returns {Object} - Object containing success status, upcoming event, and completion percentage
 */
async function getProfileData(userId) {
  logger.debug(`Fetching profile data for user ${userId}`);

  try {
    // Get current date
    const currentDate = new Date();

    // Define current semester (approximate dates)
    // This could be replaced with actual semester dates from a settings or configuration
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Determine semester dates based on current month
    let semesterStartDate, semesterEndDate;

    if (currentMonth >= 0 && currentMonth <= 4) {
      // Winter semester (January - April)
      semesterStartDate = new Date(currentYear, 0, 1); // January 1st
      semesterEndDate = new Date(currentYear, 4, 30); // April 30th
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      // Summer semester (May - August)
      semesterStartDate = new Date(currentYear, 5, 1); // May 1st
      semesterEndDate = new Date(currentYear, 7, 31); // August 31st
    } else {
      // Fall semester (September - December)
      semesterStartDate = new Date(currentYear, 8, 1); // September 1st
      semesterEndDate = new Date(currentYear, 11, 31); // December 31st
    }

    // Find all events for the current semester
    const allSemesterEvents = await Event.find({
      userId,
      end: { $gte: semesterStartDate, $lte: semesterEndDate },
    });

    // Calculate completion percentage
    const totalEvents = allSemesterEvents.length;
    const completedEvents = allSemesterEvents.filter((event) => event.isCompleted).length;

    // Calculate percentage (0 if no events)
    const completionPercentage =
      totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

    // Find the closest upcoming pending event
    const upcomingEvents = await Event.find({
      userId,
      end: { $gte: currentDate },
      isCompleted: false,
    })
      .sort({ end: 1 })
      .limit(1);

    let upcomingEvent = null;

    // If there's an upcoming event, expand it with course details
    if (upcomingEvents.length > 0) {
      upcomingEvent = upcomingEvents[0].toObject();

      try {
        const course = await Course.findById(upcomingEvent.courseID);
        if (course) {
          upcomingEvent.course = course.toObject();
        }
      } catch (courseError) {
        logger.error(
          { error: courseError },
          `Error fetching course for event ${upcomingEvent._id}`
        );
      }
    }

    logger.info(`Successfully fetched profile data for user ${userId}`);

    return {
      success: true,
      upcomingEvent,
      completionPercentage,
      hasEvents: totalEvents > 0,
    };
  } catch (error) {
    logger.error({ error }, `Error fetching profile data for user ${userId}`);
    return {
      success: false,
      status: 500,
      errors: ['Internal server error'],
    };
  }
}

/**
 * Generate a signature for Cloudinary avatar upload
 * @param {string} userId - The ID of the user
 * @returns {Object} - Object containing success status, timestamp, signature, apiKey, and cloudName
 */
async function getAvatarUploadSignature(userId) {
  logger.debug(`Generating avatar upload signature for user ${userId}`);

  try {
    // Parameters to include in the signature
    const params = {
      folder: 'avatars',
      transformation: 'c_thumb,g_face,h_256,w_256',
    };

    // Generate the signature
    const { signature, timestamp } = generateSignature(params);

    logger.info(`Successfully generated avatar upload signature for user ${userId}`);

    return {
      success: true,
      timestamp,
      signature,
      apiKey: config.CLOUDINARY.API_KEY,
      cloudName: config.CLOUDINARY.CLOUD_NAME,
      publicId: userId,
      folder: params.folder,
      transformation: params.transformation,
    };
  } catch (error) {
    logger.error({ error }, `Error generating avatar upload signature for user ${userId}`);
    return {
      success: false,
      status: 500,
      errors: ['Internal server error'],
    };
  }
}

/**
 * Update user avatar URL
 * @param {string} userId - The ID of the user
 * @param {Object} data - Avatar data including URL and metadata
 * @returns {Object} - Object containing success status and updated user
 */
async function updateAvatar(userId, data) {
  logger.debug(`Updating avatar for user ${userId}`);

  try {
    // Validate required fields
    if (!data.avatarURL) {
      logger.warn(`Missing required field avatarURL for user ${userId}`);
      return {
        success: false,
        status: 400,
        errors: ['avatarURL is required'],
      };
    }

    // Get existing user
    let user = await User.findById(userId);

    // If user doesn't exist, create a new one
    if (!user) {
      logger.info(`User ${userId} not found, creating new user`);
      user = new User({ _id: userId });
    } else {
      // If user has an existing avatar, delete it from Cloudinary
      const existingPublicId = getPublicIdFromUrl(user.avatarURL);
      if (existingPublicId) {
        logger.debug(`Deleting existing avatar for user ${userId}: ${existingPublicId}`);
        await deleteImage(existingPublicId);
      }
    }

    // Update avatar URL
    user.avatarURL = data.avatarURL;

    // Save user
    await user.save();
    logger.info(`Successfully updated avatar for user ${userId}`);

    return {
      success: true,
      user: {
        _id: user._id,
        avatarURL: user.avatarURL,
      },
    };
  } catch (error) {
    logger.error({ error }, `Error updating avatar for user ${userId}`);
    return {
      success: false,
      status: 500,
      errors: ['Internal server error'],
    };
  }
}

export { getProfileData, getAvatarUploadSignature, updateAvatar, getUserAvatar };
