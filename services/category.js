const categoryStorage = require('../storage/mongo/category');

const categoryService = {
    Create: (call, callback) => {
        categoryStorage.create(call.request).then((result) => {
            callback(null, result);
        }).catch((err) => {
            callback(err);
        });
    },
    Update: (call, callback) => {
        callback(null, {id: 1});
    },
    Find: (call, callback) => {
        callback(null, {id: 1});
    },
    Get: (call, callback) => {
        callback(null, {id: 1});
    },
    Delete: (call, callback) => {
        callback(null, {id: 1});
    }
}

module.exports = categoryService;