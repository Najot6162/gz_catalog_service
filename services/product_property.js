const grpc = require('grpc');
const productPropertyStorage = require('../storage/mongo/product_property');
const logger = require('../config/logger');

const productPropertyService = {
    Create: (call, callback) => {
        logger.debug('productProperty Create Request', {
            label: 'product property',
            request: call.request
        });
        productPropertyStorage.create(call.request).then((result) => {
            callback(null, {productProperty: result});
        }).catch((err) => {
            logger.error(err.message, {
                function: 'create productProperty',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Update: (call, callback) => {
        logger.debug('productProperty Update Request', {
            label: 'product property',
            request: call.request
        });
        productPropertyStorage.update(call.request).then((result) => {
            callback(null, {productProperty: result});
        }).catch((err) => {
            logger.error(err.message, {
                function: 'update productProperty',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Find: (call, callback) => {
        logger.debug('productProperty Find Request', {
            label: 'product property',
            request: call.request
        });
        productPropertyStorage.find(call.request).then((result) => {
            callback(null, {
                productPropertys: result,
                count: result.length
            });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'find productProperties',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Get: (call, callback) => {
        logger.debug('productProperty Get Request', {
            label: 'product property',
            request: call.request
        });
        productPropertyStorage.get(call.request).then((result) => {
            callback(null, {productProperty: result});
        }).catch((err) => {
            logger.error(err.message, {
                function: 'get productProperty',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Delete: (call, callback) => {
        logger.debug('productProperty Delete Request', {
            label: 'product property',
            request: call.request
        });
        productPropertyStorage.delete(call.request).then((result) => {
            callback(null);
        }).catch((err) => {
            logger.error(err.message, {
                function: 'delete productProperty',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    }
}

module.exports = productPropertyService;