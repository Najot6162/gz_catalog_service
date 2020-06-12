const grpc = require('grpc');
const productStorage = require('../storage/mongo/product');

const productService = {
    Create: (call, callback) => {
        console.log('request');
        console.log(call.request);

        productStorage.create(call.request).then((result) => {
            callback(null, {product: result});
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
        console.log('request');
        console.log(call.request);

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
        console.log('request');
        console.log(call.request);

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
        console.log('find request');
        console.log(call.request);
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