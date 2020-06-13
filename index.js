const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const slugUpdater = require('mongoose-slug-updater');

const cfg = require('./config');

mongoose.plugin(slugUpdater);

const packageDefinition = protoLoader.loadSync(__dirname + '/protos/catalog_service/catalog.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const catalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;

function main(){
    // Connecting to database
    const mongoDBUrl = 'mongodb://' + cfg.mongoHost + ':' + cfg.mongoPort + '/' + cfg.mongoDatabase;
    mongoose.connect(mongoDBUrl, { 
        useNewUrlParser:true 
    });
    mongoose.connection.once('open',function(){
        console.log('Connected to the databasee');
    }).on('error',function(error){
        console.log('There is an error in connecting db: '+ mongoDBUrl);
    });

    // gRPC server
    var server = new grpc.Server();

    server.addService(catalogProto.CategoryService.service, require('./services/category.js'));
    server.addService(catalogProto.ProductService.service, require('./services/product.js'));
    server.addService(catalogProto.BrandService.service, require('./services/brand.js'));

    server.bind('0.0.0.0:' + cfg.RPCPort, grpc.ServerCredentials.createInsecure());
    server.start();
    console.log('grpc server is running at %s', cfg.RPCPort);
}

main();