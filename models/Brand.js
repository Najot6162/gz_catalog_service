const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;

var BrandSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    slug:{
        type: String,
        slug: 'name',
        unique: true
    },
    preview_text: {
        type: String,
        default: ''
    },
    description:{
        type:String,
        default: ''
    },
    active:{
        type: Boolean,
        default: true
    },
    order: {
        type:Number,
        default: 0
    },
    image: {
        type: String
    },
    created_at: {
        type:Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    }
}, {
    minimize: false
});

module.exports = mongoose.model('Brand', BrandSchema);

