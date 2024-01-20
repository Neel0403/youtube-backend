import { v2 as cloudinary } from "cloudinary"
import fs from "fs"  // file system(default library in node)


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
        fs.unlinkSync(localFilePath);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)  // remove locally saved temp file as upload operation failed
        return null;
    }
}


export { uploadOnCloudinary }