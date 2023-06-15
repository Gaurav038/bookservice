const mongoose = require('mongoose')

const priceSchema = new mongoose.Schema({},
    {strict:false }
)

module.exports = mongoose.model("pricings", priceSchema);