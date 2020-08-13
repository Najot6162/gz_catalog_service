const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;

var ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        text: true
    },
    slug: {
        type: String,
        slug: 'name',
        permanent: true,
        text: true
    },
    category: {
        type: Types.ObjectId,
        ref: 'Category'
    },
    additional_categories: [{
        type: Types.ObjectId,
        ref: 'Category'
    }],
    related_products: [{
        type: Types.ObjectId,
        ref: 'Product'
    }],
    brand: {
        type: Types.ObjectId,
        ref: 'Brand'
    },
    preview_text: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: '',
        text: true
    },
    image: {
        type: String
    },
    gallery: [{
        type: String
    }],
    price: {
        price: Number,
        old_price: Number
    },
    prices: [{
        type: {
            type: String
        },
        price: Number,
        old_price: Number
    }],
    properties: [{
        property: {
            type: Types.ObjectId,
            ref: 'ProductProperty'
        },
        value: {
            type: String
        }
    }],
    active: {
        type: Boolean,
        default: true
    },
    external_id: {
        type: Number,
        default: null
    },
    meta: {
        title: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        tags: {
            type: String,
            default: ''
        }
    },
    recommended: {
        type: Boolean,
        default: false
    },
    lang: {
        type: String,
        enum: ['uz', 'ru', 'en'],
        required: true,
        default: 'ru'
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

module.exports = mongoose.model('Product', ProductSchema);