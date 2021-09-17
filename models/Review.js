const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;

var ReviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    shop: {
        type: String,
        default: ''
    },
    theme: {
        type: String,
        default: ''
    }, 
    description: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    minimize: false
});

module.exports = mongoose.model('Review', ReviewSchema);

