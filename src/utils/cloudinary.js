import { v2 as cloudinary } from "cloudinary"
import fs from "fs"  // file system(default library in node)
import dotenv from "dotenv"

dotenv.config()


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file is uploaded
        console.log("File is uploaded on cloudinary", response.url);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        } else {
            console.warn("File does not exist, unable to delete:", localFilePath);
        }
        return response
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)  // remove locally saved temp file as upload operation failed
        }
        return null;
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("Deleted from cloudinary. Public Id: ", publicId);
    } catch (error) {
        console.log("Error deleting from cloudinary", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }

// import cloudinary from 'cloudinary';
// import { ApiError } from "./ApiError.js"

// cloudinary.config({
//     cloud_name: "neel04",
//     api_key: 281376757785878,
//     api_secret: "BmuxyZHXLhT3PpDsAnN5NHPzoqI",
// });

// export const uploadOnCloudinary = async (filePath) => {
//     try {
//         const result = await cloudinary.v2.uploader.upload(filePath, {
//             folder: 'avatars',
//         });
//         return result;
//     } catch (error) {
//         console.error('Cloudinary upload error:', error);
//         throw new ApiError(500, 'Cloudinary upload failed');
//     }
// };
