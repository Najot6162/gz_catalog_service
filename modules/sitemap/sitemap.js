const json2xml = require("json2xml");
const { reject } = require("async");
const fs = require("fs");
const { resolve } = require("path");
const Product = require("../../models/Product");
const Shop = require("../../models/Shop");
const categoryStorage = require('../../storage/mongo/category');

const host = 'https://goodzone.uz';

const generateXML = () => {
    return new Promise((resolve, reject) => {
        Product.find({
            active: true,
            lang: "ru",
        }, {
            _id: 1,
            slug: 1,
            name: 1
        }, (err, products) => {
            if (err) return reject(err);
            let arrForSitemap = products.map((product, i) => {
                return {
                    url: {
                        loc: host + '/product/' + product.slug,
                        lastmod: '2020-11-24',
                        changefreq: 'daily',
                        priority: 1
                    }
                }
            });

            let arrForProducts = products.map((product, i) => {
                return {
                    product: {
                        url: host + '/product/' + product.slug,
                        product: product.name
                    }
                }
            });

            // fs.writeFile(__dirname+'/sitemap.xml', json2xml({
            //     urlset: arr,
            //     attr: { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9"}
            // }, { attributes_key: 'attr' }), function (err) {
            //     console.log("writing to xml ...")
            //     if (err) return reject(err);
            //     console.log('file saved');
            // });

            fs.writeFile(__dirname+'/products.xml', json2xml({
                products: arrForProducts
            }, { headers: true }), function (err) {
                console.log("writing to xml ...")
                if (err) return reject(err);
                console.log('file saved');
            });
            return resolve();
        });
    });
}

const categoryPages = () => {
    let availableUrls = [];
    let availableCategories = [];
    return categoryStorage.find({
        lang: 'ru',
        limit: 15,
        page: 1
    }).then((categories) => {
        categories.forEach(element => {
            if(element.children && element.children.length){
                element.children.forEach(child => {
                    if(child.children && child.children.lenth) {
                        child.children.forEach(granchild => {
                            availableCategories.push(granchild.slug);
                        });
                    } else {
                        availableCategories.push(child.slug);
                    }
                });
            } else {
                availableCategories.push(element.slug);
            }
        });

        return availableCategories;
    });
}
module.exports = { generateXML };
