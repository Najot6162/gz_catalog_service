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
    client.Create({
        name: "my Shop1",
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
            client.Update({
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

                    client.UpdateQuantity({
                        shop_id: updateResponse.shop.slug,
                        product_id: "5f3273ceb9e5da0bce0ea20b",
                        quantity: 7
                    },
                        (err, updatePriceResponse) => {
                            console.log("Shop Update quantity");
                            if (err) return console.log("Error: ", err.message);
                            logger.debug("Shop Update quantity response", {
                                response: updatePriceResponse,
                                label: "test",
                            });
                            console.log(updatePriceResponse);


                            // get Shop
                            client.Get({
                                slug: updateResponse.shop.slug,
                                lang: "ru",
                            },
                                (err, getResponse) => {
                                    console.log("Shop Get");
                                    if (err) return console.log("Error: ", err.message);
                                    logger.debug("Shop Get response", {
                                        response: getResponse,
                                        label: "test",
                                    });
                                    console.log(getResponse);

                                    client.GetProducts({
                                        id: "5f2acfd6d3936229f67cb03e",
                                        slug: "goodzone-samarkand",
                                        lang: "ru"
                                    }, (err, getResponse) => {
                                        if (err) return console.log('Error: ', err.message);
                                        logger.debug('Products Get response', {
                                            response: getResponse,
                                            label: 'test'
                                        });

                                        //delete Shop
                                        client.Delete({
                                            slug: updateResponse.shop.slug,
                                        },
                                            (err, deleteResponse) => {
                                                if (err) return console.log("Error: ", err.message);

                                                logger.debug("Shop Delete response", {
                                                    response: deleteResponse,
                                                    label: "test",
                                                });
                                                console.log("Shop test completed!");
                                            });
                                    });
                                }
                            );
                        }
                    )
                }
            );
        }
    )
}
main();