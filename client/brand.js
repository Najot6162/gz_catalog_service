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
  var client = new CatalogProto.BrandService('localhost:7000', grpc.credentials.createInsecure());

    // create Brand
    client.Create({
        name: 'my Brand',
        preview_text: 'preview text of my brand',
        description: 'description of my brand',
        active: true
    }, (err, createResponse) => {
        console.log('Brand Create');
        if(err) return console.log('Error: ', err.message);
        console.log(createResponse);
        
        // find Brand
        client.Find({}, (err, findResponse) => {
        console.log('Brand Find');
        if(err) return console.log('Error: ', err.message);
        console.log(findResponse);
        });
        
        // update Brand
        client.Update({
            id: createResponse.brand.id,
            name: 'my updated Brand',
            preview_text: 'preview text of my updated brand',
            description: 'description of my updated brand',
            active: true
        }, (err, updateResponse) => {
            console.log('Brand Update');
            if(err) return console.log('Error: ', err.message);
            console.log(updateResponse);

            // get Brand
            client.Get({
                id: updateResponse.brand.id,
            }, (err, getResponse) => {
                console.log('Brand Get');
                if(err) return console.log('Error: ', err.message);
                console.log(getResponse);

                // delete Brand
                client.Delete({
                    id: updateResponse.brand.id
                }, (err, deleteResponse) => {
                    console.log('Brand Delete');
                    if(err) return console.log('Error: ', err.message);
                    console.log(deleteResponse);
                });
            });
        });
    });
}

main();