const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const logger = require("../config/logger.js");

// loading proto file
const PROTO_URL =
  __dirname + "/../protos/catalog_service/catalog_service.proto";

const packageDefinition = protoLoader.loadSync(PROTO_URL, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const catalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;

function main() {
  var client = new catalogProto.FeaturedListService(
    "localhost:7000",
    grpc.credentials.createInsecure()
  );

  // create FeaturedList
  // client.Create(
  //   {
  //     title: "Лучшая подборка для вас",
  //     products:
  //       "5f256ee8bc7bd40012af03e8,5f256ee9bc7bd40012af045a,5f256ee9bc7bd40012af0454",
  //     order: 1,
  //     lang: "ru",
  //   },
  //   (err, createResponse) => {
  //     if (err) return console.log("Error: ", err.message);
  //     logger.debug("FeaturedList Create response", {
  //       response: createResponse,
  //       label: "test",
  //     });
  //     // find FeaturedList
  //     client.Find({}, (err, findResponse) => {
  //       if (err) return console.log("Error: ", err.message);
  //       logger.debug("FeaturedList Find response", {
  //         response: findResponse,
  //         label: "test",
  //       });
  //     });

  //     // update FeaturedList
  //     client.Update(
  //       {
  //         id: createResponse.featured_list.slug,
  //         title: "Лучшая подборка для вас",
  //         products:
  //           "5f256ee8bc7bd40012af03e8,5f256ee9bc7bd40012af045a,5f256ee9bc7bd40012af0454",
  //         order: 1,
  //         lang: "ru",
  //       },
  //       (err, updateResponse) => {
  //         if (err) return console.log("Error: ", err.message);
  //         logger.debug("FeaturedList Update response", {
  //           response: updateResponse,
  //           label: "test",
  //         });

  //         //     // get FeaturedList
  //         client.Get(
  //           {
  //             id: updateResponse.featured_list.slug,
  //             lang: "ru",
  //           },
  //           (err, getResponse) => {
  //             if (err) return console.log("Error: ", err.message);
  //             logger.debug("FeaturedList Get response", {
  //               response: getResponse,
  //               label: "test",
  //             });

  client.FindHomePageContent(
    {
      lang: "ru",
    },
    (err, getResponse) => {
      if (err) return console.log("Error: ", err.message);
      logger.debug("Get homepage content response", {
        response: getResponse,
        label: "test",
      });

      // delete FeaturedList
      // client.Delete(
      //   {
      //     id: updateResponse.featured_list.slug,
      //     lang:"ru"
      //   },
      //   (err, deleteResponse) => {
      //     if (err) return console.log("Error: ", err.message);
      //     logger.debug("FeaturedList Delete response", {
      //       response: deleteResponse,
      //       label: "test",
      //     });
      //   }
      // );
      //           }
      //         );
      //       }
      //     );
    }
  );
}

main();
