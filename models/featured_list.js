const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;

FeaturedListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      slug: "title",
      permanent: true,
      uniqueGroupSlug: ["lang"],
      index: true,
    },
    products: [
      {
        type: Types.ObjectId,
        ref: "Product",
      },
    ],
    order: {
      type: Number,
    },
    properties: [
      {
        property: {
          type: Types.ObjectId,
          ref: "ProductProperty",
        },
        value: {
          type: String,
        },
      },
    ],
    active: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
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
  },
  {
    minimize: false,
  }
);

module.exports = mongoose.model("FeaturedList", FeaturedListSchema);
