const mongoose = require('mongoose')

const seatSchema = new mongoose.Schema({},
    {strict:false }
)

module.exports = mongoose.model("seats", seatSchema);
