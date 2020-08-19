const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;

var FeedbackSchema = new mongoose.Schema({
    customer_name: {
        type: String,
        required: true
    },
    customer_id: {
        type: String,
        default:""
    },
    product_id: {
        type: Types.ObjectId,
        ref: "Product",
    },
    rate: {
        type: Number,
        default: 1,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ''
    },
    active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    }
}, {
    minimize: false
});

module.exports = mongoose.model('Feedback', FeedbackSchema);

