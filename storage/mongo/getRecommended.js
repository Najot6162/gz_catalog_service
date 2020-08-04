const mongoose = require("mongoose");
const async = require("async");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Brand = require("../../models/Brand");
const Shop = require("../../models/Shop");
const logger = require("../../config/logger");
const cnf = require("../../config");
const langs = ["en", "ru", "uz"];

Product.syncIndexes();

let getRecommendedStorage = {
    find: (filters) => {
        return new Promise((resolve, reject) => {
            let query = {
                lang: filters.lang ? filters.lang : cnf.lang,
                recommended: true
            };

            // filter by search key
            if (filters.search.trim()) {
                query = {
                    ...query,
                    $or: [
                        {
                            name: { $regex: ".*" + filters.search + ".*" },
                        },
                        {
                            slug: { $regex: ".*" + filters.search + ".*" },
                        },
                        {
                            description: { $regex: ".*" + filters.search + ".*" },
                        },
                    ],
                };
            }

            let options = {
                skip: ((filters.page / 1 - 1) * filters.limit) / 1,
                limit: filters.limit / 1 ? filters.limit / 1 : 10,
                sort: { created_at: -1 },
            };

            logger.debug("filtering products", {
                query,
                options,
            });

            async.parallel(
                [
                    (cb) => {
                        Product.find(query, {}, options)
                            .populate({
                                path: "category",
                            })
                            .populate({
                                path: "brand",
                            })
                            .exec((err, products) => {
                                if (err) return reject(err);
                                return cb(null, products || []);
                            });
                    },
                    (cb) => {
                        Product.countDocuments(query, (err, count) => {
                            if (err) return cb(err);
                            return cb(null, count);
                        });
                    },
                ],
                (err, results) => {
                    if (err) return reject(err);
                    let products = results[0];
                    for (let i = 0; i < products.length; i++) {
                        products[i].image = products[i].image
                            ? cnf.cloudUrl + products[i].image
                            : "";
                    }

                    return resolve({
                        products,
                        count: results[1],
                    });
                }
            );
        });
    },
};

module.exports = getRecommendedStorage;
