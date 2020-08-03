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

let productStorage = {
  create: (b) => {
    return new Promise((resolve, reject) => {
      if (!b.name) return reject(new Error("name is required"));
      if (!b.category_id)
        return reject(new Error("category field is required"));
      if (!b.brand_id) return reject(new Error("Brand field is required"));
      // if (!b.additional_category_id) return reject(new Error('Additional category field is required'));
      // if (!b.related_product_id) return reject(new Error('Related product field is required'));
      let p = b;
      p.category = b.category_id || null;
      p.brand = b.brand_id || null;
      p.lang = b.lang ? b.lang : cnf.lang;

      p.additional_categories = b.additional_categories
        .split(",")
        .filter((f) => {
          return mongoose.Types.ObjectId.isValid(f.trim());
        })
        .map((f, i) => f.trim());

      p.related_products = b.related_products
        .split(",")
        .filter((f) => {
          return mongoose.Types.ObjectId.isValid(f.trim());
        })
        .map((f, i) => f.trim());

      p.gallery = b.gallery
        .split(",")
        .filter((g) => {
          return g.trim();
        })
        .map((g, i) => g.trim());

      p.created_at = Date.now();
      p.updated_at = Date.now();

      let pCopy = p;
      p = new Product(p);

      p.save((err, product) => {
        if (err) return reject(err);

        // creating for other languages
        let otherLangs = langs.filter((lang, i) => lang != product.lang);
        async.eachSeries(
          otherLangs,
          (otherLang, cb) => {
            let productWithOtherLang = pCopy;
            productWithOtherLang.lang = otherLang;
            productWithOtherLang.slug = product.slug;
            productWithOtherLang = new Product(productWithOtherLang);
            productWithOtherLang.save((err, r) => {
              if (err) return cb(err);
              logger.debug("product is created with lang " + otherLang, {
                result: r,
              });
              cb(null, r);
            });
          },
          (err) => {
            if (err)
              logger.error(err.message, {
                function: "create product for other lang",
                product,
              });
          }
        );

        product
          .populate({
            path: "category",
          })
          .populate({
            path: "brand",
          })
          .populate({
            path: "additional_categories",
          })
          .populate({
            path: "related_products",
          })
          .execPopulate()
          .then((populatedProduct) => {
            if (err) return reject(err);
            return resolve(populatedProduct);
          })
          .catch((err) => {
            return reject(err);
          });
      });
    });
  },
  update: (b) => {
    return new Promise((resolve, reject) => {
      if (!b.id) return reject(new Error("Key is not provided"));
      if (!b.lang) return reject(new Error("Lang is not provided"));
      if (!b.name) return reject(new Error("name is required"));
      if (!b.category_id)
        return reject(new Error("category field is required"));
      if (!b.brand_id) return reject(new Error("Brand field is required"));

      let query = {};
      // making query
      query = {
        ...query,
        lang: b.lang,
        $or: [
          {
            slug: b.id,
          },
        ],
      };
      if (mongoose.Types.ObjectId.isValid(b.id)) query.$or.push({ _id: b.id });

      Product.findOne(query, (err, product) => {
        if (err) return reject(err);
        if (!product)
          return reject(
            new Error(
              "Document with key:" +
              b.id +
              " and with lang: " +
              b.lang +
              " not found"
            )
          );

        product.name = b.name;
        product.category = b.category_id || null;
        product.brand = b.brand_id || null;

        product.additional_categories = b.additional_categories
          .split(",")
          .filter((f) => {
            return mongoose.Types.ObjectId.isValid(f.trim());
          })
          .map((f, i) => f.trim());

        product.related_products = b.related_products
          .split(",")
          .filter((f) => {
            return mongoose.Types.ObjectId.isValid(f.trim());
          })
          .map((f, i) => f.trim());

        product.active = b.active;
        product.preview_text = b.preview_text;
        product.description = b.description;
        product.gallery = b.gallery
          .split(",")
          .filter((g) => {
            return g.trim();
          })
          .map((g, i) => g.trim());
        product.meta = {
          title: b.meta ? b.meta.title : product.meta.title,
          description: b.meta ? b.meta.description : product.meta.description,
          tags: b.meta ? b.meta.tags : product.meta.tags,
        };
        product.external_id = b.external_id;
        product.order = b.order;
        product.image = b.image;

        product.save((err, updatedProduct) => {
          if (err) return reject(err);
          product
            .populate({
              path: "category",
            })
            .populate({
              path: "brand",
            })
            .populate({
              path: "additional_categories",
            })
            .populate({
              path: "related_products",
            })
            .execPopulate()
            .then((populatedProduct) => {
              if (err) return reject(err);
              return resolve(populatedProduct);
            })
            .catch((err) => {
              return reject(err);
            });
        });
      });
    });
  },
  updatePrice: (b) => {
    // NOTE: slug comes as product_id
    return new Promise((resolve, reject) => {
      if (!b.product_id)
        return reject(new Error("Product key is not provided"));
      //if(!b.price_type_id) return reject(new Error('price type ID is required'));

      Product.find({ slug: b.product_id }, (err, products) => {
        if (err) return reject(err);
        if (!products.length)
          return reject(
            new Error("Documents with key:" + b.product_id + " not found")
          );
        if (products.length > 3)
          return reject(
            new Error(
              "With key: " +
              b.product_id +
              ", found " +
              products.length +
              " documents. It seems there is duplication error"
            )
          );

        async.eachSeries(
          products,
          (product, cb) => {
            if (!b.price_type_id) {
              // valid price type is given, so we are updating 'prices' field
              let updated = false;
              product.prices = product.prices.map((price, i) => {
                if (price.type.toString() == b.price_type_id || price.type.toString() == "") {
                  price.price = b.price;
                  price.old_price = b.old_price;
                  updated = true;
                }
                else if (price.type.toString() == "1") {
                  price.type = "1";
                  price.price = b.price;
                  price.old_price = b.old_price;
                  updated = true;
                } else {
                  return reject(new Error("Invalid Price Type!"));
                }
                return price;
              });
              if (!updated) {
                product.prices.push({
                  type: b.price_type_id,
                  price: b.price,
                  old_price: b.old_price,
                });
              }
            } else {
              // price type is NOT given, so we are saving it as a default price for the product
              product.price = {
                price: b.price,
                old_price: b.old_price,
              };
            }

            product.save((err, updatedProduct) => {
              if (err) return cb(err);
              cb();
            });
          },
          (err) => {
            if (err) return reject(err);
            return resolve("Price updated");
          }
        );
      });
    });
  },
  updateProperty: (b) => {
    return new Promise((resolve, reject) => {
      if (!b.product_id) return reject(new Error("Product ID is not provided"));
      if (!b.property_id) return reject(new Error("Property ID is required"));

      Product.findById(b.product_id, (err, product) => {
        if (err) return reject(err);
        if (!product)
          return reject(
            new Error("Document with id:" + b.product_id + " not found")
          );

        let updated = false;
        product.properties = product.properties.map((property, i) => {
          if (property.property.toString() == b.property_id) {
            property.value = b.value;
            updated = true;
          }
          return property;
        });
        if (!updated) {
          product.properties.push({
            property: b.property_id,
            value: b.value,
          });
        }

        product.save((err, updatedProduct) => {
          if (err) return reject(err);
          resolve(updatedProduct);
        });
      });
    });
  },
  find: (filters) => {
    return new Promise((resolve, reject) => {
      let query = {
        lang: filters.lang ? filters.lang : cnf.lang,
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

      // filter by category
      if (mongoose.Types.ObjectId.isValid(filters.category)) {
        query = {
          ...query,
          category: filters.category,
        };
      }

      // filter by brand
      let brands = filters.brand
        .split(",")
        .filter((f) => {
          return mongoose.Types.ObjectId.isValid(f.trim());
        })
        .map((f, i) => f.trim());
      if (brands.length) {
        query = {
          ...query,
          brand: { $in: brands },
        };
      }

      // filter by price
      let priceQuery = {};
      if (filters.price_from / 1) {
        priceQuery = {
          ...priceQuery,
          $gte: filters.price_from,
        };
      }
      if (filters.price_till / 1) {
        priceQuery = {
          ...priceQuery,
          $lte: filters.price_till,
        };
      }
      if (Object.keys(priceQuery).length) query["price.price"] = priceQuery;

      let options = {
        skip: ((filters.page / 1 - 1) * filters.limit) / 1,
        limit: filters.limit / 1 ? filters.limit / 1 : 50,
        sort: { created_at: -1 },
      };

      if (filters.sort) {
        let sortParams = filters.sort.split("|");
        if (
          sortParams.length == 2 &&
          (sortParams[1] == "asc" || sortParams[1] == "desc")
        ) {
          options.sort = {};
          if (sortParams[0] == "price") {
            options.sort["price.price"] = sortParams[1] == "asc" ? 1 : -1;
          } else {
            options.sort[sortParams[0]] = sortParams[1] == "asc" ? 1 : -1;
          }
        }
      }

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
  get: (req) => {
    return new Promise((resolve, reject) => {
      if (!(req.id || req.slug)) return reject(new Error("Key is not given"));

      let query = {};

      // making query
      query = {
        ...query,
        lang: req.lang ? req.lang : cnf.lang,
        $or: [
          {
            slug: req.slug,
          },
        ],
      };
      if (mongoose.Types.ObjectId.isValid(req.id))
        query.$or.push({ _id: req.id });

      logger.debug("finding a product", { query });

      Product.findOne(query)
        .populate({
          path: "category",
          populate: {
            path: "parent",
          },
        })
        .populate({
          path: "brand",
        })
        .populate({
          path: "additional_categories",
        })
        .exec((err, product) => {
          if (err) return reject(err);
          if (!product) return reject(new Error("Document not found"));

          // setting image fields
          product.image = product.image ? cnf.cloudUrl + product.image : "";
          product.gallery = product.gallery
            ? product.gallery.map((g, j) => (g ? cnf.cloudUrl + g : ""))
            : [];
          product.brand.image = product.brand.image ? cnf.cloudUrl + product.brand.image : "";
          console.log(product);
          getRelatedProducts(product._id, 10)
            .then((related_products) => {
              product.related_products = related_products;
              return resolve(product);
            })
            .catch((err) => {
              logger.error(err.message, {
                function: "getting related products",
                product_id,
                limit,
              });
              return resolve(product);
            });
        });
    });
  },
  getShops: (req) => {
    return new Promise((resolve, reject) => {
      if (!req.product_id) return reject(new Error("Key is not given"));

      // making query
      let productQuery = {};
      productQuery = {
        ...productQuery,
        lang: cnf.lang,
        $or: [
          {
            slug: req.product_id,
          },
        ],
      };
      if (mongoose.Types.ObjectId.isValid(req.product_id)) productQuery.$or.push({ _id: req.product_id });

      Product.findOne(productQuery, (err, product) => {
        if (err) return reject(err);
        if (!product) return reject(new Error("Product not found"));

        let query = {
          lang: req.lang ? req.lang : cnf.lang,
          active: true,
        };
        Shop.find(query, (err, shops) => {
          if (err) return reject(err);
          if (!shops) return reject(new Error("Shops are not found"));

          shops = shops.map((sh, i) => {
            let products = sh.products.filter((stock) => {
              return stock.product == product._id;
            });
            return {
              shop: sh,
              quantity: products.length ? products[0].quantity : 0,
            };
          });
          return resolve({ shops });
        });
      })
    });
  },
  delete: (req) => {
    return new Promise((resolve, reject) => {
      if (!req.slug) return reject(new Error("Key is not provided"));

      Product.deleteMany({ slug: req.slug }, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  },
};

const getRelatedProducts = (product_id = "", limit = 10) =>
  new Promise((resolve, reject) => {
    let related_products = [];
    Product.findById(product_id, (err, p) => {
      if (err) reject(err);

      async.parallel(
        {
          relatedProducts: (cb) => {
            Product.find(
              {
                _id: { $in: p.related_products },
              },
              {},
              { limit }
            )
              .populate({
                path: "category",
              })
              .populate({
                path: "brand",
              })
              .exec((err, products) => {
                if (err) return cb(err);
                return cb(null, products);
              });
          },
          productsOfSameCategory: (cb) => {
            Product.find(
              {
                _id: {
                  $nin: p.related_products,
                  $ne: p._id,
                },
                category: p.category,
                lang: p.lang,
              },
              {},
              { limit }
            )
              .populate({
                path: "category",
              })
              .populate({
                path: "brand",
              })
              .exec((err, products) => {
                if (err) return cb(err);
                return cb(null, products);
              });
          },
          randomProducts: (cb) => {
            Product.find(
              {
                _id: {
                  $nin: p.related_products,
                  $ne: p._id,
                },
                category: { $ne: p.category },
                lang: p.lang,
              },
              {},
              { limit }
            )
              .populate({
                path: "category",
              })
              .populate({
                path: "brand",
              })
              .exec((err, products) => {
                if (err) return cb(err);
                return cb(null, products);
              });
          },
        },
        (err, results) => {
          if (err) {
            logger.error(err.message, {
              function: "getting related products",
              product_id,
              limit,
            });
            return resolve([]);
          }

          related_products = results.relatedProducts;
          let emptySpaces = limit - related_products.length;

          for (let i = 0; i < emptySpaces; i++) {
            if (results.productsOfSameCategory[i]) {
              related_products.push(results.productsOfSameCategory[i]);
            } else {
              i = emptySpaces;
            }
          }
          emptySpaces = limit - related_products.length;

          for (let i = 0; i < emptySpaces; i++) {
            if (results.randomProducts[i]) {
              related_products.push(results.randomProducts[i]);
            } else {
              i = emptySpaces;
            }
          }

          // setting images
          for (let i = 0; i < related_products.length; i++) {
            related_products[i].image = related_products[i].image
              ? cnf.cloudUrl + related_products[i].image
              : "";
          }

          return resolve(related_products);
        }
      );
    });
  });

module.exports = productStorage;
