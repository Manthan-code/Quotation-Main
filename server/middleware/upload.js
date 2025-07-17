const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pictures",       // Folder name in Cloudinary
    allowed_formats: ["jpg", "png"],
    transformation: [{ width: 300, height: 300, crop: "limit" }],
  },
});

const upload = multer({ storage });

module.exports = upload;
