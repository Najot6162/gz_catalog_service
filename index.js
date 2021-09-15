const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const slugUpdater = require("mongoose-slug-updater");
const logger = require("./config/logger.js");
const cfg = require("./config");
const uploadCsv = require("./modules/upload");
const uploadSitemap = require("./modules/sitemap/upload_sitemap");
const rulesCronjop = require("./modules/rules")

mongoose.plugin(slugUpdater);

// loading proto file
const PROTO_URL = __dirname + "/protos/catalog_service/catalog_service.proto";
const packageDefinition = protoLoader.loadSync(PROTO_URL, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const catalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;

function main() {
    logger.info("Main function is running");

    //Connecting to database

    const mongoDBUrl =
        "mongodb://" +
        cfg.mongoUser +
        ":" +
        cfg.mongoPassword +
        "@" +
        cfg.mongoHost +
        ":" +
        cfg.mongoPort +
        "/" +
        cfg.mongoDatabase;
    // const mongoDBUrl = "mongodb://localhost:27017/catalog_service";

    logger.info("Connecting to db: " + mongoDBUrl);

    mongoose.connect(
        mongoDBUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify:false
    })
    .catch(err =>{
        logger.error("There is an error in connecting db (" + mongoDBUrl + "): " + err.message)
        process.exit()
    })

    mongoose.connection.once("open", function () {
        logger.info("Connected to the databasee");

        setTimeout(() => {

            // DATABASE MIGRATIONS & OPERATIONS
            require('./modules/migrations');
            
            /* HATCH INTEGRATION PART */
            // Function to generate csv file with information of products and upload it to minio once a day
            const hatch = require("./modules/hatch/hatch_csv");

            setInterval(function(){
                hatch.convertToCsv().then((result) => {
                    console.log("Csv have been generated");
                    uploadCsv.upload('hatch/samsung_products.csv', __dirname + '/modules/hatch/hatch.csv');
                }).catch((err) => {
                    console.log("error on generating csv: " + err);
                })
            }, 24 * 3600 * 1000);

            /* SITEMAP GENERATOR */
            const sitemap = require('./modules/sitemap/sitemap.js');
            setInterval(function(){
                sitemap.generateXML().then((result) => {
                    console.log("SiteMap have been generated");
                }).catch((err) => {
                    console.log("error on generating sitemap: " + err);
                })
            }, 23 * 3600 * 1000);

            setInterval(function () {
                uploadSitemap.uploadSiteMap();
            }, 24 * 3600 * 1000)

            /* UNISAVDO INTEGRATION PART */
            // Function to generate csv file with information of products and upload it to minio once a day
            const unisavdo = require("./modules/unisavdo/unisavdo_csv");
            setInterval(function(){
                logger.info('generating unisavdo csv file');
                unisavdo.convertToCsv().then((result) => {
                    console.log("Csv have been generated");
                    uploadCsv.upload('unisavdo/products.csv', __dirname + '/modules/unisavdo/products.csv');
                }).catch((err) => {
                    console.log("error on generating csv: " + err);
                })
            }, 24 * 3600 * 1000);   
        }, 5000);
        //Strarting Rule Cronjop 
        setInterval(function(){
            rulesCronjop.Rules()
        },3600 * 1000)
    });

    // gRPC server
    var server = new grpc.Server();

    server.addService(
        catalogProto.CategoryService.service,
        require("./services/category.js")
    );
    server.addService(
        catalogProto.ProductService.service,
        require("./services/product.js")
    );
    // server.addService(
    //     catalogProto.BrandService.service,
    //     require("./services/brand.js")
    // );
    server.addService(
        catalogProto.ProductPropertyService.service,
        require("./services/product_property")
    );
    server.addService(
        catalogProto.ProductPropertyGroupService.service,
        require("./services/product_property_group")
    );
    server.addService(
        catalogProto.ShopService.service,
        require("./services/shop")
    );
    server.addService(
        catalogProto.FeedbackService.service,
        require("./services/feedback")
    );
    server.addService(
      catalogProto.FeaturedListService.service,
      require("./services/featured_list")
    );

    server.addService(
        catalogProto.ReviewService.service,
        require("./services/review.js")
    );

    server.bind(
        "0.0.0.0:" + cfg.RPCPort,
        grpc.ServerCredentials.createInsecure()
    );
    server.start();
    logger.info("grpc server is running at %s", cfg.RPCPort);
}

main();
