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
  var client = new CatalogProto.CategoryService(
    "localhost:7000",
    grpc.credentials.createInsecure()
  );

  // create category
  client.Create(
    {
      name: "my categoryy",
      meta: {
        title: "Category Meta",
        description: "Description of Meta",
        tags: "Tag of meta",
      },
      product_properties:"5f35381f9eb4680011f98bf3,5f353c419eb4680011f98bfa",
      image: "src/img.jpg",
      lang: "ru",
    }, (err, createResponse) => {
      if (err) return console.log("Error: ", err.message);

      logger.debug("Category Create response", {
        response: createResponse,
        label: "test",
      });
      //search: "ihc"
      // find category
      client.Find({}, (err, findResponse) => {
        if (err) return console.log("Error: ", err.message);

        logger.debug("Category Find response", {
          response: findResponse,
          label: "test",
        });
      });

      // update category
      client.Update(
        {
          id: createResponse.category.slug,
          name: "my updated category",
          meta: {
            title: "Updated Category Meta",
            description: "Updated Description of Meta",
            tags: "Updated Tag of meta",
          },
          product_properties:"5f35381f9eb4680011f98bf3,5f353c419eb4680011f98bfa",
          image: "src/img.jpg",
          lang: "ru",
        },
        (err, updateResponse) => {
          if (err) return console.log("Error: ", err.message);

          logger.debug("Category Update response", {
            response: updateResponse,
            label: "test",
          });

          // get category
          client.Get(
            {
              slug: updateResponse.category.slug,
              lang: "ru",
            },
            (err, getResponse) => {
              if (err) return console.log("Error: ", err.message);

              logger.debug("Category Get response", {
                response: getResponse,
                label: "test",
              });

              // delete category
              client.Delete(
                {
                  slug: updateResponse.category.slug,
                },
                (err, deleteResponse) => {
                  if (err) return console.log("Error: ", err.message);

                  logger.debug("Category Delete response", {
                    response: deleteResponse,
                    label: "test",
                  });
                  console.log("Category test completed!");
                }
              );
            }
          );
        }
      );
    }
  );

  // client.GetChildrenWithProducts({
  //   slug: "noutbuki-i-kompyutery",
  //   lang: "ru"
  // }, (err, findChildrenResponse) => {
  //   if (err) return console.log("Error: ", err.message);

  //   logger.debug("Category Children Find response", {
  //     response: findChildrenResponse,
  //     label: "category",
  //   });
  // });
}

main();
