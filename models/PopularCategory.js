const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;

var PopularCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      slug: 'name',
			permanent: true,
			unique: false
    },
    order: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
      },
    active: {
      type: Boolean,
      default: true,
    },
    lang: {
      type: String,
      enum: ["uz", "ru", "en"],
      required: true,
      default: "ru",
		},
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
    },
  },
  {
    minimize: false,
  }
);

module.exports = mongoose.model("PopularCategory", PopularCategorySchema);
