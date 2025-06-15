const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLODINARY_API_SECRET,
});

const uploadPhoto = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Yüklenmiş resim bulunamadı!" });
    }

    // Convert buffer to base64
    const base64String = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder: "profile_images",
    });

    return res.status(200).json({
      message: "Upload successful",
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Upload failed", error });
  }
};

module.exports = {
  uploadPhoto,
};
