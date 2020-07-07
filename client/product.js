var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
const logger = require('../config/logger');

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
    var client = new CatalogProto.ProductService('localhost:7000', grpc.credentials.createInsecure());

    // create Product
    client.Create({
        name: 'my product',
        category_id: '5ee1e1b06123a6296c4996af',
        brand_id: '5ee36f67f8601328a86456bf',
        additional_categories: '5ee1e1b06123a6296c4996bd,5ee1e1b06123a6296c4556bd,5ee1e1b06123a6296c4236bd',
        related_products: '5ee36f67f8601328a86456df,5ee0d1b06123a6296c4996bd,5ee1sdb06123a6296c4996bd',
        preview_text: 'preview text of my product',
        description: 'description of my product',
        external_id: '15',
        gallery: 'img/somephoto.jpg',
        meta: {
            title: 'Product Meta',
            description: 'Description of Meta',
            tags: 'Tag of meta'
        }
    }, (err, createResponse) => {
        if(err) return console.log('Error: ', err.message);

        logger.debug('Product Create response', {
            response: createResponse,
            label: 'test'
        });
    
        // find Product
        client.Find({}, (err, findResponse) => {
            if(err) return console.log('Error: ', err.message);

            logger.debug('Product Find response', {
                response: findResponse,
                label: 'test'
            });
        });
        
        // update Product
        client.Update({
            id: createResponse.product.id,
            name: 'my updated Product',
            category_id: '5ee1e1b06123a6296c4996af',
            brand_id: '5ee36f67f8601328a86456bf',
            additional_categories: '5ee1e1b06123a6296c4996bd,5ee1e1b06123a6296c4556bd,5ee1e1b06123a6296c4236bd',
            related_products: '5ee36f67f8601328a86456df,5ee0d1b06123a6296c4996bd,5ee1sdb06123a6296c4996bd',
            preview_text: 'preview text of my updated product',
            description: 'description of my updated product',
            external_id: '16',
            gallery: 'img/some.jpg',
            meta: {
                title: ' Updated Product Meta',
                description: 'Updatet Description of Meta',
                tags: 'Updated Tag of meta'
            }
        }, (err, updateResponse) => {
            if(err) return console.log('Error: ', err.message);

            logger.debug('Product Update response', {
                response: updateResponse,
                label: 'test'
            });

            // get Product
            client.Get({
                id: updateResponse.product.id,
            }, (err, getResponse) => {
                if(err) return console.log('Error: ', err.message);

                logger.debug('Product Get response', {
                    response: getResponse,
                    label: 'test'
                });
            client.GetShops({
                product_id: updateResponse.product.id,
            }, (err, getResponse) => {
                    if (err) return console.log('Error: ', err.message);
                    logger.debug('Shop Get response', {
                    response: getResponse,
                    label: 'test'
                        });           
                // delete Product
                client.Delete({
                    id: updateResponse.product.id
                }, (err, deleteResponse) => {
                    if(err) return console.log('Error: ', err.message);

                    logger.debug('Product Delete response', {
                        response: deleteResponse,
                        label: 'test'
                    });
                    console.log('Product test completed!');
                });
            });
        });
    });
}
)}

main();