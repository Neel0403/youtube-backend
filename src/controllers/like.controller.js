import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const islikedAlready = await Like.find({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (islikedAlready.length == 0) {
    const like = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, like, "You liked the video"));
  } else {
    // Like.findByIdAndDelete(isLikedAlready[0]._id)
    await Like.findOneAndDelete({
      video: videoId,
      likedBy: req.user?._id,
    });

    return res.status(200).json(new ApiResponse(200, "You unliked the video"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const islikedAlready = await Like.find({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (islikedAlready.length == 0) {
    const like = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, like, "You liked the comment"));
  } else {
    // Like.findByIdAndDelete(isLikedAlready[0]._id)
    await Like.findOneAndDelete({
      comment: commentId,
      likedBy: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "You unliked the comment"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet id");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const isLikedAlready = await Like.find({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (isLikedAlready.length == 0) {
    const like = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, like, "You liked the tweet"));
  } else {
    // Like.findByIdAndDelete(isLikedAlready[0]._id);
    await Like.findOneAndDelete({
      tweet: tweetId,
      likedBy: req.user?._id,
    });

    return res.status(200).json(new ApiResponse(200, "You unliked the tweet"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User Id");
  }

  const likedVideos = await Like.find({ likedBy: userId, video: { $ne: null } }) // returns records where video field is not null 

  if (!likedVideos || likedVideos.length === 0) {
    throw new ApiError(404, "User has not liked any video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked Videos fetched successfully"))
})

export { toggleVideoLike, getLikedVideos, toggleCommentLike, toggleTweetLike };
