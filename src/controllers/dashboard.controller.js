import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  // owner : user id --> fetch those videos and sum of views, and get totalvideos also
  // owner : user id --> fetch document which have channel: userId and count of that
  // fetch document have likedBy: userId count of that

  const channelVideoStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $group: {
        _id: null,
        totalVideoViews: { $sum: "$views" },
        totalVideos: { $count: {} },
      },
    },
  ]);
  console.log(channelVideoStats);

  const channelSubscriberStats = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $group: {
        _id: null,
        totalSubscribers: { $count: {} },
      },
    },
  ]);
  console.log(channelSubscriberStats);

  const channelVideosLiked = await Like.aggregate([
    {
      $match: {
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $match: {
              owner: new mongoose.Types.ObjectId(req.user._id),
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likedVideos: { $size: "$video" },
      },
    },
    {
      $project: {
        likedVideos: 1,
      },
    },
  ]);

  const channelTweetLiked = await Like.aggregate([
    {
      $match: {
        tweet: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "tweets",
        localField: "tweet",
        foreignField: "_id",
        as: "tweet",
        pipeline: [
          {
            $match: {
              owner: new mongoose.Types.ObjectId(req.user._id),
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likedTweets: { $size: "$tweet" },
      },
    },
    {
      $project: {
        likedTweets: 1,
      },
    },
  ]);

  const channelCommentLiked = await Like.aggregate([
    {
      $match: {
        comment: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "comment",
        foreignField: "_id",
        as: "comment",
        pipeline: [
          {
            $match: {
              owner: new mongoose.Types.ObjectId(req.user._id),
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likedComments: { $size: "$comment" },
      },
    },
    {
      $project: {
        likedComments: 1,
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        channelStats: {
          totalViews: channelVideoStats[0].totalVideoViews || 0,
          totalVideos: channelVideoStats[0].totalVideos || 0,
          subscribers: channelSubscriberStats[0]?.totalSubscribers || 0,
          totalLikes:
            (channelVideosLiked[0]?.likedVideos || 0) +
            (channelTweetLiked[0]?.likedTweets || 0) +
            (channelCommentLiked[0]?.likedComments || 0),
        },
      },
      "channel stats fetched successfully "
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userChannelVideos = await Video.find({ owner: req.user._id }).select(
    "-owner"
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userChannelVideos,
        "User's videos has fetched successfully"
      )
    );
});

export { getChannelStats, getChannelVideos };
