import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const newComment = await Comment.create({
    content: content,
    video: new mongoose.Types.ObjectId(videoId),
    owner: req.user?._id,
  });

  if (!newComment) {
    throw new ApiError(400, "Error while creating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment created successfully"));
});

const getAllCommentsOnVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id")
  }

  const comments = await Comment.find({ video: videoId })

  if (!comments || comments.length === 0) {
    throw new ApiError(404, "No Comments found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

// all the comments of a particular user
const getUserComments = asyncHandler(async (req, res) => {
  const { userId } = req.params

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User Id")
  }

  const comments = await Comment.find({ owner: userId })

  if (!comments || comments.length === 0) {
    throw new ApiError(404, "No Comments found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  if (!commentId.trim() || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (!(comment.owner.toString() === req.user?._id.toString())) {
    throw new ApiError(401, "Unauthorised user");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );
  if (!updatedComment) {
    throw new ApiError(400, "Error while updating the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId.trim() || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment id");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  await Like.deleteMany({
    comment: new mongoose.Types.ObjectId(commentId),
  });

  if (!deletedComment) {
    throw new ApiError(400, "Error occured while deleting the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully"));
});

export { addComment, getAllCommentsOnVideo, getUserComments, updateComment, deleteComment };
