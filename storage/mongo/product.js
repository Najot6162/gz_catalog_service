const mongoose = require('mongoose');
const async = require('async');
const Category = require('../../models/Category');
const Product  = require('../../models/Product');
const Brand    = require('../../models/Brand');

const logger = require('../../config/logger');

let productStorage = {
    create: (b) => {
        return new Promise((resolve, reject) => {
            if(!b.name) return reject(new Error('name is required'));
            if(!b.category_id) return reject(new Error('category field is required'));

            let p = new Product(b);
            p.category   = b.category_id || null;
            p.brand      = b.brand_id || null;
            p.created_at = Date.now();
            p.updated_at = Date.now();

            p.save((err, product) => {
                if(err) return reject(err);
                product.populate({
                    path: 'category'
                }).populate({
                    path: 'brand'
                }).execPopulate().then((populatedProduct) => {
                    if(err) return reject(err);
                    return resolve(populatedProduct);
                }).catch((err) => {
                    return reject(err);
                });
            });
        });
    },
    update: (b) => {
        return new Promise((resolve, reject) => {
            if(!b.id) return reject(new Error('ID is not provided'));
            if(!b.name) return reject(new Error('name is required'));
            if(!b.category_id) return reject(new Error('category field is required'));

            Product.findById(b.id, (err, product) => {
                if(err) return reject(err);
                if(!product) return reject(new Error('Document with id:' + b.id + ' not found'));

                product.name = b.name;
                product.category = b.category_id || null;
                product.brand = b.brand_id || null;
                product.active = b.active;
                product.preview_text = b.preview_text;
                product.description = b.description;
                product.order = b.order;
                product.image = b.image;

                product.save((err, updatedProduct) => {
                    if(err) return reject(err);
                    product.populate({
                        path: 'category'
                    }).populate({
                        path: 'brand'
                    }).execPopulate().then((populatedProduct) => {
                        if(err) return reject(err);
                        return resolve(populatedProduct);
                    }).catch((err) => {
                        return reject(err);
                    });
                });
            });
        });
    },
    updatePrice: (b) => {
        return new Promise((resolve, reject) => {
            if(!b.product_id) return reject(new Error('Product ID is not provided'));
            //if(!b.price_type_id) return reject(new Error('price type ID is required'));

            Product.findById(b.product_id, (err, product) => {
                if(err) return reject(err);
                if(!product) return reject(new Error('Document with id:' + b.product_id + ' not found'));

                if(mongoose.Types.ObjectId.isValid(b.price_type_id)){
                    // valid price type is given, so we are updating 'prices' field
                    let updated = false;
                    product.prices = product.prices.map((price, i) => {
                        if(price.type.toString() == b.price_type_id){
                            price.price = b.price;
                            price.old_price = b.old_price;
                            updated = true;
                        }
                        return price;
                    });
                    if(!updated){
                        product.prices.push({
                            type: b.price_type_id,
                            price: b.price,
                            old_price: b.old_price
                        });
                    }
                }else{
                    // price type is NOT given, so we are saving it as a default price for the product
                    product.price = {
                        price: b.price,
                        old_price: b.old_price
                    }
                }

                product.save((err, updatedProduct) => {
                    if(err) return reject(err);
                    resolve(updatedProduct);
                });
            });
        });
    },
    updateProperty: (b) => {
        return new Promise((resolve, reject) => {
            if(!b.product_id) return reject(new Error('Product ID is not provided'));
            if(!b.property_id) return reject(new Error('Property ID is required'));

            Product.findById(b.product_id, (err, product) => {
                if(err) return reject(err);
                if(!product) return reject(new Error('Document with id:' + b.product_id + ' not found'));

                let updated = false;
                product.properties = product.properties.map((property, i) => {
                    if(property.property.toString() == b.property_id){
                        property.value = b.value;
                        updated = true;
                    }
                    return property;
                });
                if(!updated){
                    product.properties.push({
                        property: b.property_id,
                        value: b.value
                    });
                }

                product.save((err, updatedProduct) => {
                    if(err) return reject(err);
                    resolve(updatedProduct);
                });
            });
        });
    },
    find: (filters) => {
        return new Promise((resolve, reject) => {
            let query = {};

            // filter by search key
            if(filters.search.trim()){
                query = { 
                    ...query,
                    $or: [{
                        name: {$regex: '.*' + filters.search + '.*'}
                    }, {
                        slug: {$regex: '.*' + filters.search + '.*'}
                    }, {
                        description: {$regex: '.*' + filters.search + '.*'}
                    }]
                };
            }

            // filter by category
            if(mongoose.Types.ObjectId.isValid(filters.category)){
                query = {
                    ...query,
                    category: filters.category
                }
            }

            // filter by brand
            let brands = filters.brand.split(',').filter((f) => {
                return mongoose.Types.ObjectId.isValid(f.trim());
            }).map((f, i) => f.trim());
            if(brands.length){
                query = {
                    ...query,
                    brand: { $in: brands }
                }
            }

            // filter by price
            let priceQuery = {};
            if(filters.price_from){
                priceQuery = {
                    ...priceQuery,
                    $gte: filters.price_from 
                };
            }
            if(filters.price_till){
                priceQuery = {
                    ...priceQuery,
                    $lte: filters.price_till
                }
            }
            if(Object.keys(priceQuery).length) query["price.price"] = priceQuery;

            let options = {
                skip: filters.page/1 * filters.limit/1,
                limit: filters.limit/1
            }

            if(filters.sort){
                let sortParams = filters.split('|');
                if(sortParams.length == 2 && (sortParams[1] == 'asc' || sortParams[1] == 'desc')){
                    options.sort = {};
                    options.sort[sortParams[0]] = sortParams[1] == 'asc' ? 1 : -1;
                }
            }

            logger.debug('filtering products', {
                query,
                options
            });

            async.parallel([
                (cb) => {
                    Product.find(query, {}, options).populate({
                        path: 'category'
                    }).populate({
                        path: 'brand'
                    }).exec((err, products) => {
                        if(err) return reject(err);
                        return cb(null, products || []);
                    });
                },
                (cb) => {
                    Product.countDocuments(query, (err, count) => {
                        if(err) return cb(err);
                        return cb(null, count);
                    });
                }
            ], (err, results) => {
                if(err) return reject(err);
                return resolve({
                    products: results[0],
                    count: results[1]
                });
            });
        });
    },
    get: (req) => {
        return new Promise((resolve, reject) => {
            if(!(req.id || req.slug)) return reject(new Error('Key is not given'));

            let query = {}
            if(req.id) query._id = req.id;
            if(req.slug) query.slug = req.slug;
            Product.findOne(query).populate({
                path: 'category'
            }).populate({
                path: 'brand'
            }).exec((err, product) => {
                if(err) return reject(err);
                if(!product) return reject(new Error('Document not found'));
                return resolve(product);
            });
        });
    },
    delete: (req) => {
        return new Promise((resolve, reject) => {
            if(!req.id) return reject(new Error('ID is not provided'));

            Product.findByIdAndDelete(req.id, (err, result) => {
                if(err) return reject(err);
                return resolve(result);
            });
        });
    }
}

module.exports = productStorage;