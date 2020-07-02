const Product = require('../../models/Product');
const Shop = require('../../models/Shop');

let shopStorage = {
    create: (b) => {
        return new Promise((resolve, reject) => {
            if (!b.name) return reject(new Error('name is required'));

            let br = new Shop(b);
            br.created_at = Date.now();
            br.updated_at = Date.now();

            br.save((err, newShop) => {
                if (err) return reject(err);
                return resolve(newShop);
            });
        });
    },
    update: (b) => {
        return new Promise((resolve, reject) => {
            if (!b.id) return reject(new Error('ID is not provided'));
            if (!b.name) return reject(new Error('name is required'));

            Shop.findById(b.id, (err, br) => {
                if (err) return reject(err);
                if (!br) return reject(new Error('Document with id:' + b.id + ' not found'));

                br.name = b.name;
                br.phone = b.phone;
                br.address = b.address;
                br.address2 = b.address2
                br.active = b.active;
                br.preview_text = b.preview_text;
                br.description = b.description;
                br.order = b.order;
                br.image = b.image;
                br.updated_at = Date.now();

                br.save((err, updatedShop) => {
                    if (err) return reject(err);
                    resolve(updatedShop);
                });
            });
        });
    },
    updateQuantity: (b) => {
        return new Promise((resolve, reject) => {
            if (!b.shop_id) return reject(new Error('Shop ID is not provided'));
            if (!b.product_id) return reject(new Error('Product ID is required'));

            Shop.findById(b.shop_id, (err, shop) => {
                if (err) return reject(err);
                if (!shop) return reject(new Error('Document with id:' + b.shop_id + ' not found'));

                let updated = false;
                shop.products = shop.products.map((product, i) => {
                    if (product.product.toString() == b.product_id) {
                        product.quantity = b.qunatity;
                        updated = true;
                    }
                    return product;
                });
                if (!updated) {
                    shop.products.push({
                        product: b.product_id,
                        quantity: b.quantity
                    });
                }

                shop.save((err, updatedShop) => {
                    if (err) return reject(err);
                    resolve(updatedShop);
                });
            });
        });
    },
    find: (filters) => {
        return new Promise((resolve, reject) => {
            let query = {};
            if (filters.search.trim()) {
                query = {
                    ...query,
                    $or: [{
                        name: { $regex: '.*' + filters.search + '.*' }
                    }, {
                        slug: { $regex: '.*' + filters.search + '.*' }
                    }]
                };
            }

            Shop.find(query, (err, shops) => {
                if (err) return reject(err);
                resolve(shops);
            });
        });
    },
    get: (req) => {
        return new Promise((resolve, reject) => {
            if (!(req.id || req.slug)) return reject(new Error('ID is not given'));
            let query = {}
            if (req.id) query._id = req.id;
            if (req.slug) query.slug = req.slug;
            Shop.findOne(query, (err, br) => {
                if (err) return reject(err);
                if (!br) return reject(new Error('Document not found'));
                return resolve(br);
            });
        });
    },
    delete: (req) => {
        return new Promise((resolve, reject) => {
            if (!req.id) return reject(new Error('ID is not provided'));
            Shop.findByIdAndDelete(req.id, (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            });
        });
    }
}

module.exports = shopStorage;