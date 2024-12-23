import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getAllVideos, getVideoById, publishAVideo, updateVideo } from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1
        },
    ]),
    publishAVideo
)

router.route("/get-video/:videoId").get(getVideoById)
router.route("/get-all-videos/:userId").get(getAllVideos)
router.route("/update-video/:videoId").patch(upload.single("thumbnail"), updateVideo)

export default router