const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        type: {
            type: String,
            enum: [
                "LODGE_SUBMITTED",
                "LODGE_PENDING_ADMIN",
                "LODGE_APPROVED",
                "LODGE_REJECTED",
                "ROOM_DEACTIVATION_REQUEST",
                "ROOM_DEACTIVATED",
                "ROOM_DEACTIVATION_REJECTED",
                "BOOKING_CONFIRMED",
                "PAYMENT_SUCCESS"
            ],
            required: true
        },

        title: String || "",

        message: String || "",

        data: {
            type: Object,
            default: {}
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Notification", notificationSchema);
