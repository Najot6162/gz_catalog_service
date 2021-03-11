const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;
const Product = require("./Product");
const logger = require("../config/logger");
const async = require("async");

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
  let shop_products = shop.products.map((stock, i) => {
    return {
      product: stock.product,
      quantity: stock.quantity,
    };
  });
  if (shop.area == "samarkand") {
    async.eachSeries(
      shop_products,
      (shop_product, cb) => {
        Product.findOne({ _id: shop_product.product }, (err, product) => {
          if (err) return cb(err);
          if (product) {
            if (shop_product.quantity > 0) {
              if (product.in_stock.samarkand) {
                return cb(null);
              } else {
                Product.updateMany(
                  { slug: product.slug },
                  {
                    $set: {
                      "in_stock.samarkand": true,
                    },
                  },
                  (err, r) => {
                    if (err) {
                      logger.error("cannot update", {
                        function:
                          "update in_stock.samarkand field of a product to true",
                        shop,
                      });
                      return next(err);
                    }
                    logger.info(
                      "in_stock.samarkand field of the product has been updated to true",
                      {
                        r,
                      }
                    );
                    return cb(null);
                  }
                );
              }
            } else {
              if (product.in_stock.samarkand) {
                Product.updateMany(
                  { slug: product.slug },
                  {
                    $set: {
                      "in_stock.samarkand": false,
                    },
                  },
                  (err, r) => {
                    if (err) {
                      logger.error("cannot update", {
                        function:
                          "update in_stock.samarkand field of a product to false",
                        shop,
                      });
                      return next(err);
                    }
                    logger.info(
                      "in_stock.samarkand field of the product has been updated to false",
                      {
                        r,
                      }
                    );
                    return cb(null);
                  }
                );
              } else {
                return cb(null);
              }
            }
          } else {
            return cb(null);
          }
        });
      },
      (err) => {
        if (err) {
          logger.error(err.message, {
            function: "product stock update failed",
            shop,
          });
          return next(err);
        }
        return next();
      }
    );
  } else {
    mongoose
      .model("Shop")
      .find({ area: "tashkent_city", lang: "ru" }, {}, (err, shops) => {
        shops.forEach((sh, i) => {
          let productIdsInThisShop = sh.products.map((p, i) => {
            return {
              product: p.product,
              quantity: p.quantity,
            };
          });
          
          for (let j = 0; j < productIdsInThisShop.length; j++) {
            for (let k = 0; k < shop_products.length; k++) {
              if (
                shop_products[k].product.toString() ==
                productIdsInThisShop[j].product.toString()
              ) {
                if (shop_products[k].quantity) {
                  shop_products[k].quantity =
                    shop_products[k].quantity +
                    productIdsInThisShop[j].quantity;
                } else {
                  shop_products[k].quantity = productIdsInThisShop[j].quantity;
                }
              }
            }
          }
        });
        async.eachSeries(
          shop_products,
          (shop_product, cb) => {
            Product.findOne({ _id: shop_product.product }, (err, product) => {
              if (err) return cb(err);
              if (product) {
                if (shop_product.quantity > 0) {
                  if (product.in_stock.tashkent_city) {
                    return cb(null);
                  }
                  else {
                    Product.updateMany(
                      { slug: product.slug },
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
                          return next(err);
                        }
                        logger.info(
                          "in_stock.tashkent_city field of the product has been updated to true",
                          {
                            r,
                          }
                        );
                        return cb(null);
                      }
                    );
                  }
                } else {
                  if (product.in_stock.tashkent_city) {
                    Product.updateMany(
                      { slug: product.slug },
                      {
                        $set: {
                          "in_stock.tashkent_city": false,
                        },
                      },
                      (err, r) => {
                        if (err) {
                          logger.error("cannot update", {
                            function:
                              "update in_stock.tashkent_city field of a product to false",
                            shop,
                          });
                          return next(err);
                        }
                        logger.info(
                          "in_stock.tashkent_city field of the product has been updated to false",
                          {
                            r,
                          }
                        );
                        return cb(null);
                      }
                    );
                  } else {
                    return cb(null);
                  }
                }
              } else {
                return cb(null);
              }
            });
          },
          (err) => {
            if (err) {
              logger.error(err.message, {
                function: "product stock update failed",
                shop,
              });
              return next(err);
            }
            return next();
          }
        );
      });
  }
  return next();
});

module.exports = mongoose.model("Shop", ShopSchema);
