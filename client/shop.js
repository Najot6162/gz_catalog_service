var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

var PROTO_PATH = __dirname + '/../protos/catalog_service/catalog_service.proto';
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);
var CatalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;

function main() {
    var client = new CatalogProto.ShopService('localhost:7000', grpc.credentials.createInsecure());

    // create Brand
    client.Create({
        name: 'my Shop',
        preview_text: 'preview text of my shop',
        description: 'description of my shop',
        address: 'Address of my shop',
        active: true
    }, (err, createResponse) => {
        console.log('Shop Create');
        if (err) return console.log('Error: ', err.message);
        console.log(createResponse);

        // find Shop
        client.Find({}, (err, findResponse) => {
            console.log('Shop Find');
            if (err) return console.log('Error: ', err.message);
            console.log(findResponse);
        });

        // update Shop
        client.Update({
            id: createResponse.shop.id,
            name: 'my updated Shop',
            preview_text: 'preview text of my updated shop',
            description: 'description of my updated shop',
            address: 'Address of my updated shop',
            active: true
        }, (err, updateResponse) => {
            console.log('Shop Update');
            if (err) return console.log('Error: ', err.message);
            console.log(updateResponse);

            // get Shop
            client.Get({
                id: updateResponse.shop.id,
            }, (err, getResponse) => {
                console.log('Shop Get');
                if (err) return console.log('Error: ', err.message);
                console.log(getResponse);

                // delete Shop
                client.Delete({
                    id: updateResponse.shop.id
                }, (err, deleteResponse) => {
                    console.log('Shop Delete');
                    if (err) return console.log('Error: ', err.message);
                    console.log(deleteResponse);
                });
            });
        });
    });
}

main();