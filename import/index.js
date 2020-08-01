const fs =require("fs");
const path = require("path");
const async = require("async");
const Brand = require("../models/Brand");
const Category = require("../models/Category");

const logger = require("../config/logger.js");

Brand.syncIndexes();

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

module.exports = {
    importBrands,
    importCategories
}