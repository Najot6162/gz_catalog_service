const grpc = require('grpc');
const productStorage = require('../storage/mongo/product');
const logger = require('../config/logger.js');

const productService = {
    Create: (call, callback) => {
        logger.debug('Product create request', {
            request: call.request, 
            label: 'product'
        });
        logger.profile('product created');
        productStorage.create(call.request).then((result) => {
            logger.profile('product created');
            callback(null, {product: result});
        }).catch((err) => {
            logger.error(err.message, {
                function: 'create product',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Update: (call, callback) => {

        productStorage.update(call.request).then((result) => {
            callback(null, {product: result});
        }).catch((err) => {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    UpdatePrice: (call, callback) => {

        productStorage.updatePrice(call.request).then((result) => {
            callback(null, {product: result});
        }).catch((err) => {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    UpdateProperty: (call, callback) => {

        productStorage.updateProperty(call.request).then((result) => {
            callback(null, {product: result});
        }).catch((err) => {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Find: (call, callback) => {
        logger.debug('Product find request', {
            request: call.request, 
            label: 'product'
        });
        productStorage.find(call.request).then((result) => {
            callback(null, {
                products: result,
                count: result.length
            });
        }).catch((err) => {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Get: (call, callback) => {
        productStorage.get(call.request).then((result) => {
            callback(null, {product: result});
        }).catch((err) => {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Delete: (call, callback) => {
        productStorage.delete(call.request).then((result) => {
            callback(null);
        }).catch((err) => {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    }
}

module.exports = productService;