const Product = require("../../models/Product");
const Brand = require("../../models/Brand");
const PopularCategory = require("../../models/PopularCategory");
const logger = require("../../config/logger");
const cnf = require("../../config");
const mongoose = require("mongoose");
const async = require("async");

let popularCategoryStorage = {
    create: (p) => {
        return new Promise((resolve, reject) => {

            let pc = new PopularCategory(p);
            pc.created_at = Date.now();
            pc.save((err, newPopulatCategory) => {
                if (err) return reject(err);
                return resolve(newPopulatCategory);
            });
        });
    },
    update: (p) => {
        return new Promise((resolve, reject) => {
            if (!p.id) return reject(new Error("ID is not provided"));
            // if (!p.slug) return reject(new Error("name is required"));

            PopularCategory.findById(p.id, (err, pc) => {
                if (err) return reject(err);
                if (!pc)
                    return reject(new Error("Document with id:" + b.id + " not found"));

                pc.name = p.name;
                pc.active = p.active;
                pc.image = p.image;
                pc.order = p.order;
                pc.slug = p.slug;
                pc.size = p.size;
                pc.updated_at = Date.now();

                pc.save((err, updatedPopularCategory) => {
                    if (err) return reject(err);
                    resolve(updatedPopularCategory);
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
                        name: { $regex: ".*" + filters.search + ".*" },
                    },
                    {
                        slug: { $regex: ".*" + filters.search + ".*" },
                    },
                    ],
                };
            }
            let options = {
                skip: ((filters.page / 1 - 1) * filters.limit) / 1,
                limit: filters.limit / 1 ? filters.limit / 1 : 10,
                sort: { created_at: -1 },
            };
            logger.debug("filtering popular categories", {
                query,
                options,
            });
            async.parallel(
                [
                    (cb) => {
                        PopularCategory.find(query, {}, options, (err, popularCategories) => {
                            if (err) return reject(err);
                            return cb(null, popularCategories || []);
                        });
                    },
                    (cb) => {
                        PopularCategory.countDocuments(query, (err, count) => {
                            if (err) return cb(err);
                            return cb(null, count);
                        });
                    },
                ],
                (err, results) => {
                    if (err) return reject(err);
                    let popularCategories = results[0];
                    // setting image
                    for (let i = 0; i < popularCategories.length; i++) {
                        popularCategories[i].image = popularCategories[i].image ?
                            cnf.cloudUrl + popularCategories[i].image :
                            "";
                    }
                    return resolve({
                        popularCategories,
                        count: results[1],
                    });
                }
            );
            // }
        });
    },
    get: (req) => {
        return new Promise((resolve, reject) => {
            console.log(req);
            if (!(req.id || req.slug)) return reject(new Error("ID is not given"));

            let query = {};
            if (req.id) query._id = req.id;
            if (req.slug) query.slug = req.slug;
            PopularCategory.findOne(query, (err, pc) => {
                if (err) return reject(err);
                if (!pc) return reject(new Error("Document not found"));
                pc.image = pc.image ? cnf.cloudUrl + pc.image : "";
                return resolve(pc);
            });
        });
    },
    delete: (req) => {
        return new Promise((resolve, reject) => {
            if (!req.id) return reject(new Error("ID is not provided"));

            PopularCategory.findByIdAndDelete(req.id, (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            });
        });
    },
};

module.exports = popularCategoryStorage;