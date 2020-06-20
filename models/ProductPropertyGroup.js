const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;

const ProductPropertyGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        slug: 'name'
    },
    description: {
        type: String
    },
    properties:[{
        type: Types.ObjectId,
        ref: 'ProductProperty'
    }],
    active: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    }
});

module.exports = mongoose.model('ProductPropertyGroup', ProductPropertyGroupSchema);