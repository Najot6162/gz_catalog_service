const grpc = require('grpc');
const brandStorage = require('../storage/mongo/brand');

const brandService = {
    Create: (call, callback) => {
        console.log('request');
        console.log(call.request);

        brandStorage.create(call.request).then((result) => {
            callback(null, {brand: result});
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

        brandStorage.update(call.request).then((result) => {
            callback(null, {brand: result});
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
        brandStorage.find(call.request).then((result) => {
            callback(null, {
                brands: result,
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
        brandStorage.get(call.request).then((result) => {
            callback(null, {brand: result});
        }).catch((err) => {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    },
    Delete: (call, callback) => {
        brandStorage.delete(call.request).then((result) => {
            callback(null);
        }).catch((err) => {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message
            });
        });
    }
}

module.exports = brandService;