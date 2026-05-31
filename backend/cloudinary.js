const cloudinaryLib = require("cloudinary");

console.log("Cloudinary version loaded");

cloudinaryLib.v2.config({

    cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

    api_key:
    process.env.CLOUDINARY_API_KEY,

    api_secret:
    process.env.CLOUDINARY_API_SECRET

});

console.log(
    "Cloud name:",
    process.env.CLOUDINARY_CLOUD_NAME
);

console.log(
    "Uploader exists:",
    !!cloudinaryLib.v2.uploader
);

module.exports = cloudinaryLib.v2;