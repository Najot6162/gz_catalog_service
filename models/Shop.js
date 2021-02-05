const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;
const Product = require("./Product");
const logger = require("../config/logger");

var ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      slug: "name",
      permanent: true,
    },
    products: [
      {
        product: {
          type: Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
      },
    ],
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      required: true,
    },
    address2: {
      type: String,
    },
    preview_text: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    working_hours: {
      type: String,
    },
    loc: {
      long: {
        type: Number,
      },
      lat: {
        type: Number,
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    // area to check in_stock quantity, if other region is added: just add to enum and write script
    //(dont forget to add to inStock object boolean value of this region)
    area: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
    },
    lang: {
      type: String,
      enum: ["uz", "ru", "en"],
      required: true,
      default: "ru",
    },
    external_id: {
      type: Number,
    },
  },
  {
    minimize: false,
  }
);

ShopSchema.post("save", function (shop, next) {
  // updating inStock field of product
  // if products[i].quantity > 0 (make samarkand or tashkent_city true for that product)
  let productIdsInStock = shop.products.filter((stock, i) => {
    return stock.quantity > 0;
  });
  let productIdsNotInStock = shop.products.filter((stock, i) => {
    return (stock.quantity == 0);
  });
  Product.find(
    { _id: { $in: productIdsInStock.map((p, i) => p.product) } },
    {},
    (err, products) => {
      if (shop.area == "samarkand") {
        Product.updateMany(
          { slug: { $in: products.map((p, i) => p.slug) } },
          {
            $set: {
              "in_stock.samarkand": true,
            },
          },
          (err, r) => {
            if (err) {
              logger.error("cannot update", {
                function: "update in_stock.samarkand field of a product to true",
                shop,
              });
            }
            logger.info(
              "in_stock.samarkand field of the product has been updated to true",
              {
                r,
              }
            );
          }
        );
      } else {
        Product.updateMany(
          { slug: { $in: products.map((p, i) => p.slug) } },
          {
            $set: {
              "in_stock.tashkent_city": true,
            },
          },
          (err, r) => {
            if (err) {
              logger.error("cannot update", {
                function:
                  "update in_stock.tashkent_city field of a product to true",
                shop,
              });
            }
            logger.info(
              "in_stock.tashkent_city field of the product has been updated to true",
              {
                r,
              }
            );
          }
        );
      }
    }
  );

  if (shop.area == "samarkand") {
    mongoose
      .model("Shop")
      .find({ area: "samarkand", lang: "ru" }, {}, (err, shops) => {
        console.log(shops);
        shops.forEach((sh, i) => {
          productIdsNotInStock = productIdsNotInStock.filter((p, i) => {
            let in_stock = sh.products.filter(
              (sp, j) => sp.product.toString() == p._id.toString()
            );
            return !in_stock.length || in_stock[0].quantity == 0;
          });
        });
        Product.find(
          { _id: { $in: productIdsNotInStock.map((p, i) => p.product) } },
          {},
          (err, products) => {
            if (err) return next();
            Product.updateMany(
              { slug: { $in: products.map((p, i) => p.slug) } },
              {
                $set: {
                  "in_stock.samarkand": false,
                },
              },
              (err, r) => {
                if (err) {
                  logger.error("cannot update", {
                    function:
                      "update in_stock.samarkand of a product to false (quantity = 0)",
                    shop,
                  });
                  return next();
                }
                logger.info(
                  "in_stock.samarkand field of the product has been updated to false",
                  {
                    r,
                  }
                );
                return next();
              }
            );
          }
        );
      });
  } else {
    mongoose
      .model("Shop")
      .find({ area: "tashkent_city", lang: "ru" }, {}, (err, shops) => {
        shops.forEach((sh, i) => {
          productIdsNotInStock = productIdsNotInStock.filter((p, i) => {
            let in_stock = sh.products.filter(
              (sp, j) => sp.product.toString() == p._id.toString()
            );
            return !in_stock.length || in_stock[0].quantity == 0;
          });
        });
        Product.find(
          { _id: { $in: productIdsNotInStock.map((p, i) => p.product) } },
          {},
          (err, products) => {
            if (err) return next();
            Product.updateMany(
              { slug: { $in: products.map((p, i) => p.slug) } },
              {
                $set: {
                  "in_stock.tashkent_city": false,
                },
              },
              (err, r) => {
                if (err) {
                  logger.error("cannot update", {
                    function:
                      "update in_stock.tashkent_city of a product to false",
                    shop,
                  });
                  return next();
                }
                logger.info(
                  "in_stock.tashkent_city field of the product has been updated to false",
                  {
                    r,
                  }
                );
                return next();
              }
            );
          }
        );
      });
  }
});

module.exports = mongoose.model("Shop", ShopSchema);
