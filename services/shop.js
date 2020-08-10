const grpc = require("grpc");
const shopStorage = require("../storage/mongo/shop");
const logger = require("../config/logger");

const shopService = {
  Create: (call, callback) => {
    logger.debug("Shop Create Request", {
      label: "shop",
      request: call.request,
    });
    shopStorage
      .create(call.request)
      .then((result) => {
        callback(null, { shop: result });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "create shop",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
  Update: (call, callback) => {
    logger.debug("Shop Update Request", {
      label: "shop",
      request: call.request,
    });
    shopStorage
      .update(call.request)
      .then((result) => {
        callback(null, { shop: result });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "update shop",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
  UpdateQuantity: (call, callback) => {
    logger.debug("Shop product create request", {
      request: call.request,
      label: "Shop",
    });
    shopStorage
      .updateQuantity(call.request)
      .then((result) => {
        callback(null, { shop: result });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "create Shop product",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
  Find: (call, callback) => {
    logger.debug("Shop Find Request", {
      label: "shop",
      request: call.request,
    });
    shopStorage
      .find(call.request)
      .then((result) => {
        callback(null, {
          shops: result.shops,
          count: result.count,
        });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "find shops",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
  Get: (call, callback) => {
    logger.debug("Shop Get Request", {
      label: "shop",
      request: call.request,
    });
    shopStorage
      .get(call.request)
      .then((result) => {
        callback(null, { shop: result });
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
  GetProducts: (call, callback) => {
    logger.debug("Products get request", {
      request: call.request,
      label: "product",
    });
    shopStorage
      .getProducts(call.request)
      .then((result) => {
        callback(null, {
          products: result.shopProducts,
          count: result.count
        });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "get products",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
  Delete: (call, callback) => {
    logger.debug("Shop Delete Request", {
      label: "shop",
      request: call.request,
    });
    shopStorage
      .delete(call.request)
      .then((result) => {
        callback(null);
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "delete shop",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
};

module.exports = shopService;
