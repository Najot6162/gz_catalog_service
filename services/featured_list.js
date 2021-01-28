const grpc = require("grpc");
const featuredListStorage = require("../storage/mongo/featured_list");
const logger = require("../config/logger");

const featuredListService = {
  Create: (call, callback) => {
    logger.debug("Featured List Create Request", {
      label: "featured_list",
      request: call.request,
    });

    featuredListStorage
      .create(call.request)
      .then((result) => {
        callback(null, {
          featured_list: result,
        });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "create featured_list",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },

  Update: (call, callback) => {
    logger.debug("Featured List Update Request", {
      label: "featured_list",
      request: call.request,
    });

    featuredListStorage
      .update(call.request)
      .then((result) => {
        callback(null, {
          featured_list: result,
        });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "update featured_list",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },

  Get: (call, callback) => {
    logger.debug("Featured List Get Request", {
      label: "featured_list",
      request: call.request,
    });

    featuredListStorage
      .get(call.request)
      .then((result) => {
        callback(null, {
          featured_list: result,
        });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "get featured_list",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },

  Find: (call, callback) => {
    logger.debug("Featured Lists Find Request", {
      label: "featured_list",
      request: call.request,
    });

    featuredListStorage
      .find(call.request)
      .then((result) => {
        callback(null, {
          featured_lists: result.featured_lists,
          count: result.count,
        });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "find featured_list",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },

  FindHomePageContent: (call, callback) => {
    logger.debug("Home page content find Request", {
      label: "home page content",
      request: call.request,
    });

    featuredListStorage
      .getHomePageContent(call.request)
      .then((result) => {
        callback(null, {
          featured_lists: result,
        });
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "getting home page content",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },

  Delete: (call, callback) => {
    logger.debug("Featured List delete Request", {
      label: "featured_list",
      request: call.request,
    });

    featuredListStorage
      .delete(call.request)
      .then((result) => {
        callback(null, {});
      })
      .catch((err) => {
        logger.error(err.message, {
          function: "delete featured_list",
          request: call.request,
        });
        callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });
  },
};

module.exports = featuredListService;
