const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: String,
    price: Number,
    inStock: Boolean,
    category: String,
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);