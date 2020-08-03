const fs =require("fs");
const path = require("path");
const async = require("async");
const mongoose = require("mongoose");
const request = require("request")
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product = require("../models/Product");

const logger = require("../config/logger.js");

const uploadUrl = "https://dev.goodzone.uz/v1/upload";

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

            Product.find({
                active: true,
                lang: 'ru',
                external_id: {$gt: 26}
            }, (err, products) => {
                if(err) return reject(err);

                // products = products.filter((p, i) => {
                //     return p.external_id == 124;
                // });
                console.log('products ' + products.length); // 1

                logger.profile("files processed");
                async.eachSeries(products, (p, cb) => {
                    let images = files.filter((f, i) => {
                        return f.attachment_id/1 == p.external_id;
                    });
                    console.log(images.length + " images for product " + p.external_id);

                    let processed = 0;
                    let image = "";
                    let gallery = [];

                    async.eachSeries(images, (f, callb) => {
                        uploadImage(f).then((filename) => {
                            if(f.field == "preview_image") image = filename;
                            if(f.field == "images") gallery.push(filename);
                            processed++;
                            callb();
                        }).catch((err) => {
                            console.log("Error on uploading file for product " + p.external_id + ": " + err);
                            callb();
                        });
                    }, (err) => {
                        if(err) return cb(err);
                        console.log(processed + " of " + images.length + " files processed for product " + p.external_id);
                        if(image || gallery.length){
                            Product.updateMany({
                                slug: p.slug
                            }, {
                                $set: {
                                    image,
                                    gallery
                                }
                            }, (err, updateResult) => {
                                if(err) return cb(err);
                                console.log("product " + p.external_id + " is updated");
                                cb();
                            });
                        }else{
                            return cb();
                        }
                    });
                    
                }, (err) => {
                    if(err) return reject(err);
                    logger.profile("files processed");
                    return resolve();
                });
            });
        });
    })
)

const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
        var req = request.post(uploadUrl, function (err, resp, body) {
            if (err) return reject(err);
            console.log("request finished");
            //console.log(resp);
            //console.log(body);
            try {
                return resolve(JSON.parse(body).filename);
            } catch (error) {
                console.log("invalid response from upload request: " + body);
                return resolve("");
            } 
        });

        // getting local image directory
        let folder1 = file.disk_name.substring(0, 3);
        let folder2 = file.disk_name.substring(3, 6);
        let folder3 = file.disk_name.substring(6, 9);
        let fileAddress = path.join(__dirname, "public", folder1, folder2, folder3, file.disk_name);
        //console.log("file address " + fileAddress);

        var form = req.form();
            form.append('file', fs.createReadStream(fileAddress), {
            filename: file.file_name,
            contentType: file.content_type
        });
    })
}

const removeDuplicateProducts = () => (
    new Promise((resolve, reject) => {
        Product.find({}, {_id: 1}).limit(2648).sort({created_at: -1}).exec((err, ids) => {
            if(err) return reject(err);
            ids = ids.map((p, i) => p._id);
            Product.remove({
                _id: {$in: ids}
            }, (err, result) => {
                if(err) return reject(err);
                resolve(result);
            });
        });
        
    })
);

module.exports = {
    importBrands,
    importCategories,
    importProducts,
    removeDuplicateProducts,
    importProductImages
}