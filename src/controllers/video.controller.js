import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "views",
    sortType,
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination
  //page : data of the no.of page
  //limit : limit of the data to every page
  //query : for fitering the data based on that query (like we do serach keyword on youtube)
  //sortBy : it is used to sort the data by any attribute(title, description, duration, views, updatedAt)
  //sortType : whether the sorted data should be asc or desc order
  //userId : this is id of user

  //if user doesn't specify anything then give all the videos available in the db
  //if user give query then match the text with the title
  //if user give sortBy then sort the data with that (default : views)
  //if user give sortType then sort by that type (default : desc)
  //if user specify userId then match the data for that userId

  const typeOfSort = sortType === "asc" ? 1 : -1;
  const aggregationPipeline = [
    {
      $match: {
        isPublished: true,
        $or: [
          {
            title: {
              $regex: query,
              $options: "i", // this make query case-insensitive
            },
          },
          {
            description: {
              $regex: query,
              $options: "i", // this make query case-insensitive
            },
          },
        ],
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
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        username: 1,
        avatar: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: {
        [sortBy]: typeOfSort,
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: page * limit },
  ];

  if (userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(400, "User not exist with given User ID");
    }
    aggregationPipeline.unshift({
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    });
  }

  const allVideos = await Video.aggregate(aggregationPipeline);

  res
    .status(200)
    .json(
      new ApiResponse(200, allVideos, "all videos are fetched successfully")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  //check is title and description validation
  //check video and thumbnail is exist or uploaded on local
  //get video from local and upload it into the cloudinary
  //check cloudinary uploaded the video and thumbnail successfully
  //extract video length from the cloudinary object and now create the document.

  if (!title || !description) {
    throw new ApiError(400, "Title and description is required");
  }
  if (title.trim() === "" || description.trim() === "") {
    throw new ApiError(
      400,
      "Title and description should have length greater then 0"
    );
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    throw new ApiError(400, "Error while uploading videoFile on cloudinary");
  }
  if (!thumbnail) {
    throw new ApiError(400, "Error while uploading thumbnail on cloudinary");
  }

  console.log(videoFile);
  const videoData = await Video.create({
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
    duration: videoFile.duration,
    owner: req.user?._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, videoData, "video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }
  //TODO: get video by id
  //validation for videoId
  //return the document for that videoId

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Given videoId doesn't exist");
  }

  const detailsOfVideo = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscriberCount",
            },
          },
          {
            $addFields: {
              subscribers: { $size: "$subscriberCount" },
            },
          },
          {
            $project: {
              userName: 1,
              subscribers: 1,
              avatar: 1,
            },
          },
        ],
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
        subscribers: {
          $arrayElemAt: ["$owner.subscribers", 0],
        },
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        username: 1,
        avatar: 1,
        subscribers: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, detailsOfVideo, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Given videoId doesn't exist");
  }

  if (!title || !description) {
    throw new ApiError(400, "Title, description is required");
  }

  if (title.trim() === "" || description.trim() === "") {
    throw new ApiError(400, "Title and description should have length > 0");
  }

  //check validation for thumbnail
  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(
      400,
      "Error while uploading the thumbnail on cloudinary"
    );
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail?.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Video data updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Given videoId doesn't exist");
  }

  await Video.deleteOne({ _id: videoId });

  return res
    .status(200)
    .json(new ApiResponse(200, [], "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Given videoId doesn't exist");
  }

  const isVideoPublished = video.isPublished;
  //if video is published then make it private
  //else video is private, make it public

  const videoData = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !isVideoPublished,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoData, "toggled publish status successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
