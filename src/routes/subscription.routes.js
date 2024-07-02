import express, { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getSubscribedChannels, getUserChannelSubscribers } from "../controllers/subscription.controller.js"

const router = Router()

router.use(verifyJWT)
router.get("/get-channel-subscribers", getUserChannelSubscribers)
router.get("/get-channels-subscribed", getSubscribedChannels)

export default router;