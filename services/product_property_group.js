const grpc = require('grpc');
const productPropertyGroupStorage = require('../storage/mongo/product_property_group');
const logger = require('../config/logger');

const productPropertyGroupService = {
    Create: (call, callback) => {
        logger.debug('productPropertyGroup Create Request', {
            label: 'product property group',
            request: call.request
        });
        productPropertyGroupStorage.create(call.request).then((result) => {
            callback(null, {product_property_group: result});
        }).catch((err) => {
            logger.error(err.message, {
                function: 'create productPropertyGroup',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Update: (call, callback) => {
        logger.debug('productPropertyGroup Update Request', {
            label: 'product property group',
            request: call.request
        });
        productPropertyGroupStorage.update(call.request).then((result) => {
            callback(null, {product_property_group: result});
        }).catch((err) => {
            logger.error(err.message, {
                function: 'update productPropertyGroup',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Find: (call, callback) => {
        logger.debug('productPropertyGroup Find Request', {
            label: 'product property group',
            request: call.request
        });
        productPropertyGroupStorage.find(call.request).then((result) => {
            callback(null, {
                product_property_groups: result,
                count: result.length
            });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'find productPropertyGroups',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Get: (call, callback) => {
        logger.debug('productPropertyGroup Get Request', {
            label: 'product property group',
            request: call.request
        });
        productPropertyGroupStorage.get(call.request).then((result) => {
            callback(null, {product_property_group: result});
        }).catch((err) => {
            logger.error(err.message, {
                function: 'get productPropertyGroup',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Delete: (call, callback) => {
        logger.debug('productPropertyGroup Delete Request', {
            label: 'product property group',
            request: call.request
        });
        productPropertyGroupStorage.delete(call.request).then((result) => {
            callback(null);
        }).catch((err) => {
            logger.error(err.message, {
                function: 'delete productPropertyGroup',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    }
}

module.exports = productPropertyGroupService;