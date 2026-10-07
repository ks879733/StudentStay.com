const Notification = require("../models/notification");
const { getIO } = require("../socketIO");

const createNotification = async({ 
  userId,
  type,
  title,
  message,
  data = {},
 }) => {
    const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        data
    });

    try {
      getIO().to(`user:${userId}`).emit("notification", notification);
    } catch (error) {
      console.error("Socket notification delivery failed:", error.message);
    }
    return notification
 }
 module.exports = {
    createNotification
};
