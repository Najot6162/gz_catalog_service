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
  var client = new CatalogProto.CategoryService('localhost:7000', grpc.credentials.createInsecure());

  // create category
  client.Create({
    name: 'my category',
    meta: {
      title: 'Category Meta',
      description: 'Description of Meta',
      tags: 'Tag of meta'
    },
    product_property_groups: '5ee1e1b06123sd296c4996af,5ee1e1b06123a6296c4996af'
  }, (err, createResponse) => {
    console.log('Category Create');
    if(err) return console.log('Error: ', err.message);
    console.log(createResponse);
    
    // find category
    client.Find({search: 'ihc'}, (err, findResponse) => {
      console.log('Category Find');
      if(err) return console.log('Error: ', err.message);
      console.log(findResponse);
    });
    
    // update category
    client.Update({
      id: createResponse.category.id,
      name: 'my updated category',
      meta: {
        title: 'Updated Category Meta',
        description: 'Updated Description of Meta',
        tags: 'Updated Tag of meta'
      },
      product_property_groups: '5ee1e1b06123sd296c4996af,5ee1e1b06123a6296c4996af'
    }, (err, updateResponse) => {
      console.log('Category Update');
      if(err) return console.log('Error: ', err.message);
      console.log(updateResponse);

      // get category
      client.Get({
        id: updateResponse.category.id,
      }, (err, getResponse) => {
        console.log('Category Get');
        if(err) return console.log('Error: ', err.message);
        console.log(getResponse);

        // delete category
        client.Delete({
          id: updateResponse.category.id
        }, (err, deleteResponse) => {
          console.log('Category Delete');
          if(err) return console.log('Error: ', err.message);
          console.log(deleteResponse);
        });
      });
    });
  });
}

main();