const importer = require("../import");
const syncronizer = require('./sync');

// importer.importBrands().then((result) => {
// 	console.log("Brands have been imported");
// }).catch((err) => {
// 	console.log("error on importing brands: " + err);
// });

// importer.importCategories().then((result) => {
// 	console.log("Categories have been imported");
// }).catch((err) => {
// 	console.log("error on importing Categories: " + err);
// });

// importer.importProducts().then((result) => {
// 	console.log("Products have been imported");
// }).catch((err) => {
// 	console.log("error on importing Products: " + err);
// });

// importer.removeDuplicateProducts().then((result) => {
// 	console.log("Duplicate Products have been removed");
// }).catch((err) => {
// 	console.log("error on removing Products: " + err);
// });

// importer.importProductImages().then((result) => {
// 	console.log("Product images have been processed");
// }).catch((err) => {
// 	console.log("error on importing files: " + err);
// });

// importer.importProductCodes().then((result) => {
// 	console.log("Product codes have been imported");
// }).catch((err) => {
// 	console.log("error on importing product codes: " + err);
// });

// importer.updateInStockField().then((result) => {
//   console.log("Product inStock field updated");
// }).catch((err) => {
//   console.log("error on updating inStock field: " + err);
// });
// importer.importShopStocks().then((result) => {
//   console.log("Shops have been imported");
// }).catch((err) => {
//   console.log("error on importing shops: " + err);
// }); 24 * 3600 * 1000

// syncronizer.syncProductsFieldsForLangs().then((result) => {
//     console.log(result.products + " products fields synchronized for all languages");
// }).catch((err) => {
//     console.log("error on synchronizing product fields: " + err);
// });