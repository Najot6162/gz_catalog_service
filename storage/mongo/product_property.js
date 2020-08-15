const Product = require("../../models/Product");
const ProductProperty = require("../../models/ProductProperty");

const logger = require("../../config/logger");

let productPropertyStorage = {
  create: (b) => {
    return new Promise((resolve, reject) => {
      if (!b.name) return reject(new Error("name is required"));

      let br = new ProductProperty(b);
      br.created_at = Date.now();
      br.updated_at = Date.now();

      br.save((err, newProductProperty) => {
        if (err) return reject(err);
        return resolve(newProductProperty);
      });
    });
  },
  update: (b) => {
    return new Promise((resolve, reject) => {
      if (!b.id) return reject(new Error("ID is not provided"));
      if (!b.name) return reject(new Error("name is required"));

      ProductProperty.findById(b.id, (err, pp) => {
        if (err) return reject(err);
        if (!pp)
          return reject(new Error("Document with id:" + b.id + " not found"));

        pp.name = b.name;
        pp.active = b.active;
        pp.type = b.type;
        pp.options = b.options;
        pp.description = b.description;
        pp.order = b.order;
        pp.image = b.image;
        pp.updated_at = Date.now();

        pp.save((err, updatedProductProperty) => {
          if (err) return reject(err);
          resolve(updatedProductProperty);
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
        skip: ((filters.page / 1) * filters.limit) / 1,
        limit: filters.limit / 1,
      };

      ProductProperty.find(query, {}, options, (err, ProductProperties) => {
        if (err) return reject(err);
        resolve(ProductProperties);
      });
    });
  },
  get: (req) => {
    return new Promise((resolve, reject) => {
      if (!(req.id || req.slug)) return reject(new Error("ID is not given"));

      let query = {};
      if (req.id) query._id = req.id;
      if (req.slug) query.slug = req.slug;
      ProductProperty.findOne(query, (err, br) => {
        if (err) return reject(err);
        if (!br) return reject(new Error("Document not found"));
        return resolve(br);
      });
    });
  },
  delete: (req) => {
    return new Promise((resolve, reject) => {
      if (!req.id) return reject(new Error("ID is not provided"));

      // update products that has this ProductProperty
      Product.update(
        {
          properties: { $elemMatch: { property: req.id } },
        },
        {
          $pull: { properties: { property: req.id } },
          $set: { updated_at: Date.now() },
        },
        (err, updateResult) => {
          if (err) {
            logger.error(
              "error on updating product after productPropertyDeletion :" +
                err.message,
              {
                function: "product update",
                productPropertyId: req.id,
              }
            );
          }
          logger.debug(
            "products with property " +
              req.id +
              " were updated, because, this product property is going to be deleted",
            {
              updateResult,
            }
          );
        }
      );

      ProductProperty.findByIdAndDelete(req.id, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  },
};

module.exports = productPropertyStorage;
