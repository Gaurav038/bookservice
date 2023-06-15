const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
    {
        seatIds: [],
        name: String,
        phoneNumber: String,
        totalAmount: Number
    }
)

module.exports = mongoose.model("bookings", bookingSchema);