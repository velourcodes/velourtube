import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    // TODO: get all videos based on query, sort, pagination
    // NOTE: page & limit are strings from params and need int conversion to be used here in calcs
    let pageValue = parseInt(page);
    let limitValue = parseInt(limit);
    let filter = new Object();
    let normalizedSortType = sortType?.toLowerCase().trim();
    let sortOptions = new Object();

    if (userId && userId.trim()) {
        filter.owner = userId;
    }

    if (query && query?.trim()) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ];
    }

    // Incremental filter building implicitly handles the case when user provides both userId & query

    if (sortBy?.trim() && normalizedSortType) {
        const validSortFields = ["createdAt", "views", "duration"];

        if (validSortFields.includes(sortBy)) {
            if (normalizedSortType !== "asc" && normalizedSortType !== "desc") {
                normalizedSortType = "asc";
            }
            sortOptions[sortBy] = normalizedSortType === "asc" ? 1 : -1;
        }
    } else if (sortBy?.trim()) {
        const validSortFields = ["createdAt", "views", "duration"];
        if (validSortFields.includes(sortBy)) {
            sortOptions[sortBy] = -1;
        }
    } else if (normalizedSortType) {
        if (normalizedSortType === "asc") {
            sortOptions = { views: 1 };
        }
    } else {
        sortOptions = { views: -1 };
    }

    const totalMatchedVideoCount = await Video.countDocuments(filter);

    const totalPages = Math.ceil(totalMatchedVideoCount / limitValue);

    if (pageValue <= 0 || isNaN(pageValue)) pageValue = 1;
    if (limitValue <= 0 || limitValue >= 1000 || isNaN(limitValue))
        limitValue = 10;

    if (pageValue > totalPages) {
        throw new ApiError(400, "Out of range page requested!");
    }
    const currentPageVideos = await Video.find(filter)
        .sort(sortOptions)
        .skip((pageValue - 1) * limitValue)
        .limit(limitValue);

    if (!currentPageVideos.length) {
        throw new ApiError(404, "No videos found!");
    }

    const pagination = {
        currentPage: pageValue,
        perPage: limitValue,
        totalItems: totalMatchedVideoCount,
        totalPages: totalPages,
        hasPrevPage: pageValue > 1,
        hasNextPage: pageValue < totalPages,
    };
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { videos: currentPageVideos, pagination: pagination },
                "Videos fetched successfully"
            )
        );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    console.log("Req Files", req.files);
    const videoLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    const ownerId = new mongoose.Types.ObjectId(req.user?._id);

    if (!videoLocalPath?.trim())
        throw new ApiError(400, "Invalid path for video file!");

    const videoResponse = await uploadOnCloudinary(videoLocalPath);
    console.log("Video Object is:", videoResponse);
    if (!videoResponse.secure_url)
        throw new ApiError(500, "Video upload failed due to unexpected error!");

    if (!thumbnailLocalPath?.trim())
        throw new ApiError(400, "Invalid path for thumbnail file!");

    const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnailResponse.secure_url)
        throw new ApiError(
            500,
            "Thumbnail upload failed due to unexpected error!"
        );

    const video = await Video.create({
        title: title,
        thumbnail: {
            secure_url: thumbnailResponse.secure_url,
            public_id: thumbnailResponse.public_id,
        },
        videoFile: {
            secure_url: videoResponse.secure_url,
            public_id: videoResponse.public_id,
        },
        owner: ownerId,
        description: description,
        duration: videoResponse.duration,
    });

    const populatedVideoData = await Video.aggregate([
        {
            $match: { _id: video._id },
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
            $unwind: "$owner",
        },
        {
            $project: {
                videoFile: "$videoFile.secure_url",
                thumbnail: "$thumbnail.secure_url",
                title: 1,
                username: "$owner.username",
                owner_avatar_url: "$owner.avatar.secure_url",
                description: 1,
                duration: 1,
                views: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                201,
                populatedVideoData,
                "Video is published successfully"
            )
        );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    let video_id;
    if (mongoose.Types.ObjectId.isValid(videoId)) {
        video_id = new mongoose.Types.ObjectId(videoId);
    } else {
        throw new ApiError(400, "Invalid video id provided by user!");
    }

    const video = await Video.findById(video_id).select("-videoFile.public_id -thumbnail.public_id").populate("owner", "username avatar.secure_url");

    if(!video) throw new ApiError(404, "No video found with the provided ID in database!");

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched from videoId successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;
    
    //TODO: update video details like title, description, thumbnail
    // Not necessary that loggedin user is the owner of video they wish to modify
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
