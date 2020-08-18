const Product = require("../../models/Product");
const Feedback = require("../../models/Feedback");
const logger = require("../../config/logger");
const cnf = require("../../config");
const langs = ["en", "ru", "uz"];
const mongoose = require("mongoose");
const async = require("async");

let feedbackStorage = {
    create: (b) => {
        return new Promise((resolve, reject) => {
            if (!b.customer_name) return reject(new Error("Customer name is required"));
            if (!b.product_id) return reject(new Error("Product id is required"));
            Product.findOne({ slug: b.product_id, lang: cnf.lang }, (err, product) => {
                if (err) return reject(err);
                if (!product) return reject(err);
                console.log(product);
                let br = new Feedback(b);
                br.product_id = product.id;
                br.created_at = Date.now();
                br.updated_at = Date.now();
                br.save((err, newFeedback) => {
                    if (err) return reject(err);
                    return resolve(newFeedback);
                });
            })
        });
    },
    update: (b) => {
        return new Promise((resolve, reject) => {
            if (!b.id) return reject(new Error("ID is not provided"));
            if (!b.customer_name) return reject(new Error("name is required"));
            if (!b.customer_id) return reject(new Error("Customer id is required"));
            Feedback.findById(b.id, (err, br) => {
                if (err) return reject(err);
                if (!br)
                    return reject(new Error("Document with id:" + b.id + " not found"));

                br.customer_name = b.customer_name;
                br.customer_id = b.customer_id;
                br.rate = b.rate;
                br.comment = b.comment;
                br.active = b.active;
                br.updated_at = Date.now();

                br.save((err, updatedFeedback) => {
                    if (err) return reject(err);
                    resolve(updatedFeedback);
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
                        customer_name: { $regex: ".*" + filters.search + ".*" },
                    },
                    {
                        slug: { $regex: ".*" + filters.search + ".*" },
                    },
                    {
                        comment: { $regex: ".*" + filters.search + ".*" },
                    },
                    ],
                };
            }

            let options = {
                skip: ((filters.page / 1 - 1) * filters.limit) / 1,
                limit: filters.limit / 1 ? filters.limit / 1 : 10,
                sort: { created_at: -1 },
            };
            logger.debug("filtering brands", {
                query,
                options,
            });
            async.parallel(
                [
                    (cb) => {
                        Feedback.find(query, {}, options, (err, feedbacks) => {
                            if (err) return reject(err);
                            return cb(null, feedbacks || []);
                        });
                    },
                    (cb) => {
                        Feedback.countDocuments(query, (err, count) => {
                            if (err) return cb(err);
                            return cb(null, count);
                        });
                    },
                ],
                (err, results) => {
                    if (err) return reject(err);
                    let feedbacks = results[0];
                    return resolve({
                        feedbacks,
                        count: results[1],
                    });
                }
            );
        });
    },
    findByProductId: (filters) => {
        return new Promise((resolve, reject) => {
            let query = {};
            Product.findOne({ slug: filters.product_id, lang: cnf.lang }, (err, product) => {
                if (err) return reject(err);
                if (!product) return reject(err);
                if (filters.product_id) {
                    query = {
                        ...query,
                        product_id: product.id
                    }
                }
                let options = {
                    skip: ((filters.page / 1 - 1) * filters.limit) / 1,
                    limit: filters.limit / 1 ? filters.limit / 1 : 10,
                    sort: { created_at: -1 },
                };
                logger.debug("filtering brands", {
                    query,
                    options,
                });
                async.parallel(
                    [
                        (cb) => {
                            Feedback.find(query, {}, options, (err, feedbacks) => {
                                if (err) return reject(err);
                                return cb(null, feedbacks || []);
                            });
                        },
                        (cb) => {
                            Feedback.countDocuments(query, (err, count) => {
                                if (err) return cb(err);
                                return cb(null, count);
                            });
                        },
                    ],
                    (err, results) => {
                        if (err) return reject(err);
                        let feedbacks = results[0];
                        return resolve({
                            feedbacks,
                            count: results[1],
                        });
                    }
                );
            })

        });
    },
    get: (req) => {
        return new Promise((resolve, reject) => {
            if (!req.id) return reject(new Error("Key is not given"));

            let query = {};
            if (req.id) query._id = req.id;
            Feedback.findOne(query, (err, br) => {
                console.log(br);
                if (err) return reject(err);
                if (!br) return reject(new Error("Document not found"));
                return resolve(br);
            });
        });
    },
    delete: (req) => {
        return new Promise((resolve, reject) => {
            if (!req.id) return reject(new Error("ID is not provided"));
            Feedback.findByIdAndDelete(req.id, (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            });
        });
    },
};

module.exports = feedbackStorage;