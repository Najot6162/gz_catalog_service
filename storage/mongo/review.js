const Product = require("../../models/Product");
const Review = require("../../models/Review");
const Category = require("../../models/Category");
const logger = require("../../config/logger");
const cnf = require("../../config");
const mongoose = require("mongoose");
const async = require("async");

let reviewStorage = {
    create: (b) => {
        return new Promise((resolve, reject) => {
            if (!b.name) return reject(new Error("name is required"));

            let br = new Review(b);
            br.created_at = Date.now();

            br.save((err, newReveiw) => {
                if (err) return reject(err);
                return resolve(newReveiw);
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
                    ],
                };
            }
            let options = {
                skip: ((filters.page / 1 - 1) * filters.limit) / 1,
                limit: filters.limit / 1 ? filters.limit / 1 : 10,
                sort: { created_at: -1 },
            };
            logger.debug("filtering reviews", {
                query,
                options,
            });
            async.parallel(
                [
                    (cb) => {
                        Review.find(query, {}, options, (err, reviews) => {
                            if (err) return reject(err);
                            return cb(null, reviews || []);
                        });
                    },
                    (cb) => {
                        Review.countDocuments(query, (err, count) => {
                            if (err) return cb(err);
                            return cb(null, count);
                        });
                    },
                ],
                (err, results) => {
                    if (err) return reject(err);
                    let reviews = results[0];
                    // setting image
           
                    return resolve({
                        reviews,
                        count: results[1],
                    });
                }
            );
            // }
        });
    },
    delete: (req) => {
        return new Promise((resolve, reject) => {
            if (!req.id) return reject(new Error("ID is not provided"));

            Review.findByIdAndDelete(req.id, (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            });
        });
    },



};

module.exports = reviewStorage;
