const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;

var ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        slug: 'name'
    },
    category: {
        type: Types.ObjectId,
        ref: 'Category'
    },
    prices: [{
        type:{
            type: Types.ObjectId,
            ref: 'PriceType'
        },
        price: Number,
        old_price: Number
    }],
    active:{
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
},{
    minimize: false
});

module.exports = mongoose.model('Product', ProductSchema);