import mongoose, { isValidObjectId, set } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (content.trim() === "") {
    throw new ApiError(404, "Tweet must have length greater then 0");
  }

  const createdTweet = await Tweet.create({
    owner: req.user._id,
    content: content,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, createdTweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  // get userId from params
  // check whether this user id is exist or not
  // if exist then fetch the tweets with this id

  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User doesn't exist with this user Id");
  }

  const userTweets = await Tweet.find({
    owner: userId,
  }).select("-owner");

  return res
    .status(200)
    .json(
      new ApiResponse(200, userTweets, "User tweets fetched successfully.")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Given tweet id is not exist");
  }
  if (content.trim() === "") {
    throw new ApiError(400, "tweet length must be grater then 0");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedTweet, "User tweet updated successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Given tweet id is not exist");
  }

  await Tweet.deleteOne({ _id: tweetId });

  return res
    .status(200)
    .json(new ApiResponse(200, [], "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
