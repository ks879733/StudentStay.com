const authMidlleware = require("../middleware/auth");
const express = require("express");
const ownerMiddleware = require("../middleware/lodgeOwner");
const lodge = require("../models/lodge");
const propertyUpload = require("../middleware/propertyUpload.");
const cloudinary = require("../config/cloudinory");
const Room = require("../models/Room");

const router = express.Router();

const parseJsonField = (value, fieldName, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    const error = new Error(`${fieldName} must be valid JSON`);
    error.statusCode = 400;
    throw error;
  }
};

router.post("/property-owner", authMidlleware, ownerMiddleware, propertyUpload.array("images", 1), async (req, res) => {

  try {
    const {
      name,
      type,
      description,
      contactPhone,
    } = req.body

    let address;
    let amenities;
    let rules;

    try {
      address = parseJsonField(req.body.address, "address", null);
      amenities = parseJsonField(req.body.amenities, "amenities", []);
      rules = parseJsonField(req.body.rules, "rules", []);
    } catch (parseError) {
      return res.status(parseError.statusCode || 400).json({
        success: false,
        message: parseError.message,
      });
    }

    if (!name || !type || !address || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: "Name, type, address and contact phone are required"
      });
    }

    if (typeof address !== "object" || Array.isArray(address)) {
      return res.status(400).json({
        success: false,
        message: "Address must be an object with street, city, state and pincode"
      });
    }

    if (!Array.isArray(amenities) || !Array.isArray(rules)) {
      return res.status(400).json({
        success: false,
        message: "Amenities and rules must be JSON arrays"
      });
    }

    if (![...amenities, ...rules].every((value) => typeof value === "string")) {
      return res.status(400).json({
        success: false,
        message: "Each amenity and rule must be text"
      });
    }

    const {
      street,
      area,
      city,
      state,
      pincode,
      country,
    } = address || {};

    if (![street, city, state, pincode].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({
         success: false,
         message: "Street, city, state and pincode are required",
     });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one property image is required"
     });
    }
    const images = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));
    const newLodge = new lodge({
      owner: req.user.userId,
      name,
      type,
      description: description || "",
      address: {
        street: street.trim(),
        area: area?.trim() || "",
        city: city.trim(),
        state: state.trim(),
        pincode: String(pincode).trim(),
        country: country?.trim() || "India",
      },
      contactPhone: String(contactPhone).trim(),
      amenities: amenities || [],
      images,
      rules: rules || [],
      status: "pending",
    });
     await newLodge.save();
    res.status(201).json({
      success: true,
      message: "Propertie created successfully",
      property: newLodge,
    })
  } catch (error) {
    console.error("Create Property Error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to create property",
      });
  }
});

router.get("/my-properties", authMidlleware, ownerMiddleware, async (req, res) => {
  try {
    
    const properties = await lodge.find({
      owner: req.user.userId,
    }).populate("owner", "name email phone").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    })
  } catch (error) {
    console.error("Get My Properties Error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch properties",
      });
  }
});

router.get("/my-property/approved", authMidlleware, ownerMiddleware, async (req, res) => {
  try {
    const properties = await lodge.find({owner: req.user.userId, status: "approved"}).populate("owner", "name email phone");
  if(properties.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Approved properties not available"
    })
  }
  res.status(200).json({
    success: true,
    countProperties: properties.length,
    Aprroved_Properties: properties
  })
  } catch (error) {
    console.error("Get properties error", error)
    res.status(404).json({
      message: "Get properties failed"
    })
  }
  
})

router.get("/my-property/rejected", authMidlleware, ownerMiddleware, async (req, res) => {
  try {
    const properties = await lodge.find({owner: req.user.userId, status: "rejected"}).populate("owner", "name email phone");
  if(properties.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Rejected properties not available"
    })
  }
  res.status(200).json({
    success: true,
    countProperties: properties.length,
    Rejected_Properties: properties
  })
  } catch (error) {
    console.log("Get rejected properties error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch reject properties"
      });
  }
  
})

// ye API maine address wagera ya text formaate wale data ko update karne ke liye banaya
router.patch("/update-lodge/:lodgeId", authMidlleware, ownerMiddleware, async (req, res) => {

  try {
    const lodgeId = req.params.lodgeId;
  const ownerId = req.user.userId;
  
  const newLodge = await lodge.findOne({_id: lodgeId, owner: ownerId});
  if(!newLodge) {
    return res.status(403).json({
      success: false,
      message: "Lodge not found and You are not OWNER of this lodge"
    });
  }

  const {
    name,
    type,
    description,
    address,
    contactPhone,
    amenities,
    rules,
      } = req.body;

  if(name !== undefined) {
    newLodge.name = name
  }
  if(type !== undefined) {
    newLodge.type = type
  }
  if(description !== undefined) {
    newLodge.description = description
  }
  if (contactPhone !== undefined) {
        newLodge.contactPhone = String(contactPhone).trim();
  }
  if (amenities !== undefined) {
        newLodge.amenities = amenities;
  }
  if (rules !== undefined) {
        newLodge.rules = rules;
  }

  if(address !== undefined) {
    if (address.street !== undefined) {
          newLodge.address.street = address.street.trim();
    }
    if (address.area !== undefined) {
          newLodge.address.area = address.area?.trim() || "";
    }
    if (address.city !== undefined) {
          newLodge.address.city = address.city.trim();
     }

    if (address.state !== undefined) {
      newLodge.address.state = address.state.trim();
    }

    if (address.pincode !== undefined) {
      newLodge.address.pincode = String(address.pincode).trim();
    }

    if (address.country !== undefined) {
      newLodge.address.country =
        address.country?.trim() || "India";
    }
  }

  await newLodge.save();

  res.status(200).json({
    success: true,
    message: "Loadge details updated successfully",
    newLodge: newLodge,
  })
  } catch (error) {
    console.error("Update Lodge Error:", error);

      res.status(500).json({
      success: false,
      message: "Failed to update lodge",
    });
  }
});

// ye API Mai koi image perticular image delete karne ke liye banaunga
router.delete("/lodge/:lodgeId/image/:public_id", authMidlleware, ownerMiddleware, async (req, res) => {

  try {
    const { lodgeId, public_id } = req.params;

  const properties = await lodge.findOne({_id: lodgeId, owner: req.user.userId});
  if(!properties) {
    return res.status(404).json({
      success: false,
      message: "Lodge not found"
    });
  }

  const image = properties.images.find((img) => img.public_id === public_id);
  if(!image) {
    return res.status(404).json({
      message: "Image not found"
    });
  }
  // clodinory se image delete ho gaya 
  await cloudinary.uploader.destroy(image.public_id);
  // ab databse se vi delete karege
  properties.images = properties.images.filter((img) => img.public_id !== public_id);

  await properties.save();

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    images: properties.images
  });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete image"
    });
  }
  
})

//ye API kisi perticular image ko update karne ke liye
router.patch("/lodge/:lodgeId/image/:publicId", authMidlleware, ownerMiddleware,propertyUpload.single("images", 1) ,async (req, res) => {
  try {
    const { lodgeId,  publicId} = req.params
    const properties = await lodge.findOne({_id: lodgeId, owner: req.user.userId});
    if(!properties) {
      return res.status(404).json({
        success: false,
        message: "Lodge not found"
      });
    }

    const indexImg = properties.images.findIndex((idx) => idx.public_id === publicId);
    if(indexImg === -1) {
      return res.status(403).json({
        success: false,
        message: "Image not found"
      });
    }
    if (!req.file || req.file.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one property image  is required"
     });
    }
    // remove from cloudinary
    await cloudinary.uploader.destroy(publicId);

    // ab jis inedx se image delete kiye hai waha pe new image upload karne ke liye
    properties.images[indexImg] = ({
      url: req.file.path,
      public_id:  req.file.filename
    });

    await properties.save();
    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      images: properties.images
    })
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete image"
    });
  } 

});


// ye API pura lodge ko delete karne wala hai
router.delete("/delete-property/:lodgeId", authMidlleware, ownerMiddleware, async (req, res) => {
  try {
    const lodgeId = req.params.lodgeId;
    const ownerId = req.user.userId
    
    const property = await lodge.findOne({_id: lodgeId, owner: ownerId});

    if(!property) {
      return res.status(404).json({
        success: false,
        message: "Can't delete property you are not owner or this property!"
      })
    }

    if(property.images && property.images.length > 0) {
      for (const image of property.images) {
        if(image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
    }

    await lodge.findByIdAndDelete(lodgeId);
    res.status(200).json({
      success: true,
      message: "Lodge deleted successfully",
    })
  } catch (error) {
      console.error("Delete Property Error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete property",
      }); 
  }

  
})


// Yaha se ab Room Create karenge

router.post("/properties/:lodgeId/rooms", authMidlleware, ownerMiddleware, propertyUpload.array("roomImage", 6),async (req, res) => {

  try {
    const lodgeId = req.params.lodgeId;
  const { roomNumber,
        roomType,
        capacity,
        beds,
        rentPerMonth,
        sharingType,
        amenities } = req.body;

  const property = await lodge.findOne({_id: lodgeId, owner: req.user.userId});
  if(!property) {
    return res.status(400).json({
      success: false,
      message: "Can't create room Because you are not the Owner of this property"
    })
  }
  if(property.status !== "approved") {
    return res.status(400).json({
      success: false,
      message: "your property is not approved "
    });
  }

  if(!roomNumber || !capacity || rentPerMonth === undefined) {
    return res.status(400).json({
      succes: false,
      message: "RoomNumber, capacity, rentPerMonth require"
    })
  }
  const images = req.files?.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));
  const room = new Room({
    lodge: property._id,
    roomNumber: roomNumber.trim(),
    roomType: roomType || "single",
    capacity,
    beds: beds || 1,
    rentPerMonth,
    sharingType: sharingType || "single",
    amenities: amenities || [],
    roomImage: images
  });

  await room.save();
  res.status(201).json({
        success: true,
        message: "Room added successfully",
        room: room
      });
  } catch (error) {
    console.error("Room creation error", error);
    res.status(400).json({
      success: false,
      message: "Room creation faild"
    })
  }
  
});

router.patch(
  "/properties/:lodgeId/room/:roomId/image/:publicId",
  authMidlleware,
  ownerMiddleware,
  propertyUpload.single("roomImage"),
  async (req, res) => {
    try {
      const { lodgeId, roomId, publicId } = req.params;
      const properties = await lodge.findOne({
        _id: lodgeId,
        owner: req.user.userId
      });

      if (!properties) {
        return res.status(403).json({
          success: false,
          message: "You are not the owner of this property"
        });
      }

     
      const room = await Room.findOne({
        _id: roomId,
        lodge: lodgeId
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found"
        });
      }
        
      const indexImg = room.roomImage.findIndex(
        (img) => img.public_id === publicId
      );

      if (indexImg === -1) {
        return res.status(404).json({
          success: false,
          message: "Room image not found"
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "New image required"
        });
      }

      
      await cloudinary.uploader.destroy(publicId);
      room.roomImage[indexImg] = {
        url: req.file.path,
        public_id: req.file.filename
      };
      await room.save();

      res.status(200).json({
        success: true,
        message: "Room image updated successfully",
        images: room.roomImage
      });

    } catch (error) {
      console.error("Room image update error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update room image"
      });
    }
  }
);

//lodge ka sara room dikhane ke liye
router.get(
  "/property-owner/lodges/:lodgeId/rooms",
  authMidlleware,
  ownerMiddleware,
  async (req, res) => {
    try {
      const { lodgeId } = req.params;

      const property = await lodge.findOne({
        _id: lodgeId,
        owner: req.user.userId
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found"
        });
      }

      const rooms = await Room.find({
        lodge: lodgeId
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: rooms.length,
        property: property,
        rooms
      });

    } catch (error) {
      console.error("Get property rooms error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to get rooms"
      });
    }
  }
);
//
router.get("/owner/bookings", authMidlleware, ownerMiddleware, async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const bookings = await Booking.find({
      bookingStatus: "confirmed"
    })
      .populate("user", "name email phone")
      .populate("lodge", "name")
      .populate("room", "roomNumber roomType sharingType rentPerMonth")
      .populate({
        path: "lodge",
        match: { owner: ownerId },
        select: "name owner"
      })
      .sort({ createdAt: -1 });

    // Sirf owner ke lodge ki bookings
    const ownerBookings = bookings.filter(
      booking => booking.lodge !== null
    );

    res.status(200).json({
      success: true,
      count: ownerBookings.length,
      bookings: ownerBookings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get bookings",
      error: error.message
    });
  }
});
// Avi Delete room API baaki hai
// Edit Room details API

module.exports = router;
