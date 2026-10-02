const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinory");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "lodges",
    allowed_formate:["jpeg", "jpg", "png", "webp"],
  }
});

const propertyUpload = multer({
  storage: storage,
  limits: {
    files: 6,
    fileSize: 5 * 1024 * 1024,//5mb
  }
});

module.exports = propertyUpload;

