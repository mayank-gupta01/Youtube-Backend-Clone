import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if (!(name && description)) {
    throw new ApiError(400, "name and description should be entered");
  }

  if (name.trim() === "" || description.trim() === "") {
    throw new ApiError(400, "name and description should contain some text");
  }

  const createdPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, createdPlaylist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  const existedUser = await User.findById(userId);
  if (!existedUser) {
    throw new ApiError(400, "User is not exist for given user ID");
  }

  const userPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $addFields: {
        videosCount: {
          $size: "$videos",
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videosCount: 1,
        updatedAt: 1,
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylists,
        "User's playlists fetched successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const existedPlaylist = await Playlist.findById(playlistId);
  if (!existedPlaylist) {
    throw new ApiError(400, "Playlist is not exist by given playlist ID");
  }

  const getPlaylist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "videoOwner",
              pipeline: [
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              thumbnail: 1,
              name: 1,
              description: 1,
              duration: 1,
              views: 1,
              isPublished: 1,
              videoOwner: 1,
              updatedAt: 1,
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
        pipeline: [
          {
            $project: {
              userName: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        videosCount: {
          $size: "$videos",
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videos: 1,
        owner: 1,
        updatedAt: 1,
        videosCount: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, getPlaylist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const existedPlaylist = await Playlist.findById(playlistId);
  if (!existedPlaylist) {
    throw new ApiError(400, "Playlist is not exist by given playlist ID");
  }
  const existedVideoId = await Video.findById(videoId);
  if (!existedVideoId) {
    throw new ApiError(400, "Video not exist by given video ID");
  }

  //what if already added
  const isVideoAlreadyAdded = existedPlaylist.videos.includes(videoId);
  if (isVideoAlreadyAdded) {
    throw new ApiError(400, "Video is already exist in this playlist");
  }
  const videoAdded = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, videoAdded, "Video added in playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  const existedPlaylist = await Playlist.findById(playlistId);
  if (!existedPlaylist) {
    throw new ApiError(400, "Playlist is not exist by given playlist ID");
  }
  const existedVideoId = await Video.findById(videoId);
  if (!existedVideoId) {
    throw new ApiError(400, "Video not exist by given video ID");
  }
  //check is videoId inside the videos in playlist
  //if yes then update it otherwise show error

  const isVideoAlreadyAdded = existedPlaylist.videos.includes(videoId);
  if (!isVideoAlreadyAdded) {
    throw new ApiError(400, "Video is not exist in this playlist");
  }

  const removedVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        removedVideo,
        "Video is removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  const existedPlaylist = await Playlist.findById(playlistId);
  if (!existedPlaylist) {
    throw new ApiError(400, "Playlist not exist with given playlist ID");
  }

  await Playlist.findByIdAndDelete(playlistId);

  res
    .status(200)
    .json(new ApiResponse(200, "", "Playlist is deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!(name && description)) {
    throw new ApiError(400, "name and description should be entered");
  }

  if (name.trim() === "" || description.trim() === "") {
    throw new ApiError(400, "name and description should contain some text");
  }

  const existedPlaylist = await Playlist.findById(playlistId);
  if (!existedPlaylist) {
    throw new ApiError(400, "Playlist not exist for given playlist ID");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
