const cloudinary = require("../config/Cloudinary");
const fs = require("fs/promises");
// const fs = require("fs"); // if we use only fs then use those who are in comment.

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const uploadResult = await cloudinary.uploader.upload(filePath);
    await fs.unlink(filePath);
    // fs.unlinkSync(filePath); 
    return uploadResult.secure_url;
  } catch (error) {
    
    // try {
    //   if (filePath) fs.unlinkSync(filePath);
    // } catch {
    // // ignore cleanup error (best-effort)
    // } 
    if (filePath) {
      await fs.unlink(filePath).catch(() => {}); //File cleanup is best-effort. If cleanup fails, it should NOT break the request or hide the real error.
    }
    throw new Error("Cloudinary upload failed");
  }
};

module.exports = uploadOnCloudinary;
