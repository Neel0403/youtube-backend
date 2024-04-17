import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getTweet,
  updateTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-tweet").post(createTweet);
router.route("/get-tweet/:userId").get(getTweet);
router.route("/update-tweet/:tweetId").patch(updateTweet);
router.route("/delete-tweet/:tweetId").delete(deleteTweet);

export default router;
