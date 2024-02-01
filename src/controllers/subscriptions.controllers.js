import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  // valid channelId (is it exist in user)
  // check is user already subscribed
  // if user is already subscribed then unsubscribe it (remove the document from db)
  // if user not subscribed then subscribed it (create document in db)

  const user = await User.findById(channelId);

  if (!user) {
    throw new ApiError(400, "Provided channelId is not exist");
  }
  const isAlreadySubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (isAlreadySubscribed) {
    // unsubscribe the user
    await Subscription.findByIdAndDelete(isAlreadySubscribed._id);

    return res
      .status(200)
      .json(new ApiResponse(200, [], "User unsubscribed successfully"));
  }

  //subscribe the user
  const userSubscribed = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userSubscribed,
        "User Subscribed channel successfully"
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // valid channelId (is it exist in user)
  const user = await User.findById(channelId);

  if (!user) {
    throw new ApiError(400, "Provided channelId is not exist");
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
      },
    },
    {
      $addFields: {
        subscriberUsername: {
          $arrayElemAt: ["$subscriber.userName", 0],
        },
        subscriberAvatar: {
          $arrayElemAt: ["$subscriber.avatar", 0],
        },
      },
    },
    {
      $project: {
        subscriberUsername: 1,
        subscriberAvatar: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "subscriber list of channel fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  // if subscriberId does not exist (if user is not find for that subscriberId)
  // if exist then query for get channels

  const user = await User.findById(subscriberId);
  if (!user) {
    throw new ApiError(400, "User does not exist with this Id");
  }
  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $addFields: {
        channelUsername: {
          $arrayElemAt: ["$channel.userName", 0],
        },
        channelAvatar: {
          $arrayElemAt: ["$channel.avatar", 0],
        },
      },
    },
    {
      $project: {
        channelAvatar: 1,
        channelUsername: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "subscribed channel List fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
