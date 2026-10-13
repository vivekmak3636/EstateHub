
const Property = require("../models/Property");

/* =====================================================
   HELPER FUNCTIONS
===================================================== */
const cleanImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) {
    return "";
  }

  const value = image.trim();

  // Extract URL from Markdown-style links
  const markdownMatch = value.match(
    /\]\((https?:\/\/[^)\s]+)\)/
  );

  if (markdownMatch) {
    return markdownMatch[1].replace(/\\+$/, "");
  }

  // Extract a direct URL
  const urlMatch = value.match(
    /https?:\/\/[^\s\]"')]+/
  );

  return urlMatch ? urlMatch[0].replace(/\\+$/, "") : "";
};

const cleanImages = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => cleanImageUrl(image))
    .filter(Boolean);
};


/* =====================================================
   CREATE PROPERTY
===================================================== */

const createProperty = async (req, res) => {
  try {
    const propertyData = {
      ...req.body,

      owner: req.user._id,

      // Every new property requires admin approval
      status: "pending",
    };

    // Clean image URLs
    if (req.body.images) {
      propertyData.images = cleanImages(
        req.body.images
      );
    }

    // Support both:
    // propertyType
    // and old frontend field "type"

    if (
      !propertyData.propertyType &&
      propertyData.type
    ) {
      propertyData.propertyType =
        propertyData.type;
    }

    // Remove old field if it exists
    delete propertyData.type;

    const property =
      await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message:
        "Property submitted for approval.",
      property,
    });
  } catch (error) {
    console.error(
      "Create property error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   GET ALL APPROVED PROPERTIES
===================================================== */

const getProperties = async (req, res) => {
  try {
    const {
      city,
      purpose,
      propertyType,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      minArea,
      maxArea,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    /* -----------------------------------------------
       BASE FILTER
    ------------------------------------------------ */

    const filter = {
      status: "approved",
    };


    /* -----------------------------------------------
       CITY FILTER
    ------------------------------------------------ */

    if (city) {
      filter["location.city"] =
        new RegExp(city.trim(), "i");
    }


    /* -----------------------------------------------
       PURPOSE FILTER
    ------------------------------------------------ */

    if (purpose) {
      filter.purpose = purpose.toLowerCase();
    }


    /* -----------------------------------------------
       PROPERTY TYPE FILTER
    ------------------------------------------------ */

    const selectedPropertyType =
      propertyType || type;

    if (selectedPropertyType) {
      filter.propertyType =
        selectedPropertyType.toLowerCase();
    }


    /* -----------------------------------------------
       BEDROOM FILTER
    ------------------------------------------------ */

    if (bedrooms) {
      filter.bedrooms = Number(bedrooms);
    }


    /* -----------------------------------------------
       PRICE FILTER
    ------------------------------------------------ */

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte =
          Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte =
          Number(maxPrice);
      }
    }


    /* -----------------------------------------------
       AREA FILTER
    ------------------------------------------------ */

    if (minArea || maxArea) {
      filter.area = {};

      if (minArea) {
        filter.area.$gte =
          Number(minArea);
      }

      if (maxArea) {
        filter.area.$lte =
          Number(maxArea);
      }
    }


    /* -----------------------------------------------
       SEARCH FILTER
    ------------------------------------------------ */

    if (search && search.trim()) {
      const searchText =
        search.trim();

      filter.$or = [
        {
          title: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          description: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          "location.city": {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          "location.state": {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          propertyType: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }


    /* -----------------------------------------------
       PAGINATION
    ------------------------------------------------ */

    const currentPage =
      Math.max(Number(page) || 1, 1);

    const perPage =
      Math.min(
        Math.max(Number(limit) || 12, 1),
        100
      );

    const skip =
      (currentPage - 1) *
      perPage;


    /* -----------------------------------------------
       FETCH PROPERTIES
    ------------------------------------------------ */

    const properties =
      await Property.find(filter)
        .populate(
          "owner",
          "name email phone profileImage role"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(perPage);


    /* -----------------------------------------------
       TOTAL
    ------------------------------------------------ */

    const total =
      await Property.countDocuments(
        filter
      );


    /* -----------------------------------------------
       CLEAN IMAGES
    ------------------------------------------------ */

    const cleanedProperties =
      properties.map((property) => {
        const propertyObject =
          property.toObject();

        propertyObject.images =
          cleanImages(
            propertyObject.images
          );

        return propertyObject;
      });


    /* -----------------------------------------------
       RESPONSE
    ------------------------------------------------ */

    res.json({
      success: true,

      count:
        cleanedProperties.length,

      total,

      page: currentPage,

      pages:
        Math.ceil(
          total / perPage
        ),

      properties:
        cleanedProperties,
    });
  } catch (error) {
    console.error(
      "Get properties error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   GET SINGLE PROPERTY
===================================================== */

const getPropertyById = async (
  req,
  res
) => {
  try {
    const property =
      await Property.findById(
        req.params.id
      ).populate(
        "owner",
        "name email phone profileImage role"
      );


    /* -----------------------------------------------
       PROPERTY NOT FOUND
    ------------------------------------------------ */

    if (!property) {
      return res.status(404).json({
        success: false,
        message:
          "Property not found.",
      });
    }


    /* -----------------------------------------------
       ONLY APPROVED PROPERTY PUBLIC
    ------------------------------------------------ */

    if (
      property.status !==
      "approved"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Property not available.",
      });
    }


    /* -----------------------------------------------
       INCREMENT VIEWS
    ------------------------------------------------ */

    property.views =
      (property.views || 0) + 1;

    await property.save();


    /* -----------------------------------------------
       CLEAN RESPONSE
    ------------------------------------------------ */

    const propertyObject =
      property.toObject();

    propertyObject.images =
      cleanImages(
        propertyObject.images
      );


    /* -----------------------------------------------
       RESPONSE
    ------------------------------------------------ */

    res.json({
      success: true,
      property:
        propertyObject,
    });
  } catch (error) {
    console.error(
      "Get property by ID error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   GET MY PROPERTIES
===================================================== */

const getMyProperties = async (
  req,
  res
) => {
  try {
    const properties =
      await Property.find({
        owner: req.user._id,
      })
        .populate(
          "owner",
          "name email phone profileImage role"
        )
        .sort({
          createdAt: -1,
        });


    /* -----------------------------------------------
       CLEAN IMAGES
    ------------------------------------------------ */

    const cleanedProperties =
      properties.map((property) => {
        const propertyObject =
          property.toObject();

        propertyObject.images =
          cleanImages(
            propertyObject.images
          );

        return propertyObject;
      });


    res.json({
      success: true,

      count:
        cleanedProperties.length,

      properties:
        cleanedProperties,
    });
  } catch (error) {
    console.error(
      "Get my properties error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   UPDATE PROPERTY
===================================================== */

const updateProperty = async (
  req,
  res
) => {
  try {
    const property =
      await Property.findById(
        req.params.id
      );


    /* -----------------------------------------------
       NOT FOUND
    ------------------------------------------------ */

    if (!property) {
      return res.status(404).json({
        success: false,
        message:
          "Property not found.",
      });
    }


    /* -----------------------------------------------
       AUTHORIZATION
    ------------------------------------------------ */

    const isOwner =
      property.owner.toString() ===
      req.user._id.toString();

    const isAdmin =
      req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Not authorized.",
      });
    }


    /* -----------------------------------------------
       PREPARE UPDATE DATA
    ------------------------------------------------ */

    const updateData = {
      ...req.body,
    };


    /* -----------------------------------------------
       SUPPORT OLD "type" FIELD
    ------------------------------------------------ */

    if (
      !updateData.propertyType &&
      updateData.type
    ) {
      updateData.propertyType =
        updateData.type;
    }

    delete updateData.type;


    /* -----------------------------------------------
       CLEAN IMAGES
    ------------------------------------------------ */

    if (updateData.images) {
      updateData.images =
        cleanImages(
          updateData.images
        );
    }


    /* -----------------------------------------------
       PREVENT USER FROM CHANGING OWNER
    ------------------------------------------------ */

    delete updateData.owner;


    /* -----------------------------------------------
       STATUS RULE
    ------------------------------------------------ */

    if (isAdmin) {
      // Admin can change status if provided
      if (updateData.status) {
        property.status =
          updateData.status;
      }
    } else {
      // Owner/Agent edit requires approval again
      property.status = "pending";

      // Prevent owner/agent from manually
      // setting approved/rejected
      delete updateData.status;
      delete updateData.rejectionReason;
    }


    /* -----------------------------------------------
       APPLY UPDATE
    ------------------------------------------------ */

    Object.assign(
      property,
      updateData
    );


    await property.save();


    /* -----------------------------------------------
       RESPONSE
    ------------------------------------------------ */

    res.json({
      success: true,

      message:
        isAdmin
          ? "Property updated successfully."
          : "Property updated and submitted for approval.",

      property,
    });
  } catch (error) {
    console.error(
      "Update property error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   DELETE PROPERTY
===================================================== */

const deleteProperty = async (
  req,
  res
) => {
  try {
    const property =
      await Property.findById(
        req.params.id
      );


    /* -----------------------------------------------
       NOT FOUND
    ------------------------------------------------ */

    if (!property) {
      return res.status(404).json({
        success: false,
        message:
          "Property not found.",
      });
    }


    /* -----------------------------------------------
       AUTHORIZATION
    ------------------------------------------------ */

    const isOwner =
      property.owner.toString() ===
      req.user._id.toString();

    const isAdmin =
      req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Not authorized.",
      });
    }


    /* -----------------------------------------------
       DELETE
    ------------------------------------------------ */

    await property.deleteOne();


    res.json({
      success: true,

      message:
        "Property deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete property error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
};
