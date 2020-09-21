const fs = require("fs");
const path = require("path");
const async = require("async");
const mongoose = require("mongoose");
const request = require("request")
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Shop = require("../models/Shop");

const logger = require("../config/logger.js");
const { resolve } = require("path");

const uploadUrl = "https://dev.goodzone.uz/v1/upload";
const langs = ['en', 'ru', 'uz'];

const importBrands = () => (
    new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "brands.json"), 'utf8', (err, fileContent) => {
            if (err) return reject(err);
            oldBrands = JSON.parse(fileContent);
            console.log("brands file loaded, " + oldBrands.length + " entities");

            fs.readFile(path.join(__dirname, "brands_11.09.2020.json"), 'utf8', (err, newFileContent) => {
                if (err) return reject(err);
                newBrands = JSON.parse(newFileContent);
                console.log("brands file loaded, " + newBrands.length + " entities");

                brands = newBrands.filter((b, i) => {
                    let oldBrand = oldBrands.filter((o_c, j) => o_c.id == b.id)
                    return oldBrand.length ? false : true;
                });
                console.log("new brands: " + brands.length);

                let entities = brands.map((b, i) => {
                    return {
                        external_id: b.id,
                        slug: b.slug,
                        name: b.name,
                        order: b.sort_order,
                        description: b.description
                    }
                });

                Brand.create(entities, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        });
    })
)

const importCategories = () => (
    new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "categories.json"), 'utf8', (err, fileContent) => {
            if (err) return reject(err);
            oldCategories = JSON.parse(fileContent);
            console.log("old categories file loaded, " + oldCategories.length + " entities");

            fs.readFile(path.join(__dirname, "categories_11.09.2020.json"), 'utf8', (err, newFileContent) => {
                if (err) return reject(err);
                newCategories = JSON.parse(newFileContent);
                console.log("new categories file loaded, " + newCategories.length + " entities");

                categories = newCategories.filter((p, i) => {
                    let oldCategory = oldCategories.filter((o_c, j) => o_c.id == p.id)
                    return oldCategory.length ? false : true;
                });
                console.log("new categories: " + categories.length);

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
                    // getting parent
                    let parent = [];
                    new Promise((resolvee, rejectt) => {
                        parent = entities.filter((c, i) => {
                            return cat.parent_id && c.external_id == cat.parent_id;
                        });
                        if(!parent.length && cat.parent_id){
                            Category.find({
                                external_id: cat.parent_id
                            }, (err, parent) => {
                                if(err) return cb(err);
                                if(parent.length){
                                    resolvee({
                                        ru: parent.filter((p, i) => p.lang == 'ru')[0],
                                        en: parent.filter((p, i) => p.lang == 'en')[0],
                                        uz: parent.filter((p, i) => p.lang == 'uz')[0]
                                    });
                                }else{
                                    resolvee({
                                        ru: null
                                    });
                                }
                            });
                        }else{
                            resolvee({
                                ru: parent
                            });
                        }
                    }).then((parent) => {
                        let self = entities.filter((c, i) => {
                            return c.external_id == cat.id;
                        })[0];
                        //logger.debug("parent found for category " + cat.id)
                        let entity = {
                            external_id: cat.id,
                            slug: cat.slug,
                            name: cat.name,
                            description: cat.description
                        }
                        let entityRu = self;
                        entityRu.parent = parent.ru ? parent.ru._id : null;
    
                        let entityLangs = [
                            entityRu,
                            new Category({
                                ...entity,
                                parent: parent.uz ? parent.uz._id : (parent.ru ? parent.ru._id : null),
                                lang: 'uz'
                            }),
                            new Category({
                                ...entity,
                                parent: parent.en ? parent.en._id : (parent.ru ? parent.ru._id : null),
                                lang: 'en'
                            })
                        ];
    
                        Category.insertMany(entityLangs, (err, result) => {
                            if (err) return cb(err);
                            cb(null)
                        });
                    });
                }, (err) => {
                    if (err) return reject(err);
                    logger.profile("categories imported");
                    //logger.debug('existing categories', { entities });
                    return resolve();
                });
            });
        });
    })
)

const importProducts = () => (
    new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "products_31.07.2020.json"), 'utf8', (err, fileContent) => {
            if (err) return reject(err);
            oldProducts = JSON.parse(fileContent);
            console.log("old products file loaded, " + oldProducts.length + " entities");

            fs.readFile(path.join(__dirname, "products_11.09.2020.json"), 'utf-8', (err, newFileContent) => {
                newProducts = JSON.parse(newFileContent)
                console.log("all products file loaded, " + newProducts.length + " entities");

                products = newProducts.filter((p, i) => {
                    let oldProduct = oldProducts.filter((o_p, j) => o_p.id == p.id)
                    return (oldProduct.length) ? false : true;
                });
                console.log("new products: " + products.length);

                async.parallel({
                    brands: (cb) => {
                        Brand.find({ active: true }, cb);
                    },
                    categories: (cb) => {
                        Category.find({
                            active: true,
                            lang: 'ru'
                        }, cb);
                    }
                }, (err, result) => {
                    if (err) return reject(err);
    
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
    
                        Product.create(entityLangs, (err, result) => {
                            if (err) return cb(err);
                            cb(null)
                        });
                        //console.log('new product ' + p.id);
                    }, (err) => {
                        if (err) return reject(err);
                        logger.profile("products imported");
                        return resolve();
                    });
                })
            })
        });
    })
)

const importProductImages = () => (
    new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "system_files_11.09.2020.json"), 'utf8', (err, fileContent) => {
            if (err) return reject(err);
            files = JSON.parse(fileContent);
            console.log("files file loaded, " + files.length + " entities");

            Product.find({
                active: true,
                lang: 'ru',
                image: null
            }, (err, products) => {
                if (err) return reject(err);

                // products = products.filter((p, i) => {
                //     return p.external_id == 124;
                // });
                console.log('products ' + products.length); // 1

                logger.profile("files processed");
                let productsProcessed = 0;
                async.eachSeries(products, (p, cb) => {
                    let images = files.filter((f, i) => {
                        return f.attachment_id / 1 == p.external_id;
                    });
                    console.log(images.length + " images for product " + p.external_id);

                    let processed = 0;
                    let image = "";
                    let gallery = [];

                    async.eachSeries(images, (f, callb) => {
                        uploadImage(f).then((filename) => {
                            if (f.field == "preview_image") image = filename;
                            if (f.field == "images") gallery.push(filename);
                            processed++;
                            callb();
                        }).catch((err) => {
                            console.log("Error on uploading file for product " + p.external_id + ": " + err);
                            callb();
                        });
                    }, (err) => {
                        if (err) return cb(err);
                        console.log(processed + " of " + images.length + " files processed for product " + p.external_id);
                        if (image || gallery.length) {
                            Product.updateMany({
                                slug: p.slug
                            }, {
                                $set: {
                                    image,
                                    gallery
                                }
                            }, (err, updateResult) => {
                                if (err) return cb(err);
                                console.log("product " + p.external_id + " is updated");
                                productsProcessed++;
                                cb();
                            });
                        } else {
                            return cb();
                        }
                    });

                }, (err) => {
                    if (err) return reject(err);
                    logger.profile("files processed");
                    console.log(productsProcessed + " products updated");
                    return resolve();
                });
            });
        });
    })
)

const importProductCodes = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "products_with_code_16.09.2020.json"), 'utf8', (err, fileContent) => {
            if (err) return reject(err);
            products = JSON.parse(fileContent);
            console.log("products file loaded, " + products.length + " entities");

            async.eachLimit(products, 10, (p, cb) => {
                if(!p.code) return cb();
                Product.updateMany({
                    external_id: p.id
                }, {
                    $set: {
                        code: p.code
                    }
                }, (err, updateResult) => {
                    if (err) return cb(err);
                    console.log("product " + p.id + " is updated");
                    return cb();
                });
            }, (err) => {
                if (err) return reject(err);
                return resolve();
            });
        });
    });
}

const importShops = () => (
    new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "shops.json"), 'utf8', (err, fileContent) => {
            if (err) return reject(err);
            shops = JSON.parse(fileContent);
            console.log("shops file loaded, " + shops.length + " entities");

            logger.profile("shops imported");
            async.eachSeries(shops, (sh, cb) => {
                logger.debug('importing shop', {shop:sh})
                let entity = {
                    external_id: sh.id,
                    name: sh.name,
                    slug: sh.slug,
                    address: sh.address,
                    address2: sh.reference_point,
                    phone: sh.phone,
                    working_hours: sh.working_hours,
                    order: sh.id,
                    updated_at: Date.now()
                }

                let entityLangs = [
                    new Shop({
                        ...entity,
                        lang: 'ru'
                    }),
                    new Shop({
                        ...entity,
                        lang: 'uz'
                    }),
                    new Shop({
                        ...entity,
                        lang: 'en'
                    })
                ];

                //entityLangs[0].save(cb)

                Shop.create(entityLangs, (err, result) => {
                    if (err) return cb(err);
                    cb(null)
                });

            }, (err) => {
                if (err) return reject(err);
                logger.profile("shops imported");
                return resolve();
            });
        });
    })
)

const importShopStocks = () => (
    new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "shops_stock.json"), 'utf8', (err, fileContent) => {
            if (err) return reject(err);
            stock = JSON.parse(fileContent);
            console.log("stock file loaded, " + stock.length + " entities");

            async.parallel({
                products: (cb) => {
                    return Product.find({
                        active: true,
                        lang: 'ru'
                    }, cb);
                },
                shops: (cb) => {
                    return Shop.find({
                        lang:'ru'
                    }, cb);
                }
            }, (err, result) => {
                if (err) return reject(err);

                console.log('products ' + result.products.length); // 1

                logger.profile("shops stock imported");
                async.eachSeries(result.shops, (sh, cb) => {
                    let shopStock = stock.filter((s, i) => s.shop_id == sh.external_id);
                    shopStock = shopStock.map((s, i) => {
                        let product = result.products.filter((p, j) => p.external_id == s.product_id);
                        return {
                            quantity: s.quantity,
                            product: product.length ? product[0]._id : 0 
                        }
                    }).filter((s, i) => s.product);

                    Shop.updateMany({
                        external_id: sh.external_id
                    }, {
                        $set: {products: shopStock}
                    }, (err, updateResult) => {
                        if (err) return cb(err);
                        console.log("shop " + sh.external_id + " is updated");
                        cb();
                    });
                }, (err) => {
                    if (err) return reject(err);
                    logger.profile("shops stock imported");
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
        Product.find({}, { 
            _id: 1, 
            lang:1, 
            external_id:1 
        }).exec((err, products) => {
            if (err) return reject(err);
            let ids = [];
            let externalIds = [];
            let duplications = [];

            for(let i=0; i < products.length; i++){
                if(externalIds.indexOf(products[i].external_id) < 0){
                    externalIds.push(products[i].external_id);
                }
            }

            for(let j=0; j < externalIds.length; j++){
                let productInstances = products.filter((p, k) => (p.external_id == externalIds[j]));
                if(productInstances.length !==3){
                    duplications.push({
                        external_id: externalIds[j],
                        items: productInstances.length
                    });
                }
                let necessaryProductIds = langs.map((l, i) => {
                    return productInstances.filter((p, k) => (p.lang == l))[0]._id;
                });

                for(let k = 0; k < productInstances.length; k++){
                    if(necessaryProductIds.indexOf(productInstances[k]._id) < 0) {
                        ids.push(productInstances[k]._id);
                    }
                }
            }

            logger.debug("duplications", {duplications});
            logger.debug("unnecessary id's", {ids});


            
            Product.deleteMany({
                _id: { $in: ids }
            }, (err, result) => {
                if (err) return reject(err);
                logger.debug("remove result", {result});
                resolve(result);
            });
        });
    })
);
//{ $expr: { $gt: ["$price.price", "$price.old_price"] } }
const addRecommendedField = () => {
    return new Promise((resolve, reject) => {
        Product.update({ $expr: { $gt: ["$price.price", "$price.old_price"] } },
            { $set: { recommended: false } },
            { multi: true },
            (err, products) => {
                if (err) return reject(err);
                console.log(products);
                return resolve();

            })
    })
}

module.exports = {
    importBrands,
    importCategories,
    importProducts,
    importShops,
    importShopStocks,
    removeDuplicateProducts,
    importProductImages,
    importProductCodes,
    addRecommendedField
}