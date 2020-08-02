const fs =require("fs");
const path = require("path");
const async = require("async");
const mongoose = require("mongoose");
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product = require("../models/Product");

const logger = require("../config/logger.js");

Brand.syncIndexes();
Product.syncIndexes();

const importBrands = () => (
    new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "brands.json"), 'utf8', (err, fileContent) => {
            if(err) return reject(err);
            brands = JSON.parse(fileContent);
            console.log("brands file loaded, " + brands.length + " entities");

            let entities = brands.map((b, i) => {
                return {
                    external_id: b.id,
                    slug: b.slug,
                    name: b.name,
                    order: b.sort_order,
                    description: b.description
                }
            });

            // for(let i = 0; i < 1; i++){
            //     let b = new Brand(entities[i]);
            //     b.save((err, saveResult) => {
            //         if(err) return reject(err);
            //         console.log("brand is saved");
            //         resolve(saveResult);
            //     });
            // }
            
            Brand.create(entities, (err, result) => {
                if(err) return reject(err);
                resolve(result);
            });
        });
    })
)

const importCategories = () => (
    new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "categories.json"), 'utf8', (err, fileContent) => {
            if(err) return reject(err);
            categories = JSON.parse(fileContent);
            console.log("categories file loaded, " + categories.length + " entities");


            let entities = categories.map((b, i) => {
                return new Category({
                    external_id: b.id,
                    slug: b.slug,
                    name: b.name,
                    description: b.description,
                });
            });

            logger.profile("categories imported");
            async.eachSeries(categories, (cat, cb) => {
                let parent = entities.filter((c, i) => {
                    return cat.parent_id && c.external_id == cat.parent_id;
                });
                let self = entities.filter((c, i) => {
                    return c.external_id == cat.id;
                })[0];
                //logger.debug("parent found for category " + cat.id)
                let entity = {
                    external_id: cat.id,
                    slug: cat.slug,
                    name: cat.name,
                    description: cat.description,
                    parent: parent.length ? parent[0]._id : null
                }
                let entityRu = self;
                entityRu.parent = entity.parent;

                let entityLangs = [
                    entityRu, 
                    new Category({
                        ...entity,
                        lang: 'uz'
                    }),
                    new Category({
                        ...entity,
                        lang: 'en'
                    })
                ];

                Category.insertMany(entityLangs, (err, result) => {
                    if(err) return cb(err);
                    cb(null)
                });

            }, (err) => {
                if(err) return reject(err);
                logger.profile("categories imported");
                logger.debug('existing categories', {entities});
                return resolve();
            });
        });
    })
)

const importProducts = () => (
    new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "products.json"), 'utf8', (err, fileContent) => {
            if(err) return reject(err);
            products = JSON.parse(fileContent);
            console.log("products file loaded, " + products.length + " entities");


            // let entities = products.map((b, i) => {
            //     return new Category({
            //         external_id: b.id,
            //         slug: b.slug,
            //         name: b.name,
            //         description: b.description,
            //     });
            // });

            async.parallel({
                brands: (cb) => {
                    Brand.find({active: true}, cb);
                },
                categories: (cb) => {
                    Category.find({
                        active: true,
                        lang: 'ru'
                    }, cb);
                }
            }, (err, result) => {
                if(err) return reject(err);

                logger.profile("products imported");
                async.eachSeries(products, (p, cb) => {
                    let brand = result.brands.filter((b, i) => {
                        return p.brand_id && b.external_id == p.brand_id;
                    });
                    let category = result.categories.filter((c, i) => {
                        return c.external_id == p.category_id;
                    });
                    let entity = {
                        external_id: p.id,
                        name: p.name,
                        brand: brand.length ? brand[0]._id : null,
                        category: category.length ? category[0]._id : null,
                        description: p.description,
                        price: {
                            price: p.price,
                            old_price: p.old_price
                        },
                        prices: [{
                            type: 1, // unired price
                            price: p.u_price,
                            old_price: p.u_old_price
                        }],
                        updated_at: Date.now()
                    }

                    let entityLangs = [
                        new Product({
                            ...entity,
                            lang: 'ru'
                        }), 
                        new Product({
                            ...entity,
                            lang: 'uz'
                        }),
                        new Product({
                            ...entity,
                            lang: 'en'
                        })
                    ];

                    //entityLangs[0].save(cb)

                    Product.create(entityLangs, (err, result) => {
                        if(err) return cb(err);
                        cb(null)
                    });

                }, (err) => {
                    if(err) return reject(err);
                    logger.profile("products imported");
                    return resolve();
                });
            })

            
        });
    })
)

const importProductImages = () => (
    new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "active_product_files.json"), 'utf8', (err, fileContent) => {
            if(err) return reject(err);
            files = JSON.parse(fileContent);
            console.log("files file loaded, " + files.length + " entities");

            Products.find({
                active: true,
                lang: 'ru'
            }, (err, products) => {
                if(err) return reject(err);

                logger.profile("files imported");
                async.eachSeries(products, (p, cb) => {
                    let brand = result.brands.filter((b, i) => {
                        return p.brand_id && b.external_id == p.brand_id;
                    });
                    let category = result.categories.filter((c, i) => {
                        return c.external_id == p.category_id;
                    });
                    cb();
                }, (err) => {
                    if(err) return reject(err);
                    logger.profile("files imported");
                    return resolve();
                });
            })
        });
    })
)

module.exports = {
    importBrands,
    importCategories,
    importProducts
}