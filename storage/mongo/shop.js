const mongoose = require("mongoose");
const Product = require("../../models/Product");
const Shop = require("../../models/Shop");
const cnf = require("../../config");
const langs = ["en", "ru", "uz"];
const async = require("async");
const logger = require("../../config/logger");

let shopStorage = {
  create: (b) => {
    return new Promise((resolve, reject) => {
      if (!b.name) return reject(new Error("name is required"));
      if (!b.address) return reject(new Error("address is required"));
      if (!b.loc) return reject(new Error("Location is required"));
      let sh = b;
      sh.created_at = Date.now();
      sh.updated_at = Date.now();
      let shCopy = sh;
      sh = new Shop(sh);
      sh.save((err, newShop) => {
        if (err) return reject(err);
        let otherLangs = langs.filter((lang, i) => lang != newShop.lang);
        async.eachSeries(
          otherLangs,
          (otherLang, cb) => {
            let shopWithOtherLang = shCopy;
            shopWithOtherLang.lang = otherLang;
            shopWithOtherLang.slug = newShop.slug;
            shopWithOtherLang = new Shop(shopWithOtherLang);
            shopWithOtherLang.save((err, r) => {
              if (err) return cb(err);
              logger.debug("shop is created with lang " + otherLang, {
                result: r,
              });
              cb(null, r);
            });
          },
          (err) => {
            if (err)
              logger.error(err.message, {
                function: "create shop for other lang",
                newShop,
              });
          }
        );
        return resolve(newShop);
      });
    });
  },
  update: (b) => {
    return new Promise((resolve, reject) => {
      if (!b.id) return reject(new Error("Key is not provided"));
      if (!b.name) return reject(new Error("name is required"));
      if (!b.lang) return reject(new Error("Lang is not provided"));
      
      // making query
      let query = {};
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

      Shop.findOne(query, (err, sh) => {
        if (err) return reject(err);
        if (!sh)
          return reject(new Error("Document with id:" + b.id + " not found"));
        sh.name = b.name;
        sh.phone = b.phone;
        sh.address = b.address;
        sh.address2 = b.address2;
        sh.active = b.active;
        sh.preview_text = b.preview_text;
        sh.description = b.description;
        sh.working_hours = b.working_hours;
        sh.loc = {
          long: b.loc ? b.loc.long : sh.loc.long,
          lat: b.loc ? b.loc.lat : sh.loc.lat,
        };
        sh.order = b.order;
        sh.image = b.image;
        sh.updated_at = Date.now();

        sh.save((err, updatedShop) => {
          if (err) return reject(err);
          resolve(updatedShop);
        });
      });
    });
  },
  updateQuantity: (b) => {
    return new Promise((resolve, reject) => {
      if (!b.shop_id) return reject(new Error("Shop ID is not provided"));
      if (!b.product_id) return reject(new Error("Product ID is required"));

      Shop.findById(b.shop_id, (err, shop) => {
        if (err) return reject(err);
        if (!shop)
          return reject(
            new Error("Document with id:" + b.shop_id + " not found")
          );

        let updated = false;
        shop.products = shop.products.map((product, i) => {
          if (product.product.toString() == b.product_id) {
            product.quantity = b.quantity;
            updated = true;
          }
          return product;
        });
        if (!updated) {
          shop.products.push({
            product: b.product_id,
            quantity: b.quantity,
          });
        }

        shop.save((err, updatedShop) => {
          if (err) return reject(err);
          resolve(updatedShop);
        });
      });
    });
  },
  find: (filters) => {
    return new Promise((resolve, reject) => {
      let query = { lang: filters.lang ? filters.lang : cnf.lang };
      query = {
        ...query,
        lang: filters.lang ? filters.lang : cnf.lang,
      };
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
          ],
        };
      }

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
          options.sort[sortParams[0]] = sortParams[1] == "asc" ? 1 : -1;
        }
      }

      logger.debug("filtering shops", {
        query,
        options,
      });

      async.parallel(
        [
          (cb) => {
            Shop.find(query, {}, options, (err, shops) => {
              if (err) return reject(err);
              return cb(null, shops || []);
            });
          },
          (cb) => {
            Shop.countDocuments(query, (err, count) => {
              if (err) return cb(err);
              return cb(null, count);
            });
          },
        ],
        (err, results) => {
          if (err) return reject(err);
          let shops = results[0];
          for (let i = 0; i < shops.length; i++) {
            shops[i].image = shops[i].image
              ? cnf.cloudUrl + shops[i].image
              : "";
          }
          return resolve({
            shops,
            count: results[1],
          });
        }
      );

      // Shop.find(query, (err, shops) => {
      //   if (err) return reject(err);

      //   // setting images
      //   for (let i = 0; i < shops.length; i++) {
      //     shops[i].image = shops[i].image ? cnf.cloudUrl + shops[i].image : "";
      //   }

      //   resolve(shops);
      // });
    });
  },
  get: (req) => {
    return new Promise((resolve, reject) => {
      if (!(req.id || req.slug)) return reject(new Error("ID is not given"));
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
      logger.debug("finding a shop", { query });
      Shop.findOne(query, (err, sh) => {
        if (err) return reject(err);
        if (!sh) return reject(new Error("Document not found"));

        // setting image
        sh.image = sh.image ? cnf.cloudUrl + sh.image : "";

        return resolve(sh);
      });
    });
  },
  delete: (req) => {
    return new Promise((resolve, reject) => {
      if (!req.slug) return reject(new Error("Key is not provided"));

      Shop.deleteMany({ slug: req.slug }, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  },
};

module.exports = shopStorage;
