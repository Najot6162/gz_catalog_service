const json2xml = require("json2xml");
const { reject } = require("async");
const fs = require("fs");
const { resolve } = require("path");
const Product = require("../../models/Product");
const categoryStorage = require("../../storage/mongo/category");
const pages = ['faq','how-to-order','delivery','exchange-return-repair','payment-plan','bonuses','about']

const host = "https://goodzone.uz";
const catUrl = "https://goodzone.uz/shop/";

const generateXML = () => {
  return new Promise((resolve, reject) => {
    Product.find(
      {
        active: true,
        lang: "ru",
      },
      {
        _id: 1,
        slug: 1,
        name: 1,
      },
      (err, products) => {
        if (err) return reject(err);
        let arrForSitemap = products.map((product, i) => {
            let d = (new Date()).toISOString().split('T')[0];
          return {
            url: {
              loc: host + "/product/" + product.slug,
              lastmod: d,
              changefreq: "daily",
              priority: 1,
            },
          };
        });
        categoryPages()
          .then((result) => {
            for (let i = 0; i < result.length; i++) {
              arrForSitemap[i].url.category_url = result[i];
            }
            for (let j = 0; j < pages.length; j++) {
                arrForSitemap[j].url.static_page = host+'/'+pages[j];
            }
            fs.writeFile(
              __dirname + "/sitemap.xml",
              json2xml(
                {
                  urlset: arrForSitemap,
                  attr: {
                    xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
                  },
                },
                { attributes_key: "attr" }
              ),
              function (err) {
                console.log("writing to xml ...");
                if (err) return reject(err);
                console.log("file saved");
              }
            );
            return resolve();
          })
          .catch((error) => {
            return console.log(error);
          });
        // let arrForProducts = products.map((product, i) => {
        //     return {
        //         product: {
        //             url: host + '/product/' + product.slug,
        //             product: product.name
        //         }
        //     }
        // });
        // fs.writeFile(__dirname+'/products.xml', json2xml({
        //     products: arrForProducts
        // }, { headers: true }), function (err) {
        //     console.log("writing to xml ...")
        //     if (err) return reject(err);
        //     console.log('file saved');
        // });
      }
    );
  });
};

const categoryPages = () => {
  let availableUrls = [];
  let availableCategories = [];
  return categoryStorage
    .find({
      lang: "ru"
    })
    .then((categories) => {
      categories.forEach((element) => {
        if (element.children && element.children.length) {
          element.children.forEach((child) => {
            if (child.children && child.children.length) {
              child.children.forEach((granchild) => {
                availableUrls.push(catUrl + granchild.slug);
              });
            } else {
              availableUrls.push(catUrl + child.slug);
            }
          });
        } else {
            availableUrls.push(catUrl + element.slug);
        }
      });
      return availableUrls;
    });
};
module.exports = { generateXML };
