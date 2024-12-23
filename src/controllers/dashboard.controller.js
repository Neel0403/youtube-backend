import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel Id")
    }

    // total video views of the channel
    const videoViews = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$view" } } },
        { $project: { _id: 0, totalViews: 1 } }
    ])

    const totalViews = videoViews.length > 0 ? videoViews[0].totalViews : 0

    // total subscribers of the channel
    const subscribers = await Subscription.countDocuments({ channel: channelId }).exec()

    // total videos of the channel
    const videos = await Video.countDocuments({ channel: channelId }).exec()

    const totalLikes = await Like.aggregate(
        [
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "allVideos",
                }
            },
            { $unwind: "$allVideos" },
            { $match: { "allVideos.owner": new mongoose.Types.ObjectId(channelId) } },
            { $group: { _id: null, totalVideosLikes: { $sum: 1 } } },
            { $project: { _id: 0, totalVideosLikes: 1 } },
        ]
    )

    const totalVideosLikes = totalLikes[0];

    const channelStats = [
        { totalSubscribers: subscribers },
        { totalVideos: videos },
        totalViews,
        totalVideosLikes
    ]

    return res
        .status(200)
        .json(new ApiResponse(200, { channelStats }, "Channel Stats fetched successfully"))
})

export {
    getChannelStats,
}