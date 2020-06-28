const mongoose = require('mongoose');
const Category = require('../../models/Category');
const Product = require('../../models/Product');
const logger = require('../../config/logger');

let categoryStorage = {
    create: (b) => {
        return new Promise((resolve, reject) => {
            if(!b.name) return reject(new Error('name is required'));
            
            let c = new Category(b);
            c.parent     = b.parent_id || null;
            c.product_property_groups = b.product_property_groups.trim() ? b.product_property_groups.trim().split(',') : [];
            c.created_at = Date.now();
            c.updated_at = Date.now();

            c.save((err, cat) => {
                if(err) return reject(err);
                return resolve(cat);
            });
        });
    },
    update: (b) => {
        return new Promise((resolve, reject) => {
            if(!b.id) return reject(new Error('ID is not provided'));
            if(!b.name) return reject(new Error('name is required'));

            Category.findById(b.id, (err, cat) => {
                if(err) return reject(err);
                if(!cat) return reject(new Error('Document with id:' + b.id + ' not found'));

                cat.name = b.name;
                cat.parent = b.parent_id || null;
                cat.active = b.active;
                cat.description = b.description;
                cat.order = b.order;
                cat.image = b.image;
                cat.product_property_groups = b.product_property_groups.trim() ? b.product_property_groups.trim().split(',') : [];

                cat.save((err, updatedCategory) => {
                    if(err) return reject(err);
                    resolve(updatedCategory);
                });
            });
        });
    },
    find: (filters) => {
        return new Promise((resolve, reject) => {
            let query = {};
            query = {
                ...query,
                parent: null
            }
            if(filters.search.trim()){
                query = { 
                    ...query,
                    $or: [{
                        name: {$regex: '.*' + filters.search + '.*'}
                    },{
                        slug: {$regex: '.*' + filters.search + '.*'}
                    }]
                };
            }

            let a = Category.aggregate([
                { $match: query },
                { 
                    $lookup: {
                        from: 'categories',
                        localField: '_id',
                        foreignField: 'parent',
                        as: 'children'
                    }
                }
            ]);

            if(filters.limit/1){
                a.skip((filters.page - 1) * filters.limit/1);
                a.limit(filters.limit/1);
            }
            
            a.exec((err, categories) => {
                if(err) return reject(err);

                // aggregation returns simple js objects (not mongoose documents), so we should add 'id' field
                categories = categories.map((c, i) => ({
                    ...c,
                    id: c._id,
                    children: c.children ? c.children.map((ch, j) => ({
                        ...ch,
                        id: ch._id
                    })) : null
                }));
                resolve(categories);
            });
        });
    },
    get: (req) => {
        return new Promise((resolve, reject) => {
            if(!(req.id || req.slug)) return reject(new Error('ID is not given'));

            let query = {}
            if(mongoose.Types.ObjectId.isValid(req.id)) query._id = mongoose.Types.ObjectId(req.id);
            if(req.slug) query.slug = req.slug;
            Category.aggregate([
                { $match: query },
                { $limit: 1},
                {
                    $lookup: {
                        from: 'categories',
                        localField: '_id',
                        foreignField: 'parent',
                        as: 'children'
                    }
                }, {
                    $lookup: {
                        from: 'categories',
                        localField: 'parent',
                        foreignField: '_id',
                        as: 'parent'
                    }
                }, {
                    $unwind: {
                        path: '$parent',
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]).exec((err, cat) => {
                if(err) return reject(err);
                logger.debug('getting category result', { cat });
                if(!cat.length) return reject(new Error('Document not found'));
                cat = cat[0];
                cat = {
                    ...cat,
                    id: cat._id,
                    children: cat.children ? cat.children.map((ch, i) => ({
                        ...ch,
                        id: ch._id
                    })) : null,
                    parent: cat.parent ? {
                        ...cat.parent,
                        id: cat.parent._id
                    } : null
                }
                return resolve(cat);
            });
        });
    },
    delete: (req) => {
        return new Promise((resolve, reject) => {
            if(!req.id) return reject(new Error('ID is not provided'));

            // set parentid of orphan categories to null
            Category.update({parent: req.id}, {
                $set: {parent: null, updated_at: Date.now()}
            }, {many: true}, (err, updateResult) => {
                console.log('orphan categories updated', updateResult);
            });

            // update products of this category
            Product.update({category: req.id}, {
                $set: {category: null, updated_at: Date.now()}
            }, {many: true}, (err, updateResult) => {
                console.log('orphan products updated after category removal', updateResult);
            });

            Category.findByIdAndDelete(req.id, (err, result) => {
                if(err) return reject(err);
                return resolve(result);
            });
        });
    }
}

module.exports = categoryStorage;