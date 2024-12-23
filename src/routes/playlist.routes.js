import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js"

const router = express.Router()

router.use(verifyJWT)

router.route("/create-playlist").post(createPlaylist)
router.route("/update-playlist/:playlistId").patch(updatePlaylist)
router.route("/delete-playlist/:playlistId").delete(deletePlaylist)
router.route("/get-user-playlists/:userId").get(getUserPlaylists)
router.route("/get-playlist/:playlistId").get(getPlaylistById)
router.route("/add-video-to-playlist/:playlistId/:videoId").post(addVideoToPlaylist)
router.route("/remove-video-from-playlist/:playlistId/:videoId").delete(removeVideoFromPlaylist)

export default router