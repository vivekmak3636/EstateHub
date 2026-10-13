const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["sale", "rent"],
      required: true,
    },

    propertyType: {
      type: String,
      enum: [
        "apartment",
        "house",
        "villa",
        "plot",
        "shop",
        "office",
        "warehouse",
        "commercial",
      ],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    area: {
      type: Number,
      required: true,
      min: 0,
    },

    bedrooms: {
      type: Number,
      default: 0,
    },

    bathrooms: {
      type: Number,
      default: 0,
    },

    balcony: {
      type: Number,
      default: 0,
    },

    floor: {
      type: Number,
      default: 0,
    },

    totalFloors: {
      type: Number,
      default: 0,
    },

    yearBuilt: {
      type: Number,
    },

    location: {
      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
        index: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    images: [
      {
        type: String,
      },
    ],

    amenities: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

propertySchema.index({
  title: "text",
  description: "text",
});

module.exports = mongoose.model("Property", propertySchema);