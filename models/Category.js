const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;

var CategorySchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    slug:{
        type: String,
        slug: 'name'
    },
    parent:{
        type: Types.ObjectId,
        ref: 'Category'
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
    product_property_groups : [{
        type: Types.ObjectId,
        ref: 'ProductPropertyGroup'
    }],
    created_at: {
        type:Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    }
},{
    minimize: false
});

module.exports = mongoose.model('Category', CategorySchema);

