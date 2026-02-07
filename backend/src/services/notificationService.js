// services/notificationService.js
const NotificationRepository = require("../repository/notificationRepo");

class NotificationService {
  constructor() {
    this.notificationRepo = new NotificationRepository();
  }

  async getUserNotifications(userId) {
    return await this.notificationRepo.findByUserId(userId);
  }
}

module.exports = NotificationService;
