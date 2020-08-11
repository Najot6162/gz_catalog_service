var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
const logger = require("../config/logger");
var PROTO_PATH = __dirname + '/../protos/catalog_service/catalog_service.proto';
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);
var CatalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;

function main() {
    var client = new CatalogProto.BrandService('localhost:7000', grpc.credentials.createInsecure());

    // create Brand
    client.Create({
        name: 'my Brand',
        preview_text: 'preview text of my brand',
        description: 'description of my brand',
        image: "img.jpg",
        active: true
    }, (err, createResponse) => {
        if (err) return console.log('Error: ', err.message);
        logger.debug("Brand Create response", {
            response: createResponse,
            label: "test",
        });
        // find Brand
        client.Find({ category: "5f24e9d25aa3da35d8946cf9", lang: "ru" }, (err, findResponse) => {
            if (err) return console.log('Error: ', err.message);
            logger.debug("Brand Find response", {
                response: findResponse,
                label: "test",
            });
        });

        // update Brand
        client.Update({
            id: createResponse.brand.id,
            name: 'my updated Brand',
            preview_text: 'preview text of my updated brand',
            description: 'description of my updated brand',
            image: "img.jpg",
            active: true
        }, (err, updateResponse) => {
            if (err) return console.log('Error: ', err.message);
            logger.debug("Brand Update response", {
                response: updateResponse,
                label: "test",
            });

            // get Brand
            client.Get({
                id: updateResponse.brand.id,
            }, (err, getResponse) => {
                if (err) return console.log('Error: ', err.message);
                logger.debug("Brand Get response", {
                    response: getResponse,
                    label: "test",
                });

                // delete Brand
                client.Delete({
                    id: updateResponse.brand.id
                }, (err, deleteResponse) => {
                    if (err) return console.log('Error: ', err.message);
                    logger.debug("Brand Delete response", {
                        response: updateResponse,
                        label: "test",
                    });
                });
            });
        });
    });
}

main();