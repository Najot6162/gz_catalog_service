const mongoose = require("mongoose");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const logger = require("../../config/logger");
const langs = ["en", "ru", "uz"];
const cnf = require("../../config");
const async = require("async");
const shopService = require("../../services/shop");

let categoryStorage = {
  create: (b) => {
    return new Promise((resolve, reject) => {
      if (!b.name) return reject(new Error("name is required"));
      let c = b;

      c.parent = b.parent_id || null;
      c.lang = b.lang ? b.lang : cnf.lang;
      c.product_properties = b.product_properties
        .split(",")
        .filter((f) => {
          return mongoose.Types.ObjectId.isValid(f.trim());
        })
        .map((f, i) => f.trim());
      c.product_property_groups = b.product_property_groups
        .split(",")
        .filter((f) => {
          return mongoose.Types.ObjectId.isValid(f.trim());
        })
        .map((f, i) => f.trim());
      c.created_at = Date.now();
      c.updated_at = Date.now();

      let cCopy = c;
      c = new Category(c);
      c.save((err, category) => {
        if (err) return reject(err);
        // creating for other languages
        let otherLangs = langs.filter((lang, i) => lang != category.lang);
        async.eachSeries(
          otherLangs,
          (otherLang, cb) => {
            let categoryWithOtherLang = cCopy;
            categoryWithOtherLang.lang = otherLang;
            categoryWithOtherLang.slug = category.slug;
            categoryWithOtherLang = new Category(categoryWithOtherLang);
            categoryWithOtherLang.save((err, r) => {
              if (err) return cb(err);
              logger.debug("category is created with lang " + otherLang, {
                result: r,
              });
              cb(null, r);
            });
          },
          (err) => {
            if (err)
              logger.error(err.message, {
                function: "create category for other lang",
                category,
              });
          }
        );
        return resolve(category);
      });
    });
  },
  update: (b) => {
    return new Promise((resolve, reject) => {
      if (!b.id) return reject(new Error("Key is not provided"));
      if (!b.name) return reject(new Error("name is required"));
      if (!b.lang) return reject(new Error("Lang is not provided"));
      let query = {};
      // making query
      query = {
        ...query,
        lang: b.lang,
        $or: [
          {
            slug: b.id,
          },
        ],
      };
      if (mongoose.Types.ObjectId.isValid(b.id)) query.$or.push({ _id: b.id });

      Category.findOne(query, (err, cat) => {
        if (err) return reject(err);
        if (!cat)
          return reject(new Error("Document with id:" + b.id + " not found"));

        cat.name = b.name;
        cat.parent = b.parent_id || null;
        cat.active = b.active;
        cat.description = b.description;
        cat.order = b.order;
        cat.image = b.image;
        cat.meta = {
          title: b.meta ? b.meta.title : cat.meta.title,
          description: b.meta ? b.meta.description : cat.meta.description,
          tags: b.meta ? b.meta.tags : cat.meta.tags,
        };
        
        // fields for updating in all languages
        let product_properties = b.product_properties
          .split(",")
          .filter((f) => {
            return mongoose.Types.ObjectId.isValid(f.trim());
          })
          .map((f, i) => f.trim());

        let product_property_groups = b.product_property_groups
          .split(",")
          .filter((f) => {
            return mongoose.Types.ObjectId.isValid(f.trim());
          })
          .map((f, i) => f.trim());
        Category.updateMany({slug:cat.slug}, {
          $set:{
            product_properties: product_properties,
            product_property_groups: product_property_groups
          }
        }, (err, updateOtherFields) => {
          if(err){
            logger.error('property fields could not be updated', {
              function: 'update category',
              err
            });
          }
          logger.debug('property fields of category ' + cat.slug + ' have been updated', {
            updateResult: updateOtherFields,
            product_properties,
            product_property_groups
          });
        });

        // updating and sending response
        cat.save((err, updatedCategory) => {
          if (err) return reject(err);
          resolve(updatedCategory);
        });
      });
    });
  },
  find: (filters) => {
    return new Promise((resolve, reject) => {
      let query = { lang: filters.lang ? filters.lang : cnf.lang };
      query = {
        ...query,
        lang: filters.lang ? filters.lang : cnf.lang,
        parent: null,
      };
      if (filters.search.trim()) {
        query = {
          ...query,
          $or: [
            {
              name: { $regex: ".*" + filters.search + ".*" },
            },
            {
              slug: { $regex: ".*" + filters.search + ".*" },
            },
          ],
        };
      }

      let a = Category.aggregate([
				{ $match: query },
				{ $sort: { order: -1 }},
        {
          $lookup: {
						from: "categories",
						let: {parent_id: "$_id"},
						as: "children",
						pipeline: [{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$lang", query.lang]},
										{ $eq: ["$parent", "$$parent_id"]}
									]
								}
							}
						}, {
							$lookup: {
								from: "categories",
								let: {parent_id: "$_id"},
								as: "children",
								pipeline: [{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$lang", query.lang]},
												{ $eq: ["$parent", "$$parent_id"]}
											]
										}
									}
								}]
							},
						}] // pipeline end
          },
				}
      ]);

      if (filters.limit / 1) {
        a.skip(((filters.page - 1) * filters.limit) / 1);
        a.limit(filters.limit / 1);
      }

      a.exec((err, categories) => {
        if (err) return reject(err);

        // aggregation returns simple js objects (not mongoose documents), so we should add 'id' field by hand*
        categories = categories.map((c, i) => ({
          ...c,
          id: c._id,
          children: c.children
            ? c.children.map((ch, j) => ({
                ...ch,
								id: ch._id,
								children: ch.children ? ch.children.map((gch, k) => ({
									...gch,
									id: gch._id
								})) : null
              }))
            : null,
        }));
        for (let i = 0; i < categories.length; i++) {
          categories[i].image = categories[i].image
            ? cnf.cloudUrl + categories[i].image
            : "";
        }
        resolve(categories);
      });
    });
  },
  get: (req) => {
    return new Promise((resolve, reject) => {
      if (!(req.id || req.slug)) return reject(new Error("Key is not given"));

      let query = {};

      // making query
      query = {
        ...query,
        lang: req.lang ? req.lang : cnf.lang,
        $or: [
          {
            slug: req.slug,
          },
        ],
      };
      if (mongoose.Types.ObjectId.isValid(req.id))
        query.$or.push({ _id: req.id });
      Category.aggregate([
        { $match: query },
        { $limit: 1 },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "parent",
            as: "children",
          },
        }, {
          $lookup: {
            from: "categories",
            localField: "parent",
            foreignField: "_id",
            as: "parent",
          },
        }, {
          $unwind: {
            path: "$parent",
            preserveNullAndEmptyArrays: true,
          },
        }, {
          $lookup: {
            from: "productproperties",
            localField: "product_properties",
            foreignField: "_id",
            as: "product_properties",
          },
        },
      ]).exec((err, cat) => {
        if (err) return reject(err);
        //logger.debug("getting category result", { cat });
        if (!cat.length) return reject(new Error("Document not found"));
        cat = cat[0];
        cat = {
          ...cat,
          id: cat._id,
          children: cat.children
            ? cat.children.map((ch, i) => ({
                ...ch,
                id: ch._id,
              }))
            : null,
          parent: cat.parent
            ? {
                ...cat.parent,
                id: cat.parent._id,
              }
            : null,
          image: cat.image ? cnf.cloudUrl + cat.image : "",
          product_properties: cat.product_properties.map((pp, i) => ({
            ...pp,
            id: pp._id
          }))
        };

        return resolve(cat);
      });
    });
  },
  getChildrenWithProducts: (req) => {
    return new Promise((resolve, reject) => {
      if (!(req.id || req.slug)) return reject(new Error("Category key is not given"));


      let query = {};

      // making query
      query = {
        ...query,
        active: true,
        lang: cnf.lang,
        $or: [
          {
            slug: req.slug,
          },
        ],
      };
      if (mongoose.Types.ObjectId.isValid(req.id))
        query.$or.push({ _id: req.id });
      Category.aggregate([
        { $match: query },
        { $limit: 1 },
        {
          $lookup: {
						from: "categories",
						let: {parent_id: "$_id"},
						as: "children",
						pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$lang", query.lang]},
                      { $eq: ["$parent", "$$parent_id"]}
                    ]
                  }
                }
						  }, {
                $lookup: {
                  from: "products",
                  let: {category_id: "$_id"},
                  as: "products",
                  pipeline: [{
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$lang", query.lang]},
                          { $eq: ["$category", "$$category_id"]},
                          { $eq: ["$active", true]}
                        ]
                      }
                    }
                  }, {
                    $limit: 10
                  }, {
                    $project: {
                      _id: 0,
                      id: "$_id",
                      active: 1,
                      name: 1,
                      slug: 1,
                      image: 1,
                      price: 1,
                      prices: 1
                    }
                  }]
                },
              }, {
                $lookup: {
                  from: "categories",
                  let: {parent_id: "$_id"},
                  as: "children",
                  pipeline: [{
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$lang", query.lang]},
                          { $eq: ["$parent", "$$parent_id"]}
                        ]
                      }
                    }
                  }, {
                    $lookup: {
                      from: "products",
                      let: {category_id: "$_id"},
                      as: "products",
                      pipeline: [{
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ["$lang", query.lang]},
                              { $eq: ["$category", "$$category_id"]},
                              { $eq: ["$active", true]}
                            ]
                          }
                        }
                      }, {
                        $limit: 10
                      }, {
                        $project: {
                          _id: 0,
                          id: "$_id",
                          active: 1,
                          name: 1,
                          slug: 1,
                          image: 1,
                          price: 1,
                          prices: 1
                        }
                      }]
                    }
                  }, {
                    $project: {
                      id: "$_id",
                      name: 1,
                      slug: 1,
                      products: 1,
                      order: 1,
                      _id: 0
                    }
                  }]
                },
              }, {
                $project: {
                  id: "$_id",
                  name: 1,
                  slug: 1,
                  products: 1,
                  children: 1,
                  order: 1,
                  _id: 0
                }
              }
            ] // pipeline end
          },
        }
      ]).exec((err, cat) => {
        if (err) return reject(err);
        //logger.debug("getting child categories result", { cat });
        if (!cat.length) return reject(new Error("Document not found"));
        cat = cat[0];
        let categories = [];

        for(let i = 0; i < cat.children.length; i++){
          let c = cat.children[i];

          for(j = 0; j < c.children.length; j++){
            let grandChild = c.children[j];
            categories.push({
              category: {
                id: grandChild.id,
                name: grandChild.name,
                slug: grandChild.slug,
                order: grandChild.order
              },
              products: grandChild.products.map((p, i) => ({
                ...p,
                image: p.image ? cnf.cloudUrl + p.image : ""
              }))
            })
          }

          categories.push({
            category: {
              id: c.id,
              name: c.name,
              slug: c.slug,
              order: c.order
            },
            products: c.products.map((p, i) => ({
              ...p,
              image: p.image ? cnf.cloudUrl + p.image : ""
            }))
          });
        }

        return resolve({
          categories: categories.filter((ch, i) => ch.products.length)
        });
      });
    });
  },
  delete: (req) => {
    return new Promise((resolve, reject) => {
      if (!req.slug) return reject(new Error("Key is not provided"));

      // set parentid of orphan categories to null
      Category.update(
        { parent: req.slug },
        {
          $set: { parent: null, updated_at: Date.now() },
        },
        { many: true },
        (err, updateResult) => {
          console.log("orphan categories updated", updateResult);
        }
      );

      // update products of this category
      Product.update(
        { category: req.slug },
        {
          $set: { category: null, updated_at: Date.now() },
        },
        { many: true },
        (err, updateResult) => {
          console.log(
            "orphan products updated after category removal",
            updateResult
          );
        }
      );

      Category.deleteMany({ slug: req.slug }, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  },
};

module.exports = categoryStorage;
