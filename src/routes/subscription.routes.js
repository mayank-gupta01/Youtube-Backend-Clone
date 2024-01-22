import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscriptions.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:subscriberId").get(getSubscribedChannels);
router.route("/c/:channelId").post(toggleSubscription);
router.route("/u/:channelId").get(getUserChannelSubscribers);

export default router;
