const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;

var LocalityCardSchema = new mongoose.Schema({
    balance:{
        type: String,
    },
    number: {
        type: String,
    },
    phone:{
     type: String,
    },
    user_id:{
        type: String,
        default: null
    },
    otp:{
     type: String,
     default:null
    },
    verified:{
        type: Boolean,
        default: false
    }
}, {
    minimize: false
});

module.exports = mongoose.model('LocalityCard', LocalityCardSchema);