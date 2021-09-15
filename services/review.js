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
        logger.debug('Review Find Request', {
            label: 'review',
            request: call.request
        });
       reviewStorage.find(call.request).then((result) => {
                callback(null,{
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
           
        },
    Delete: (call, callback) => {
            logger.debug('Review Delete Request', {
                label: 'review',
                request: call.request
            });
            reviewStorage.delete(call.request).then((result) => {
                callback(null);
            }).catch((err) => {
                logger.error(err.message, {
                    function: 'delete review',
                    request: call.request
                });
                callback({
                    code: grpc.status.INTERNAL,
                    message: err.message
                });
            });
        }
}

module.exports = reviewService;