const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const Product = require('../models/Product')

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

const Rules = async () => {

    products = await Product.find().limit(5)

    var client = new RuleProto.RuleService(
        "localhost:7007",
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
                    if (ruleCategoryIds.indexOf(product.category.toString()) >= 0) {
                        return true;
                    }
                    // check brand
                    let ruleBrandIds = rule.brand.map((brand, id) => brand.id);
                    if (ruleBrandIds.indexOf(product.brand.toString()) >= 0) {
                        return true;
                    }
                    // check model
                    let ruleModelIds = rule.model.map((model, id) => model.id);
                    if (ruleModelIds.indexOf(product.id.toString()) >= 0) {
                        return true;
                    }
                    return false;
                })

                // get first rule
                let Rule = rulesForThisProduct[0]

                // if there is no rule, clear flags
                if (!Rule) {
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
                    }
                    setFlags()
                }
            }
        }
    );
}
module.exports = {
    Rules
};