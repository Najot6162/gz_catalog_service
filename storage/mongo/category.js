const Category = require('../../models/Category');
const Product = require('../../models/Product');

let categoryStorage = {
    create: (category) => {
        return new Promise((resolve, reject) => {
            let c = new Category(category);

            c.product_property_groups = category.product_property_groups.trim() ? category.product_property_groups.trim().split(',') : [];
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
            if(!b.name && b.name == null) return reject(new Error('name is required'));

            Category.findById(b.id, (err, cat) => {
                if(err) return reject(err);
                if(!cat) return reject(new Error('Document with id:' + b.id + ' not found'));

                cat.name = b.name;
                cat.parent = b.parent_id || null;
                cat.active = b.active;
                cat.description = b.description;
                cat.order = b.order;
                cat.image = b.image;

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

            Category.find(query, (err, categories) => {
                if(err) return reject(err);
                resolve(categories);
            });
        });
    },
    get: (req) => {
        return new Promise((resolve, reject) => {
            if(!(req.id || req.slug)) return reject(new Error('ID is not given'));

            let query = {}
            if(req.id) query._id = req.id;
            if(req.slug) query.slug = req.slug;
            Category.findOne(query, (err, cat) => {
                if(err) return reject(err);
                if(!cat) return reject(new Error('Document not found'));
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