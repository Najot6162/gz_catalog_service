const mongoose = require("mongoose");
const Product = require("../../models/Product");
const logger = require("../../config/logger");
const cnf = require("../../config");
const async = require("async");
const langs = ["en", "ru", "uz"];
const FeaturedList = require("../../models/featured_list");

const FeaturedListsForHomePage = [
  "novye-postupleniya",
  "populyarnye-tovary",
  "luchshaya-podborka-dlya-vas",
];

let featuredListStore = {
  create: (data) => {
    return new Promise((resolve, reject) => {
      if (!data.title) return reject(new Error("Title is required"));
      let c = data;
      c.lang = data.lang ? data.lang : cnf.lang;
      c.products = data.products
        .split(",")
        .filter((f) => {
          return mongoose.Types.ObjectId.isValid(f.trim());
        })
        .map((f, i) => f.trim())
        .filter((item, pos, self) => {
          return self.indexOf(item) == pos;
        });
      c.created_at = Date.now();
      c.updated_at = Date.now();
      let cCopy = c;
      c = new FeaturedList(c);
      c.save((err, featuredList) => {
        if (err) return reject(err);
        let otherLangs = langs.filter((lang, i) => lang != featuredList.lang);
        async.eachSeries(
          otherLangs,
          (otherLang, cb) => {
            let featuredListWithOtherLang = cCopy;
            featuredListWithOtherLang.lang = otherLang;
            featuredListWithOtherLang.slug = featuredList.slug;
            getProductsOtherLang(featuredList.products, otherLang)
              .then((gotProductsOtherLang) => {
                featuredListWithOtherLang.products = gotProductsOtherLang;
                featuredListWithOtherLang = new FeaturedList(
                  featuredListWithOtherLang
                );
                featuredListWithOtherLang.save((err, r) => {
                  if (err) return cb(err);
                  logger.debug(
                    "featured list is created with lang " + otherLang,
                    {
                      result: r,
                    }
                  );
                  cb(null, r);
                });
              })
              .catch(cb);
          },
          (err) => {
            if (err)
              logger.error(err.message, {
                function: "create featured list for other lang",
                featuredList,
              });
          }
        );
        featuredList
          .populate({ path: "products" })
          .execPopulate((err, populatedFeaturedList) => {
            if (err) return reject(err);
            return resolve(populatedFeaturedList);
          });
      });
    });
  },
  update: (data) => {
    return new Promise((resolve, reject) => {
      if (!data.lang) return reject(new Error("Lang is not provided"));
      if (!data.id) return reject(new Error("Key is not provided"));
      if (!data.title) return reject(new Error("title is required"));
      let query = {
        lang: data.lang,
        $or: [
          {
            slug: data.id,
          },
        ],
      };
      if (mongoose.Types.ObjectId.isValid(data.id))
        query.$or.push({ _id: data.id });
      FeaturedList.findOne(query, (err, result) => {
        if (err) return reject(err);
        if (!result)
          return reject(
            new Error("Document with id:" + data.id + " not found")
          );
        result.title = data.title;
        result.order = data.order;
        result.active = data.active;
        result.description = data.description;
        result.products = data.products
          .split(",")
          .filter((f) => {
            return mongoose.Types.ObjectId.isValid(f.trim());
          })
          .map((f, i) => f.trim())
          .filter((item, pos, self) => {
            return self.indexOf(item) == pos;
          });
        result.updated_at = Date.now();
        result.lang = data.lang;
        result.save((err, featuredList) => {
          if (err) return reject(err);
          let otherLangs = langs.filter((lang, i) => lang != featuredList.lang);
          async.eachSeries(
            otherLangs,
            (otherLang, cb) => {
              getProductsOtherLang(featuredList.products, otherLang)
                .then((gotProductsOtherLang) => {
                  FeaturedList.updateOne(
                    { slug: featuredList.slug, lang: otherLang },
                    {
                      products: gotProductsOtherLang,
                    },
                    (err, r) => {
                      if (err) return cb(err);
                      logger.debug(
                        "featured list is updated for lang " + otherLang,
                        {
                          result: r,
                        }
                      );
                      cb(null, r);
                    }
                  );
                })
                .catch(cb);
            },
            (err) => {
              if (err)
                logger.error(err.message, {
                  function: "update featured list for other lang",
                  featuredList,
                });
            }
          );
          featuredList
            .populate({ path: "products" })
            .execPopulate((err, populatedFeaturedList) => {
              if (err) return reject(err);
              return resolve(populatedFeaturedList);
            });
        });
      });
    });
  },

  get: (data) => {
    return new Promise((resolve, reject) => {
      if (!data.id) return reject(new Error("ID is not given"));
      let query = {
        lang: data.lang ? data.lang : cnf.lang,
        $or: [
          {
            slug: data.id,
          },
        ],
      };
      if (mongoose.Types.ObjectId.isValid(data.id))
        query.$or.push({ _id: data.id });
      console.log(data.id);
      logger.debug("finding a featured list", { query });
      FeaturedList.findOne(query)
        .populate({
          path: "products",
          populate: {
            path: "category",
          },
        })
        .populate({
          path: "properties.property",
        })  
        .exec((err, result) => {
          if (err) return reject(err);
          if (!result)
            return reject(
              new Error("Document with id:" + data.id + " not found")
            );

          if (result.products) {
            // image prefix
            for (let i = 0; i < result.products.length; i++) {
              result.products[i].image = result.products[i].image
                ? cnf.cloudUrl + result.products[i].image
                : "";
            }
            console.log(result)
            return resolve(result);
          }
        });
    });
  },

  find: (filters) => {
    return new Promise((resolve, reject) => {
      let query = { lang: filters.lang ? filters.lang : cnf.lang };
      let opt = {
        skip: ((filters.page / 1 - 1) * filters.limit) / 1,
        limit: filters.limit / 1 ? filters.limit / 1 : 10,
        sort: { created_at: -1 },
      };
      if (filters.active) {
        query = {
          ...query,
          active: true,
        };
      }
      if (filters.search.trim()) {
        var searchKey = filters.search;
        query = {
          ...query,
          $or: [
            {
              title: { $regex: ".*" + searchKey + ".*", $options: "i" },
            },
            {
              slug: { $regex: ".*" + searchKey + ".*", $options: "i" },
            },
            {
              description: { $regex: ".*" + searchKey + ".*", $options: "i" },
            },
          ],
        };
      }
      logger.debug("filtering featured_lists", {
        query,
        opt,
      });
      async.parallel(
        [
          (cb) => {
            FeaturedList.find(query, {}, opt)
              .populate({
                path: "products",
                populate: {
                  path: "category",
                },
              })
              .populate({
                path: "properties.property",
              }) 
              .exec((err, featured_lists) => {
                if (err) return reject(err);
                return cb(null, featured_lists || []);
              });
          },
          (cb) => {
            FeaturedList.countDocuments(query, (err, count) => {
              if (err) return cb(err);
              return cb(null, count);
            });
          },
        ],
        (err, results) => {
          if (err) return reject(err);
          let featured_lists = results[0];
          featured_lists = featured_lists.map((featuredList, i) => {
            let simpleObject = featuredList.toObject({
              getters: true,
            });
            simpleObject = {
              ...simpleObject,
              products: simpleObject.products.map((p) => {
                return {
                  ...p,
                  image: p.image ? cnf.cloudUrl + p.image : "",
                };
              }),
            };
            return simpleObject;
          });
          console.log(featured_lists)
          return resolve({
            featured_lists,
            count: results[1],
          });
        }
      );
    });
  },

  delete: (req) => {
    return new Promise((resolve, reject) => {
      if (!req.id) return reject(new Error("Key is not provided"));
      FeaturedList.deleteMany({ slug: req.id }, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  },

  getHomePageContent: (filters) => {
    return new Promise((resolve, reject) => {
      FeaturedList.find(
        {
          lang: filters.lang ? filters.lang : cnf.lang,
          slug: { $in: FeaturedListsForHomePage },
        },
        {},
        {
          sort: { order: 1 },
        }
      )
        .populate({
          path: "products",
          populate: {
            path: "category",
          },
        })
        .populate({
          path:"products",
          populate:{path: "brand"},
        })
        .populate({
          path:"products",
          populate:{path: "properties.property",
          },
        })
        .exec((err, results) => {
          console.log(results[0].products);
          if (err) {
            logger.error(err.message, {
              function: "getting featured lists",
              FeaturedListsForHomePage,
            });
            return reject(err);
          }
          results = results.map((featuredList, i) => {
            let simpleObject = featuredList.toObject({
              getters: true,
            });
            simpleObject = {
              ...simpleObject,
              products: simpleObject.products.map((p) => {
                return {
                  ...p,
                  image: p.image ? cnf.cloudUrl + p.image : "",
                };
              }),
            };
            return simpleObject;
          });
          return resolve(results);
        });
    });
  },
};

const getProductsOtherLang = (productsWithDefaultLang, otherProductLang) => {
  return new Promise((resolve, reject) => {
    let slugs = [];
    let productsOtherLang = [];
    Product.find({ _id: { $in: productsWithDefaultLang } }, (err, products) => {
      if (err) return reject(err);
      if (!products && products.length)
        return reject(new Error(" products do not exist"));
      products.forEach((product) => {
        slugs.push(product.slug);
      });
      Product.find(
        { slug: { $in: slugs }, lang: otherProductLang },
        (err, products) => {
          if (err) return reject(err);
          if (!products && products.length)
            return reject(new Error(" products do not exist"));
          products.forEach((product) => {
            productsOtherLang.push(product._id);
          });
          return resolve(productsOtherLang);
        }
      );
    });
  });
};

module.exports = featuredListStore;
