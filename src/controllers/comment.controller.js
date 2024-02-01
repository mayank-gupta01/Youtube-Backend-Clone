import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const isVideoExisted = await Video.findById(videoId);
  if (!isVideoExisted) {
    throw new ApiError(400, "Video is not exist for given Video ID");
  }

  const getAllComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        username: {
          $arrayElemAt: ["$owner.userName", 0],
        },
        avatar: {
          $arrayElemAt: ["$owner.avatar", 0],
        },
      },
    },
    {
      $project: {
        content: 1,
        username: 1,
        avatar: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getAllComments,
        "All comments of video fetched successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  const isVideoExisted = await Video.findById(videoId);
  if (!isVideoExisted) {
    throw new ApiError(400, "Video is not exist for given Video ID");
  }
  if (content.trim() === "") {
    throw new ApiError(400, " content should be not empty");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  res
    .status(201)
    .json(new ApiResponse(201, comment, "comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (content.trim() === "") {
    throw new ApiError(400, " content should be not empty");
  }
  const existedComment = await Comment.findById(commentId);
  if (!existedComment) {
    throw new ApiError(400, "Comment not exist for given comment ID");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  res
    .status(201)
    .json(new ApiResponse(201, updatedComment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  const existedComment = await Comment.findById(commentId);
  if (!existedComment) {
    throw new ApiError(400, "Comment not exist for given comment ID");
  }
  await Comment.findByIdAndDelete(commentId);
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
