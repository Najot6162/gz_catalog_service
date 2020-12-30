const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;

var ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      slug: "name",
      permanent: true,
    },
    products: [
      {
        product: {
          type: Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
      },
    ],
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      required: true,
    },
    address2: {
      type: String,
    },
    preview_text: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    working_hours: {
      type: String,
    },
    loc: {
      long: {
        type: Number,
      },
      lat: {
        type: Number,
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    // area to check in_stock quantity, if other region is added: just add to enum and write script 
    //(dont forget to add to inStock object boolean value of this region)
    area: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
    },
    lang: {
      type: String,
      enum: ["uz", "ru", "en"],
      required: true,
      default: "ru",
    },
    external_id: {
      type: Number,
    },
  },
  {
    minimize: false,
  }
);

module.exports = mongoose.model("Shop", ShopSchema);
