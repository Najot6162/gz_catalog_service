const grpc = require('grpc');
const reviewStorage = require('../storage/mongo/review');
const logger = require('../config/logger');

const reviewService = {
    Create: (call, callback) => {
        logger.debug('Review Create Request', {
            label: 'review',
            request: call.request
        });
        reviewStorage.create(call.request).then((result) => {
            callback(null, { review: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'create review',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },

    Find: (call, callback) => {
        logger.debug('review Find Request', {
            label: 'review',
            request: call.request
        });
        if (call.request.category) {
            reviewStorage.findByCategory(call.request).then((result) => {
                callback(null, {
                    reviews: result.reviews,
                    count: result.count
                });
            }).catch((err) => {
                logger.error(err.message, {
                    function: 'find reviews',
                    request: call.request
                });
                callback({
                    code: grpc.status.INTERNAL,
                    message: err.message
                });
            });
        } else {
            reviewStorage.find(call.request).then((result) => {
                callback(null, {
                    reveiws: result.reviews,
                    count: result.count
                });
            }).catch((err) => {
                logger.error(err.message, {
                    function: 'find reviews',
                    request: call.request
                });
                callback({
                    code: grpc.status.INTERNAL,
                    message: err.message
                });
            });
        }
    },
 
}

module.exports = reviewService;