// controllers/notificationController.js
const NotificationService = require("../services/notificationService");
const notificationService = new NotificationService();

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await notificationService.getUserNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch notifications",
      err: error.message
    });
  }
};

module.exports = {getMyNotifications};
