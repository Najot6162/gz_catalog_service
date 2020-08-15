const grpc = require('grpc');
const feedbackStorage = require('../storage/mongo/feedback');
const logger = require('../config/logger');

const feedbackService = {
    Create: (call, callback) => {
        logger.debug('Feedback Create Request', {
            label: 'feedback',
            request: call.request
        });
        feedbackStorage.create(call.request).then((result) => {
            callback(null, { feedback: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'create feedback',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Update: (call, callback) => {
        logger.debug('Feedback Update Request', {
            label: 'brand',
            request: call.request
        });
        feedbackStorage.update(call.request).then((result) => {
            callback(null, { feedback: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'update feedback',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Find: (call, callback) => {
        logger.debug('Feedback Find Request', {
            label: 'feedback',
            request: call.request
        });
        feedbackStorage.find(call.request).then((result) => {
            callback(null, {
                feedbacks: result.feedbacks,
                count: result.count
            });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'find feedbacks',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Get: (call, callback) => {
        logger.debug('Feedback Get Request', {
            label: 'brand',
            request: call.request
        });
        feedbackStorage.get(call.request).then((result) => {
            callback(null, { feedback: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'get feedback',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Delete: (call, callback) => {
        logger.debug('Feedback Delete Request', {
            label: 'feedback',
            request: call.request
        });
        feedbackStorage.delete(call.request).then((result) => {
            callback(null);
        }).catch((err) => {
            logger.error(err.message, {
                function: 'delete feedback',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    }
}

module.exports = feedbackService;