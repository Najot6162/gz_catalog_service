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
    var client = new CatalogProto.FeedbackService('localhost:7000', grpc.credentials.createInsecure());

    // create Brand
    client.Create({
        customer_name: 'customer name',
        customer_id: "customer_id",
        product_id: "my-product",
        comment: "my comment",
        rate: 2,
        active: true
    }, (err, createResponse) => {
        if (err) return console.log('Error: ', err.message);
        logger.debug("Feedback Create response", {
            response: createResponse,
            label: "test",
        });
        // find Feedback
        client.Find({ product_id: "my-product", lang: "ru" }, (err, findResponse) => {
            if (err) return console.log('Error: ', err.message);
            logger.debug("Feedback Find response", {
                response: findResponse,
                label: "test",
            });
        });

        // update Feedback
        client.Update({
            id: createResponse.feedback.id,
            customer_name: ' updated customer name',
            customer_id: "customer_id",
            product_id: createResponse.feedback.product_id,
            comment: "my updated comment",
            rate: 1,
            active: true
        }, (err, updateResponse) => {
            if (err) return console.log('Error: ', err.message);
            logger.debug("Feedback Update response", {
                response: updateResponse,
                label: "test",
            });

            // get Feedback
            client.Get({
                id: updateResponse.feedback.id,
            }, (err, getResponse) => {
                if (err) return console.log('Error: ', err.message);
                logger.debug("Feedback Get response", {
                    response: getResponse,
                    label: "test",
                });

                // delete Brand
                client.Delete({
                    id: updateResponse.feedback.id
                }, (err, deleteResponse) => {
                    if (err) return console.log('Error: ', err.message);
                    logger.debug("Feedback Delete response", {
                        response: deleteResponse,
                        label: "test",
                    });
                });
            });
        });
    });
}

main();