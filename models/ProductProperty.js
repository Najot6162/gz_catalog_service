const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;

const PropertyOptionSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    value:{
        type:String
    }
});

var ProductPropertySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        slug: 'name'
    },
    type: {
        type: String,
        enum: ['text', 'number', 'select', 'checkbox', 'radio'],
        default: 'text'
    },
    options:[PropertyOptionSchema],
    description: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
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

ProductPropertySchema.path('options').validate(function(value) {
    // types that requrie options
    let types = ['select', 'checkbox', 'radio'];
    
    if(types.indexOf(this.type) >= 0){
        return value.length > 0;
    }
    return true;
}, 'Options required');

module.exports = mongoose.model('ProductProperty', ProductPropertySchema);