const grpc = require('grpc');
const categoryStorage = require('../storage/mongo/category');
const logger = require('../config/logger');

const categoryService = {
    Create: (call, callback) => {
        logger.debug('Category create request', {
            request: call.request,
            label: 'category'
        })
        categoryStorage.create(call.request).then((result) => {
            callback(null, {category: result});
        }).catch((err) => {
            logger.error(err.message, {
                function: 'create category',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Update: (call, callback) => {
        logger.debug('Category update request', {
            request: call.request,
            label: 'category'
        })
        categoryStorage.update(call.request).then((result) => {
            callback(null, {category: result});
        }).catch((err) => {
            logger.error(err.message, {
                function: 'update category',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Find: (call, callback) => {
        logger.debug('Category find request', {
            request: call.request,
            label: 'category'
        })
        categoryStorage.find(call.request).then((result) => {
            callback(null, {
                categories: result,
                count: result.length
            });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'find category',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Get: (call, callback) => {
        logger.debug('Category get request', {
            request: call.request,
            label: 'category'
        })
        categoryStorage.get(call.request).then((result) => {
            callback(null, {category: result});
        }).catch((err) => {
            logger.error(err.message, {
                function: 'get category',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Delete: (call, callback) => {
        logger.debug('Category delete request', {
            request: call.request,
            label: 'category'
        })
        categoryStorage.delete(call.request).then((result) => {
            callback(null);
        }).catch((err) => {
            logger.error(err.message, {
                function: 'delete category',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    }
}

module.exports = categoryService;