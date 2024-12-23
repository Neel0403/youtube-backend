import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getAllCommentsOnVideo,
  getUserComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);
router.route("/:videoId").post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);
router.route("/get-comments-on-video/:videoId").get(getAllCommentsOnVideo);
router.route("/get-user-comments/:userId").get(getUserComments);

export default router;

