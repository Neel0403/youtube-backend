import express, { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js"

const router = Router()

router.use(verifyJWT)
router.post("/toggle-subscription/:channelId", toggleSubscription)
router.get("/get-channel-subscribers/:channelId", getUserChannelSubscribers)
router.get("/get-channels-subscribed/:subscriberId", getSubscribedChannels)

export default router;