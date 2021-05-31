const Json2csvParser = require("json2csv").Parser;
const { reject } = require("async");
const fs = require("fs");
const { resolve } = require("path");
const config = require("../../config");
const Product = require("../../models/Product");
const Shop = require("../../models/Shop");
const convertToCsv = () => {
    return new Promise((resolve, reject) => {
        Product.find({
            active: true,
            lang: "ru"
        }, {
            _id: 1,
            slug: 1,
            brand: 1,
            name: 1,
            "price.price": 1,
            category: 1,
            average_rate: 1,
            reviews_count: 1,
            code: 1,
            image: 1,
            description: 1
        }).populate({
            path: "category",
            select: ["name"]
        }).populate({
            path: "brand",
            select: ["name"]
        }).exec((err, results) => {
            if (err) return reject(err);
            console.log(results.length + " products found. Getting shops...");
            Shop.find({ lang: "ru" }, {products: 1},(err, shops) => {
                if (err) return reject(err);
                console.log(shops.length + " shops found");
                for (let i = 0; i < shops.length; i++) {
                    if (shops[i].products) {
                        for (let j = 0; j < shops[i].products.length; j++) {
                            for (let k = 0; k < results.length; k++) {
                                if (results[k]._id.toString() == shops[i].products[j].product.toString()) {
                                    if (results[k].quantity) {
                                        results[k].quantity = results[k].quantity + shops[i].products[j].quantity
                                    } else {
                                        results[k].quantity = shops[i].products[j].quantity
                                    }
                                }
                            }
                        }
                    }
                }
                let arr = [];
                let obj = {};
                for (let i = 0; i < results.length; i++) {
                    obj = {
                        "Бренд": results[i].brand ? results[i].brand.name : "-",
                        "MPN": results[i].code.length ? results[i].code : "-",
                        "Наименование продукта": results[i].name,
                        "Цена": results[i].price.price,
                        "URL-адрес страницы": "https://goodzone.uz/product/" + results[i].slug,
                        "URL изображения": results[i].image ? (config.cloudUrl + results[i].image) : "",
                        "Описание": results[i].description,
                        "Данные о наличии продукта": results[i].quantity ? results[i].quantity : 0,
                        "Категория товара": results[i].category ? results[i].category.name : "-",
                        "Оценка товара": results[i].average_rate,
                        "Количество отзывов": results[i].reviews_count
                    }
                    arr.push(obj);
                }
                const csvFields = ["Бренд", "MPN", "Наименование продукта", "Цена", "URL-адрес страницы", "URL изображения", "Описание", "Данные о наличии продукта", "Категория товара", "Оценка товара", "Количество отзывов"];
                const json2csvParser = new Json2csvParser({ csvFields });
                const csv = json2csvParser.parse(arr);

                console.log("writing to csv ...")
                fs.writeFile(__dirname+'/products.csv', csv, function (err) {
                    if (err) return reject(err);
                    console.log('file saved');
                    return resolve(results);
                });
            });
        });
    });

}
module.exports = { convertToCsv };
