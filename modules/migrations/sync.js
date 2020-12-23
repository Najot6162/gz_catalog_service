const async = require('async');
const Product = require('../../models/Product');
const cnf = require('../../config');
const logger = require("../../config/logger.js");

// Function to synchronize some fields which shiuld be the same for each lang. Fields:
// 1. active
// 2. image
// 3. gallery
const syncProductsFieldsForLangs = () => (
    new Promise((resolve, reject) => {
        logger.profile('synchronizing product fields');
        Product.find({
            lang: cnf.lang
        }, {
            slug: 1, 
            active: 1,
            image: 1,
            gallery: 1
        }, (err, products) => {
            if(err) return reject(err);
            async.eachLimit(products, 100, (p, cb) => {
                Product.updateMany({
                    slug: p.slug,
                    lang: { $ne: cnf.lang }
                }, {
                    active: p.active,
                    image: p.image,
                    gallery: p.gallery
                }, cb);
            }, (err) => {
                if(err) return reject(err);
                logger.profile('synchronizing product fields');
                resolve({
                    products: products.length
                });
            });
        });
    })
);

module.exports = {
    syncProductsFieldsForLangs
}