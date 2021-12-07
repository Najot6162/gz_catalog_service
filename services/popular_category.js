const grpc = require('grpc');
const popularCategoryStorage = require('../storage/mongo/popular_category');
const logger = require('../config/logger');

const brandService = {
    Create: (call, callback) => {
        logger.debug('Popular Category  Create Request', {
            label: 'brand',
            request: call.request
        });
        popularCategoryStorage.create(call.request).then((result) => {
            callback(null, { popular_category: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'create popular category',
                request: call.request
            });
            callback({
                code: grpc.status.NOT_FOUND,
                message: err.message
            });
        });
    },
    Update: (call, callback) => {
        logger.debug('Popular Category  Update Request', {
            label: 'brand',
            request: call.request
        });
        popularCategoryStorage.update(call.request).then((result) => {
            callback(null, { popular_category: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'update brand',
                request: call.request
            });
            callback({
                code: grpc.status.NOT_FOUND,
                message: err.message
            });
        });
    },
    Find: (call, callback) => {
        logger.debug('Popular Category Find Request', {
            label: 'rule',
            request: call.request
        });
        popularCategoryStorage.find(call.request).then((result) => {
                callback(null,{
                    popular_categories: result.popularCategories,
                    count: result.count
                });
            }).catch((err) => {
                logger.error(err.message, {
                    function: 'find popular category ',
                    request: call.request
                });
                callback({
                    code: grpc.status.NOT_FOUND,
                    message: err.message
                });
            });
           
        },
    Get: (call, callback) => {
        logger.debug('Popular Category Get Request', {
            label: 'popularCategory',
            request: call.request
        });
        popularCategoryStorage.get(call.request).then((result) => {
            callback(null, { popular_category: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'get popular category',
                request: call.request
            });
            callback({
                code: grpc.status.NOT_FOUND,
                message: err.message
            });
        });
    },
    Delete: (call, callback) => {
        logger.debug('Popular Category Delete Request', {
            label: 'popularCategory',
            request: call.request
        });
        popularCategoryStorage.delete(call.request).then((result) => {
            callback(null);
        }).catch((err) => {
            logger.error(err.message, {
                function: 'delete popular category',
                request: call.request
            });
            callback({
                code: grpc.status.NOT_FOUND,
                message: err.message
            });
        });
    }
}

module.exports = brandService;