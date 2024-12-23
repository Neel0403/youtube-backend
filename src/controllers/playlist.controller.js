import { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name) {
        throw new ApiError(404, "Playlist name cannot be empty")
    }

    const newPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if (!newPlaylist) {
        throw new ApiError(400, "Error occured while creating playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, newPlaylist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id")
    }

    const playlist = await Playlist.find({ owner: userId })

    if (!playlist) {
        throw new ApiError(404, "User does not have any playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "User playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id")
    }

    const playlist = await Playlist.findOne({ _id: playlistId })

    if (!playlist) {
        throw new ApiError(404, "User does not have any playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "Invalid Playlist Id")
    }

    if (!videoId) {
        throw new ApiError(400, "Invalid Video Id")
    }

    const isAdded = await Playlist.findOne({ _id: playlistId, videos: videoId })
    if (isAdded) {
        throw new ApiError(400, "Video is already added in the playlist")
    }

    const video = await Playlist.findByIdAndUpdate(
        playlistId,
        { $push: { videos: videoId } },
        { new: true }
    ).populate("videos")

    if (!video) {
        throw new ApiError(400, "Video could not be added to the playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video added to the playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "Invalid Playlist Id")
    }

    if (!videoId) {
        throw new ApiError(400, "Invalid Video Id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const video = await Playlist.updateOne(
        { _id: playlistId },
        { $pull: { videos: videoId } },
    )

    if (video.modifiedCount === 0) {
        throw new ApiError(400, "Video could not be removed from the playlist")
    }

    const updatedPlaylist = await Playlist.findById(playlistId)

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video removed from the playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id")
    }

    const deletedPlaylist = await Playlist.deleteOne({ _id: playlistId })

    if (!deletedPlaylist) {
        throw new ApiError(400, "Playlist could not be deleted due to some error")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletePlaylist, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id")
    }

    if (!(name || description)) {
        throw new ApiError(404, "Provide content that you want to update")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: { name, description }
        },
        { new: true }
    )

    if (!updatedPlaylist) {
        throw new ApiError(400, "Playlist could not be updated due to some error")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist is updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
