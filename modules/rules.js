const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const Product = require('../models/Product')
const cfg = require("../config/index");
const logger = require("../config/logger");

const PROTO_PATH = __dirname + "../../protos/rule_service/rule.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
var RuleProto =
    grpc.loadPackageDefinition(packageDefinition).rule_service;

const Rule = {
    Rules : async () => {
        logger.info("starting rule cronjop...")
    
        let query = {
            active: true,
        }
        products = await Product.find(query)
    
        var client = new RuleProto.RuleService(
            `${cfg.ruleServiceHost}:${cfg.ruleServicePort}`,
            grpc.credentials.createInsecure()
        );
        // create server connection
    
        client = await client.find({
                name: "Hello Server",
            },
            (err, response) => {
                if (err) {
                    console.log("Error: ", err.message);
                    return err;
                }
                rules = response.rules
    
                for (let i = 0; i < products.length; i++) {
                    let product = products[i];
                    let rulesForThisProduct = rules.filter((rule, id) => {
                        // check category
                        let ruleCategoryIds = rule.category.map((category, id) => category.id);
                        let category = product.category ? product.category.toString() : 0
                        if (ruleCategoryIds.indexOf(category) >= 0) {
                            return true;
                        }
                        // check brand
                        let ruleBrandIds = rule.brand.map((brand, id) => brand.id);
                        let brand = product.brand ? product.brand.toString() : 0
                        if (ruleBrandIds.indexOf(brand) >= 0) {
                            return true;
                        }
                        // check model
                        let ruleModelIds = rule.model.map((model, id) => model.id);
                        let model = product.id ? product.id.toString() : 0
                        if (ruleModelIds.indexOf(model) >= 0) {
                            return true;
                        }
                        return false;
                    })
    
                    // get first rule
                    let Rule = rulesForThisProduct[0]
                    
                    //Check active or inactive 
                    if (Rule) {
                        let start_time = new Date(Rule.start_time).getTime()
                        let end_time = new Date(Rule.end_time).getTime()
                        let current_time = Date.now()
    
                        if (start_time <= current_time && current_time <= end_time) {
                            Rule.active = true;
                        } else {
                            Rule.active = false;
                        }
                    }
    
                    // if there is no rule or active false , clear flags
                    if (!Rule || Rule.active == false) {
                        const clearFlags = async () => {
                            product.rules = {
                                discount: 0,
                                cash_back: 0,
                                free_delivery: false
                            }
                            const updatedProduct = await Product.findByIdAndUpdate(product.id, product, {
                                new: true,
                                runValidators: true
                            });
                            updatedProduct.save()
    
                            // logger.info(" clear flags to rule ")
                        }
                        clearFlags()
                    }
    
    
                    // set flags
                    if (Rule) {
                        const setFlags = async () => {
    
                            product.rules = {
                                discount: Rule.discount,
                                cash_back: Rule.cash_back,
                                free_delivery: Rule.free_delivery
                            }
                            const updatedProduct = await Product.findByIdAndUpdate(product.id, product, {
                                new: true,
                                runValidators: true
                            });
                            updatedProduct.save()
                            // logger.info(" Set flags to rule ")
                        }
                        setFlags()
                    }
                    // console.log(Rule.length)
                }
            }
        );
    }
}    

module.exports = 
    Rule;
