const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;
const Product = require('./Product');
const logger = require('../config/logger');

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

FeedbackSchema.post('save', function(feedback, next){
    if(!mongoose.Types.ObjectId.isValid(feedback.product_id)) return next();

    // updating average_rate and reviews_count field of product
    Product.findById(feedback.product_id, 'slug', (err, product) => {
        if(!product || err){
            logger.error("feedback has invalid product_id field: product not found", {
                function: 'find product of feedback',
                feedback,
                err
            });
            return next()
        }
        mongoose.model('Feedback').aggregate([
            {
                $match: {
                    product_id: product._id,
                    active: true
                }
            }, {
                $group: {
                    _id: null,
                    rate: {$avg: "$rate"},
                    count: { $sum: 1 }
                }
            }
        ]).exec((err, average) => {
            if(err){
                logger.error("active feedbacks not found for the product", {
                    function: 'update average rate of a product',
                    feedback,
                    product
                });
                return next()
            }
            let average_rate = average.length ? average[0].rate : 0;
            let reviews_count = average.length ? average[0].count : 0;
            Product.updateMany({slug: product.slug}, {
                $set: {
                    average_rate,
                    reviews_count
                }
            }, (err, updatedProduct) => {
                if(err){
                    logger.error("can not update", {
                        function: 'update average rate of a product',
                        feedback,
                        product
                    });
                    return next()
                }
                logger.info("average rate and reviews_count fields of the product has been updated", {
                    product,
                    average
                });
                return next();
            });
        });
    });
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
