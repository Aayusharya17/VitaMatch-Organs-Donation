// repository/notificationRepo.js
const Notification = require("../models/Notification");

class NotificationRepository {
  async findByUserId(userId) {
    return await Notification.find({ userId })
      .populate("allocationId")
      .sort({ createdAt: -1 });
  }
}

module.exports = NotificationRepository;
