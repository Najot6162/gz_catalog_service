const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const slugUpdater = require('mongoose-slug-updater');

const logger = require('./config/logger.js');
const cfg = require('./config');

mongoose.plugin(slugUpdater);

// loading proto file
const PROTO_URL = __dirname + '/protos/catalog_service/catalog_service.proto';
const packageDefinition = protoLoader.loadSync(PROTO_URL, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const catalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;

function main(){
    logger.info('Main function is running');

    // Connecting to database
    //const mongoDBUrl = 'mongodb://' + cfg.mongoUser + ':' + cfg.mongoPassword + '@' + cfg.mongoHost + ':' + cfg.mongoPort + '/' + cfg.mongoDatabase;
    mongoDBUrl = 'mongodb://localhost:27017/catalog_service';
    mongoose.connect(mongoDBUrl, { 
        useNewUrlParser:true,
        useUnifiedTopology:true 
    }, (err) => {
        if(err){
            logger.error('There is an error in connecting db (' + mongoDBUrl + '): ' + err.message);
        }
    });
    mongoose.connection.once('open',function(){
        logger.info('Connected to the databasee');
    });

    // gRPC server
    var server = new grpc.Server();

    server.addService(catalogProto.CategoryService.service, require('./services/category.js'));
    server.addService(catalogProto.ProductService.service, require('./services/product.js'));
    server.addService(catalogProto.BrandService.service, require('./services/brand.js'));
    server.addService(catalogProto.ProductPropertyService.service, require('./services/product_property'));
    server.addService(catalogProto.ProductPropertyGroupService.service, require('./services/product_property_group'));
    server.addService(catalogProto.ShopService.service, require('./services/shop'))

    server.bind('0.0.0.0:' + cfg.RPCPort, grpc.ServerCredentials.createInsecure());
    server.start();
    logger.info('grpc server is running at %s', cfg.RPCPort);  
}

main();