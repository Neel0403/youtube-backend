import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../../../chai-backend/src/utils/asyncHandler.js";
import { ApiError } from "../../../chai-backend/src/utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel Id")
    }

    if (!req.user?._id) {
        throw new ApiError(400, "Invalid User")
    }

    const subscriberId = req.user?._id

    // check for existing subscription
    const isSubscribed = await Subscription.findOne({ subscriber: subscriberId })

    let subscriptionStatus
    let newSubscriber
    if (!isSubscribed) {
        // create new subscription 
        newSubscriber = await Subscription.create({
            subscriber: subscriberId,
            channel: channelId
        })

        subscriptionStatus = true
    } else {
        // delete exisitng subscription i.e. unsubscribe
        await Subscription.findOneAndDelete({ _id: isSubscribed._id, channel: channelId })
        subscriptionStatus = false
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { newSubscriber, subscriptionStatus }, "Subscription toggled successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel Id")
    }

    const channelSubscribers = await Subscription.aggregate(
        [
            { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
            {
                $group: {
                    _id: "$channel",
                    totalSubscribers: { $sum: 1 },
                    subscribers: { $push: "$subscriber" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscribers",
                    foreignField: "_id",
                    as: "subscribedBy"
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSubscribers: 1,
                    subscribedBy: 1
                }
            }
        ]
    )

    if (!channelSubscribers || channelSubscribers.length === 0) {
        throw new ApiError(404, "No subscribers found for this channel");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channelSubscribers[0], "Channel subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber Id")
    }

    const channelsSubscribed = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedTo"
            }
        },
        {
            $unwind: "$subscribedTo"
        },
        {
            $project: {
                _id: 0,
                channelId: "$channel",
                subscribedTo: 1
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, channelsSubscribed, "Channels subscribed by the user fetched successfully"))
})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }