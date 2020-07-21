const Product = require('../../models/Product');
const Brand   = require('../../models/Brand');

let brandStorage = {
    create: (b) => {
        return new Promise((resolve, reject) => {
            if(!b.name) return reject(new Error('name is required'));
            
            let br = new Brand(b);
            br.created_at = Date.now();
            br.updated_at = Date.now();

            br.save((err, newBrand) => {
                if(err) return reject(err);
                return resolve(newBrand);
            });
        });
    },
    update: (b) => {
        return new Promise((resolve, reject) => {
            if(!b.id) return reject(new Error('ID is not provided'));
            if(!b.name) return reject(new Error('name is required'));

            Brand.findById(b.id, (err, br) => {
                if(err) return reject(err);
                if(!br) return reject(new Error('Document with id:' + b.id + ' not found'));

                br.name = b.name;
                br.active = b.active;
                br.preview_text = b.preview_text;
                br.description = b.description;
                br.order = b.order;
                br.image = b.image;
                br.updated_at = Date.now();

                br.save((err, updatedBrand) => {
                    if(err) return reject(err);
                    resolve(updatedBrand);
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

            Brand.find(query, (err, brands) => {
                if(err) return reject(err);

                for(let i = 0; i < brands.length; i++) {
                    brands[i].image = brands[i].image ? cnf.cloudUrl + brands[i].image : '';
                }

                resolve(brands);
            });
        });
    },
    get: (req) => {
        return new Promise((resolve, reject) => {
            if(!(req.id || req.slug)) return reject(new Error('ID is not given'));

            let query = {}
            if(req.id) query._id = req.id;
            if(req.slug) query.slug = req.slug;
            Brand.findOne(query, (err, br) => {
                if(err) return reject(err);
                if(!br) return reject(new Error('Document not found'));
                return resolve(br);
            });
        });
    },
    delete: (req) => {
        return new Promise((resolve, reject) => {
            if(!req.id) return reject(new Error('ID is not provided'));

            // update products of this Brand
            Product.update({brand: req.id}, {
                $set: {brand: null, updated_at: Date.now()}
            }, {many: true}, (err, updateResult) => {
                console.log('orphan products updated after Brand removal', updateResult);
            });

            Brand.findByIdAndDelete(req.id, (err, result) => {
                if(err) return reject(err);
                return resolve(result);
            });
        });
    }
}

module.exports = brandStorage;