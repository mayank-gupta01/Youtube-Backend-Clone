import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const existedVideo = await Video.findById(videoId);
  if (!existedVideo) {
    throw new ApiError(400, "Video not exist for given ID");
  }

  const isVideoLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (isVideoLiked) {
    //unlike the video
    await Like.findByIdAndDelete(isVideoLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, [], "Video unliked successfully"));
  }

  //like the video
  const videoLiked = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, videoLiked, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const existedComment = await Comment.findById(commentId);
  if (!existedComment) {
    throw new ApiError(400, "Comment not exist for given ID");
  }

  const isCommentLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (isCommentLiked) {
    //unlike the comment
    await Like.findByIdAndDelete(isCommentLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, [], "Comment unliked successfully"));
  }

  //like the comment
  const commentLiked = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, commentLiked, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const existedTweet = await Tweet.findById(tweetId);
  if (!existedTweet) {
    throw new ApiError(400, "Tweet not existed for given ID");
  }

  const isTweetLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (isTweetLiked) {
    //unlike the tweet
    await Like.findByIdAndDelete(isTweetLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, [], "Tweet unliked successfully"));
  }

  //like the tweet
  const tweetLiked = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, tweetLiked, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const getAllLikedVideos = await Like.aggregate([
    {
      $match: {
        video: { $exists: true },
        likedBy: new mongoose.Types.ObjectId(req.user._id),
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
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    userName: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              thumbnail: 1,
              title: 1,
              description: 1,
              duration: 1,
              views: 1,
              isPublished: 1,
              owner: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        video: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getAllLikedVideos,
        "All Liked videos are fetched successfully"
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
