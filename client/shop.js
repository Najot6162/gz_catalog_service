var grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");
const logger = require("../config/logger");

var PROTO_PATH = __dirname + "/../protos/catalog_service/catalog_service.proto";
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
var CatalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;

function main() {
  var client = new CatalogProto.ShopService(
    "localhost:7000",
    grpc.credentials.createInsecure()
  );

  // create Brand
  client.Create(
    {
      name: "my Shop",
      preview_text: "preview text of my shop",
      description: "description of my shop",
      address: "Address of my shop",
      loc: {
        long: 72.223,
        lat: 43.213,
      },
      active: true,
      lang: "ru",
    },
    (err, createResponse) => {
      console.log("Shop Create");
      if (err) return console.log("Error: ", err.message);
      logger.debug("Shop Create response", {
        response: createResponse,
        label: "test",
      });
      console.log(createResponse);

      // find Shop
      client.Find({}, (err, findResponse) => {
        console.log("Shop Find");
        if (err) return console.log("Error: ", err.message);
        logger.debug("Shop Find response", {
          response: findResponse,
          label: "test",
        });
        console.log(findResponse);
      });

      // update Shop
      client.Update(
        {
          id: createResponse.shop.slug,
          name: "my updated Shop",
          preview_text: "preview text of my updated shop",
          description: "description of my updated shop",
          address: "Address of my updated shop",
          loc: {
            long: 72.252,
            lat: 43.223,
          },
          active: true,
          lang: "ru",
        },
        (err, updateResponse) => {
          console.log("Shop Update");
          if (err) return console.log("Error: ", err.message);
          logger.debug("Shop Update response", {
            response: updateResponse,
            label: "test",
          });
          console.log(updateResponse);

          // get Shop
          client.Get(
            {
              slug: updateResponse.shop.slug,
            },
            (err, getResponse) => {
              console.log("Shop Get");
              if (err) return console.log("Error: ", err.message);
              logger.debug("Shop Get response", {
                response: getResponse,
                label: "test",
              });
              console.log(getResponse);

              // delete Shop
              client.Delete(
                {
                  slug: updateResponse.shop.slug,
                },
                (err, deleteResponse) => {
                  if (err) return console.log("Error: ", err.message);

                  logger.debug("Shop Delete response", {
                    response: deleteResponse,
                    label: "test",
                  });
                  console.log("Shop test completed!");
                }
              );
            }
          );
        }
      );
    }
  );
}

main();
