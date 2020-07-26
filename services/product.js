const grpc = require("grpc");
const productStorage = require("../storage/mongo/product");
const logger = require("../config/logger.js");

const productService = {
  Create: (call, callback) => {
    logger.debug("Product create request", {
      request: call.request,
      label: "product",
    });
    logger.profile("product created");
    productStorage
      .create(call.request)
      .then((result) => {
        logger.profile("product created");
        callback(null, { product: result });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "create product",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
  Update: (call, callback) => {
    logger.debug("Product update request", {
      request: call.request,
      label: "product",
    });
    productStorage
      .update(call.request)
      .then((result) => {
        callback(null, { product: result });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "update product",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
  UpdatePrice: (call, callback) => {
    logger.debug("Product price create request", {
      request: call.request,
      label: "product",
    });
    productStorage
      .updatePrice(call.request)
      .then((result) => {
        callback(null);
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "create product price",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
  UpdateProperty: (call, callback) => {
    logger.debug("Product property create request", {
      request: call.request,
      label: "product",
    });
    productStorage
      .updateProperty(call.request)
      .then((result) => {
        callback(null, { product: result });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "create product property",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
  Find: (call, callback) => {
    logger.debug("Product find request", {
      request: call.request,
      label: "product",
    });
    productStorage
      .find(call.request)
      .then((result) => {
        callback(null, {
          products: result.products,
          count: result.count,
        });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "find products",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
  Get: (call, callback) => {
    logger.debug("Product get request", {
      request: call.request,
      label: "product",
    });
    productStorage
      .get(call.request)
      .then((result) => {
        callback(null, { product: result });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "get product",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
  GetShops: (call, callback) => {
    logger.debug("Shops get request", {
      request: call.request,
      label: "shop",
    });
    productStorage
      .getShops(call.request)
      .then((result) => {
        callback(null, { shops: result.shops });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "get shop",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
  Delete: (call, callback) => {
    logger.debug("Product delete request", {
      request: call.request,
      label: "product",
    });
    productStorage
      .delete(call.request)
      .then((result) => {
        callback(null);
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "delete product",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
};

module.exports = productService;
