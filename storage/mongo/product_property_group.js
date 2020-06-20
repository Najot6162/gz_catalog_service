const Product = require('../../models/Product');
const ProductPropertyGroup = require('../../models/ProductPropertyGroup');

const logger = require('../../config/logger');

let productPropertyGroupStorage = {
    create: (b) => {
        return new Promise((resolve, reject) => {
            if(!b.name) return reject(new Error('name is required'));
            
            let br = new ProductPropertyGroup(b);
            br.properties = b.properties ? b.properties.split(',') : [];
            br.created_at = Date.now();
            br.updated_at = Date.now();
            
            br.save((err, newProductPropertyGroup) => {
                if(err) return reject(err);
                return resolve(newProductPropertyGroup);
            });
        });
    },
    update: (b) => {
        return new Promise((resolve, reject) => {
            if(!b.id) return reject(new Error('ID is not provided'));
            if(!b.name) return reject(new Error('name is required'));

            ProductPropertyGroup.findById(b.id, (err, ppg) => {
                if(err) return reject(err);
                if(!ppg) return reject(new Error('Document with id:' + b.id + ' not found'));

                ppg.name = b.name;
                ppg.description = b.description;
                ppg.order = b.order;
                ppg.active = b.active;
                ppg.properties = b.properties ? b.properties.split(',') : [];
                ppg.updated_at = Date.now();

                ppg.save((err, updatedProductPropertyGroup) => {
                    if(err) return reject(err);
                    resolve(updatedProductPropertyGroup);
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

            let options = {
                skip: filters.page/1 * filters.limit/1,
                limit: filters.limit/1
            }

            ProductPropertyGroup.find(query, {}, options, (err, productPropertyGroups) => {
                if(err) return reject(err);
                resolve(productPropertyGroups);
            });
        });
    },
    get: (req) => {
        return new Promise((resolve, reject) => {
            if(!(req.id || req.slug)) return reject(new Error('ID is not given'));

            let query = {}
            if(req.id) query._id = req.id;
            if(req.slug) query.slug = req.slug;
            ProductPropertyGroup.findOne(query, (err, br) => {
                if(err) return reject(err);
                if(!br) return reject(new Error('Document not found'));
                return resolve(br);
            });
        });
    },
    delete: (req) => {
        return new Promise((resolve, reject) => {
            if(!req.id) return reject(new Error('ID is not provided'));

            // update categories that has this ProductPropertyGroup
            Product.update({
                product_property_groups: req.id
            }, {
                $pull: { product_property_groups: { $eq: req.id } },
                $set: { updated_at: Date.now() }
            }, (err, updateResult) => {
                if(err){
                    logger.error('error on updating product after productPropertyGroupDeletion :' + err.message, {
                        function: 'category update',
                        productPropertyGroupId: req.id
                    });
                }
                logger.debug('categories with propertyGroup ' + req.id + ' were updated, because, this product property group is going to be deleted', {
                    updateResult
                });
            });

            ProductPropertyGroup.findByIdAndDelete(req.id, (err, result) => {
                if(err) return reject(err);
                return resolve(result);
            });
        });
    }
}

module.exports = productPropertyGroupStorage;