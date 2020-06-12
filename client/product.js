var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

var PROTO_PATH = __dirname + '/../protos/catalog_service/catalog.proto';
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
    var client = new CatalogProto.ProductService('localhost:7000', grpc.credentials.createInsecure());

    // create Product
    client.Create({
        name: 'my product',
        category_id: '5ee1e1b06123a6296c4996af',
        preview_text: 'preview text of my product',
        description: 'description of my product'
    }, (err, createResponse) => {
        console.log('Product Create');
        if(err) return console.log('Error: ', err.message);
        console.log(createResponse);
    
        // find Product
        client.Find({}, (err, findResponse) => {
            console.log('Product Find');
            if(err) return console.log('Error: ', err.message);
            console.log(findResponse);
        });
        
        // update Product
        client.Update({
            id: createResponse.product.id,
            name: 'my updated Product',
            category_id: '5ee1e1b06123a6296c4996af'
        }, (err, updateResponse) => {
            console.log('Product Update');
            if(err) return console.log('Error: ', err.message);
            console.log(updateResponse);

            // get Product
            client.Get({
                id: updateResponse.product.id,
            }, (err, getResponse) => {
                console.log('Product Get');
                if(err) return console.log('Error: ', err.message);
                console.log(getResponse);

                // delete Product
                client.Delete({
                    id: updateResponse.product.id
                }, (err, deleteResponse) => {
                    console.log('Product Delete');
                    if(err) return console.log('Error: ', err.message);
                    console.log(deleteResponse);
                });
            });
        });
    });
}

main();