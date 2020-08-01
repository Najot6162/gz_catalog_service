const grpc = require('grpc');
const brandStorage = require('../storage/mongo/brand');
const logger = require('../config/logger');

const brandService = {
    Create: (call, callback) => {
        logger.debug('Brand Create Request', {
            label: 'brand',
            request: call.request
        });
        brandStorage.create(call.request).then((result) => {
            callback(null, { brand: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'create brand',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Update: (call, callback) => {
        logger.debug('Brand Update Request', {
            label: 'brand',
            request: call.request
        });
        brandStorage.update(call.request).then((result) => {
            callback(null, { brand: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'update brand',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Find: (call, callback) => {
        logger.debug('Brand Find Request', {
            label: 'brand',
            request: call.request
        });
        brandStorage.find(call.request).then((result) => {
            callback(null, {
                brands: result.brands,
                count: result.count
            });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'find brands',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Get: (call, callback) => {
        logger.debug('Brand Get Request', {
            label: 'brand',
            request: call.request
        });
        brandStorage.get(call.request).then((result) => {
            callback(null, { brand: result });
        }).catch((err) => {
            logger.error(err.message, {
                function: 'get brand',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Delete: (call, callback) => {
        logger.debug('Brand Delete Request', {
            label: 'brand',
            request: call.request
        });
        brandStorage.delete(call.request).then((result) => {
            callback(null);
        }).catch((err) => {
            logger.error(err.message, {
                function: 'delete brand',
                request: call.request
            });
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    }
}

module.exports = brandService;