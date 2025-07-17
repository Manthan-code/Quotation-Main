const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_dzqbxsxcf,
  api_key:    process.env.CLOUDINARY_979651186111856,
  api_secret: process.env.CLOUDINARY_T8q2g8AGw2z1HQwfwHwGDMfwgqI,
});

module.exports = cloudinary;
