import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Tweet cannot be empty");
  }

  const newTweet = await Tweet.create({
    content: content,
    owner: req.user?._id, // req.user is populated by the auth middleware during authentication
  });

  if (!newTweet) {
    throw new ApiError(400, "Error ocurred while creating the tweet");
  }

  res.status(200),
    json(new ApiResponse(200, newTweet, "Tweet created successfully"));
});

const getTweet = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User id not provided");
  }

  const userTweets = await Tweet.find({ owner: userId });

  if (!userTweets) {
    throw new ApiError(400, "User has no tweets");
  }

  res
    .status(200)
    .json(new ApiResponse(200, userTweets, "Tweets retrieved successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet not found");
  }

  if (!content) {
    throw new ApiError(400, "Content is not found");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: { content },
    },
    { new: true } // returns the modified document
  );

  if (!updatedTweet) {
    throw new ApiError(400, "Tweet could not be updated");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully!!"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet not found");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId, { new: true });

  if (!deletedTweet) {
    throw new ApiError(400, "Tweet could not be deleted");
  }

  res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet Deleted Successfully"));
});

export { createTweet, getTweet, updateTweet, deleteTweet };
