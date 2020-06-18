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
    const mongoDBUrl = 'mongodb://' + cfg.mongoHost + ':' + cfg.mongoPort + '/' + cfg.mongoDatabase;
    mongoose.connect(mongoDBUrl, { 
        useNewUrlParser:true 
    }, (err) => {
        if(err){
            logger.error('There is an error in connecting db: ' + err.message);
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

    server.bind('0.0.0.0:' + cfg.RPCPort, grpc.ServerCredentials.createInsecure());
    server.start();
    logger.info('grpc server is running at %s', cfg.RPCPort);  
}

main();