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
  var client = new CatalogProto.ProductService(
    "localhost:7000",
    grpc.credentials.createInsecure()
  );

  // // create Product
  // client.Create({
  //     name: 'my product',
  //     category_id: '5ee1e1b06123a6296c4996af',
  //     brand_id: '5f24d71fe5fba43358f294e1', //dell
  //     // additional_categories: '5ee1e1b06123a6296c4996bd,5ee1e1b06123a6296c4556bd,5ee1e1b06123a6296c4236bd',
  //     // related_products: '5f256ee9bc7bd40012af047c,5f256ee9bc7bd40012af047e,5f256ee9bc7bd40012af0484',
  //     preview_text: 'preview text of my product',
  //     description: 'description of my product',
  //     //external_id: '15',
  //     image: 'some.jpg',
  //     gallery: 'img/somephoto.jpg',
  //     meta: {
  //         title: 'Product Meta',
  //         description: 'Description of Meta',
  //         tags: 'Tag of meta'
  //     },
  //    lang: 'ru',
  //     active: false
  // }, (err, createResponse) => {
  //     if (err) return console.log('Error: ', err.message);
  //     console.log(createResponse);
  //     logger.debug('Product Create response', {
  //         response: createResponse,
  //         label: 'test'
  //     });

  // find Product кондиционер
  // client.Find({in_stock:true}, (err, findResponse) => {
  //     if (err) return console.log('Error: ', err.message);
  //     logger.debug('Product Find response', {
  //         response: findResponse,
  //         label: 'test'
  //     });
  // });

  // update Product
  // client.Update(
  //   {
  //     id: createResponse.product.slug,
  //     name: "my updated Product",
  //     category_id: "5ee1e1b06123a6296c4996af",
  //     brand_id: "5f24d71fe5fba43358f294e1",
  //     // additional_categories:
  //     //   "5ee1e1b06123a6296c4996bd,5ee1e1b06123a6296c4556bd,5ee1e1b06123a6296c4236bd",
  //     // related_products:
  //     //   "5f256ee9bc7bd40012af047c,5f256ee9bc7bd40012af047e,5f256ee9bc7bd40012af0484",
  //     preview_text: "preview text of my updated product",
  //     description: "description of my updated product",
  //     external_id: "16",
  //     image: "some.jpg",
  //     gallery: "img/some.jpg",
  //     meta: {
  //       title: " Updated Product Meta",
  //       description: "Updatet Description of Meta",
  //       tags: "Updated Tag of meta",
  //     },
  //     lang: "ru",
  //     active:true,
  //   },
  //   (err, updateResponse) => {
  //     if (err) return console.log("Error: ", err.message);

  //     logger.debug("Product Update response", {
  //       response: updateResponse,
  //       label: "test",
  //     });
  // client.UpdatePrice(
  //   {
  //     product_id: updateResponse.product.slug,
  //     old_price: "10000",
  //     price: "1000",
  //     price_type_id: "",
  //   },
  //   (err, updatePriceResponse) => {
  //     if (err) return console.log("Error: ", err.message);

  //     logger.debug("Product price Update response", {
  //       response: updatePriceResponse,
  //       label: "test",
  //     });

  // get Product
  // client.Get(
  //   {
  //     slug: updateResponse.product.slug,
  //     lang: "ru",
  //     onlyRelatedProducts: true,
  //   },
  //   (err, getResponse) => {
  //     if (err) return console.log("Error: ", err.message);

  //     logger.debug("Product Get response", {
  //       response: getResponse,
  //       label: "test",
  //     });
  // client.GetShops(
  //   {
  //     product_id: "5f256ee8bc7bd40012af03e4",
  //   },
  //   (err, getResponse) => {
  //     if (err) return console.log("Error: ", err.message);
  //     logger.debug("Shop Get response", {
  //       response: getResponse,
  //       label: "test",
  //     });
  //delete Product
  // client.Delete(
  //   {
  //     slug: updateResponse.product.slug,
  //   },
  //   (err, deleteResponse) => {
  //     if (err) return console.log("Error: ", err.message);

  //     logger.debug("Product Delete response", {
  //       response: deleteResponse,
  //       label: "test",
  //     });
  //     console.log("Product test completed!");
  //   }
  // );
  //         }
  //       );
  //     }
  //   );
  // }
  // );
  //   }
  // );
  // })

  // find Product
  // client.GetShops({
  //     product_id: "moika-vysokogo-davleniya-karcher-k-7-premium-full-control-plus"
  // }, (err, findResponse) => {
  //     if (err) return console.log('Error: ', err.message);

  //     logger.debug('Product get shops response', {
  //         response: findResponse,
  //         label: 'test'
  //     });
  // });

  // // filtering by attribute
  client.Find(
    {
      properties: [
        {
          property_id: "5f69a0a8c2ab890012fdd0d7",
          value: "ЖК-телевизор,LED телевизор",
        },
      ],
      category: "5f24e9d25aa3da35d8946cff",
      lang: "ru",
    },
    (err, filterResponse) => {
      if (err) return console.log("Error: ", err.message);

      logger.debug("Product Filter by attributes response", {
        response: filterResponse,
        label: "test",
      });
      console.log("Product filter by attributes test completed!");
    }
  );
}

main();
