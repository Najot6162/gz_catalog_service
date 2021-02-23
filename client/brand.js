// var grpc = require('grpc');
// var protoLoader = require('@grpc/proto-loader');
// const logger = require("../config/logger");
// const { reject } = require('async');
// var PROTO_PATH = __dirname + '/../protos/catalog_service/catalog_service.proto';
// var packageDefinition = protoLoader.loadSync(
//     PROTO_PATH, {
//     keepCase: true,
//     longs: String,
//     enums: String,
//     defaults: true,
//     oneofs: true
// }
// );
// var CatalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;
// var client = new CatalogProto.BrandService(
//   "localhost:7000",
//   grpc.credentials.createInsecure()
// );

    
//     // create Brand
// function create() {
//   return new Promise((reject, reject) => {
//     client.Create({
//       name: 'test',
//       preview_text: 'preview text of my brand',
//       description: 'description of my brand',
//       image: "img.jpg",
//       active: true
//     }, (err, createResponse) => {
//       if (err) return reject(err);
//       logger.debug("Brand Create response", {
//         response: createResponse,
//         label: "test",
//       });
//         return resolve(createResponse);
//     }
//   }
// }
    
// //         // find Brand
// //         // client.Find({}, (err, findResponse) => {
// //         //     if (err) return console.log('Error: ', err.message);
// //         //     logger.debug("Brand Find response", {
// //         //         response: findResponse,
// //         //         label: "test",
// //         //     });
// //         // });

// //         // update Brand
// //         // client.Update(
// //         //   {
// //         //     id: "5f24d71fe5fba43358f294eb",
// //         //     name: "LG",
// //         //     image:
// //         //       "0fcd3e01-1884-4a87-934c-ea4c7ce6ca41",
// //         //     preview_text: " ",
// //         //     active: true,
// //         //     order: 240
// //         //   },
// //         //   (err, updateResponse) => {
// //         //     if (err) return console.log("Error: ", err.message);
// //         //     logger.debug("Brand Update response", {
// //         //       response: updateResponse,
// //         //       label: "test",
// //         //     });

// //             //     // get Brand
// //             client.Get(
// //               {
// //                 id: "5f24d71fe5fba43358f294eb",
// //               },
// //               (err, getResponse) => {
// //                 if (err) return console.log("Error: ", err.message);
// //                 logger.debug("Brand Get response", {
// //                   response: getResponse,
// //                   label: "test",
// //                 });

// //             //         // delete Brand
// //             //         client.Delete({
// //             //             id: updateResponse.brand.id
// //             //         }, (err, deleteResponse) => {
// //             //             if (err) return console.log('Error: ', err.message);
// //             //             logger.debug("Brand Delete response", {
// //             //                 response: deleteResponse,
// //             //                 label: "test",
// //             //             });
// //             //         });
// //             //     });
// //             //  });
// //           }
// //         );
// // }

// module.exports = {create}