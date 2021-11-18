const grpc = require('grpc');
const localityCardStorage = require('../storage/mongo/locality_card');
const logger = require('../config/logger');

const localityCardService = {
    checkCustomer: (call, callback) => {
        logger.debug('Check Customer Request', {
            label: 'brand',
            request: call.request
        });
        localityCardStorage.checkCustomer(call.request).then((result) => {
            callback(null, { customer: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'Check Customer',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    createVerificationCode: (call,callback) => {
        logger.debug('Create Verification Code  Request', {
            label: 'code',
            request: call.request
        });
        localityCardStorage.createVerificationCode(call.request).then((result) => {
            callback(null, { customer: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'Create Verification Code',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    checkVerificationCode: (call,callback) => {
        logger.debug('Check Verification Code  Request', {
            label: 'code',
            request: call.request
        });
        localityCardStorage.checkVerificationCode(call.request).then((result) => {
            callback(null, { user_id: result });
            console.log(result);
        }).catch((err) => {
            logger.error(err.message, {
                function: 'check Verification Code',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    getCustomerCard: (call, callback) => {
        logger.debug('Customer Card Get Request', {
            label: 'Customer',
            request: call.request
        });
        localityCardStorage.getCustomerCard(call.request).then((result) => {
            callback(null, {customer_card: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'get customer card',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
}

module.exports = localityCardService;