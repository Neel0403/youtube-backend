import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!(title || description)) {
    throw new ApiError(400, "Title and description is required");
  }

  const videoLocalFilePath = req.files['videoFile'] ? req.files['videoFile'][0].path : null;
  const thumbnailLocalFilePath = req.files['thumbnail'] ? req.files['thumbnail'][0].path : null;
  // const thumbnailLocalFilePath = req.files?.thumbnail[0].path;

  if (!(videoLocalFilePath && thumbnailLocalFilePath)) {
    throw new ApiError(400, "Video file and thumbnail file is required");
  }

  const responseVideoFile = await uploadOnCloudinary(videoLocalFilePath);
  const responseThumbnailFile = await uploadOnCloudinary(thumbnailLocalFilePath);

  if (!(responseVideoFile && responseThumbnailFile)) {
    throw new ApiError(500, "Failed to upload files on cloudinary");
  }

  const createVideo = await Video.create({
    videoFile: responseVideoFile.url,
    thumbnail: responseThumbnailFile.url,
    title: title,
    description: description,
    duration: responseVideoFile.duration,
    owner: new mongoose.Types.ObjectId(req.user?._id),
  });

  const newVideo = await Video.findById(createVideo._id);

  if (!newVideo) {
    throw new ApiError(500, "Error occured while publishing the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const getVideo = await Video.findById(videoId);

  if (!getVideo) {
    throw new ApiError(404, "Video not found");
  }

  // aggregate query to fetch like count, update view count by 1, details of owner
  const videoDetails = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails"
      }
    },
    {
      $unwind: {
        path: "$ownerDetails",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        likeCount: {
          $size: {
            $ifNull: ["$likesDetails", []]
          }
        }
      }
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        view: 1,
        isPublished: 1,
        owner: {
          _id: "$ownerDetails._id",
          username: "$ownerDetails.username",
        },
        likeCount: 1
      }
    }
  ])

  if (!videoDetails) {
    throw new ApiError(400, "Error occured while fetching video details");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoDetails, "Video fetched successfully"))
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { userId } = req.params

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User Id");
  }

  const videos = await Video.find({ owner: userId })

  if (!videos || videos.length === 0) {
    throw new ApiError(404, "No Videos found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const fieldsToUpdate = {};    // the fields to be modified will be added in this object

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  if (title) {
    fieldsToUpdate.title = title
  }

  if (description) {
    fieldsToUpdate.description = description
  }

  if (req.file) {
    const thumbnailLocalFilePath = req.file.path
    const response = await uploadOnCloudinary(thumbnailLocalFilePath);

    if (!response || !response.url) {
      throw new ApiError(400, "Error occured while uploading the file to cloudinary")
    }

    fieldsToUpdate.thumbnail = response.url;
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: fieldsToUpdate,
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(400, "Error while updating the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

export { publishAVideo, getVideoById, getAllVideos, updateVideo };
