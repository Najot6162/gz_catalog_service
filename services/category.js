const grpc = require('grpc');
const categoryStorage = require('../storage/mongo/category');

const categoryService = {
    Create: (call, callback) => {
        console.log('request');
        console.log(call.request);

        categoryStorage.create(call.request).then((result) => {
            callback(null, {category: result});
        }).catch((err) => {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Update: (call, callback) => {
        console.log('request');
        console.log(call.request);

        categoryStorage.update(call.request).then((result) => {
            callback(null, {category: result});
        }).catch((err) => {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Find: (call, callback) => {
        console.log('find request');
        console.log(call.request);
        categoryStorage.find(call.request).then((result) => {
            callback(null, {
                categories: result,
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
        categoryStorage.get(call.request).then((result) => {
            callback(null, {category: result});
        }).catch((err) => {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Delete: (call, callback) => {
        categoryStorage.delete(call.request).then((result) => {
            callback(null);
        }).catch((err) => {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    }
}

module.exports = categoryService;