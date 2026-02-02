import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// Add playlist like also later when project is fully completed and tested - a good idea it is!
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const userId = req.user?._id;
    if (!videoId?.trim())
        throw new ApiError(400, "videoId cannot be left blank!");

    if (!mongoose.Types.ObjectId.isValid(videoId))
        throw new ApiError(400, "Invalid videoId passed!");

    let videoLikeStatus;

    const videoLike = await Like.findOneAndDelete({
        video: videoId,
        likedBy: userId,
    });

    if (!videoLike) {
        const doesVideoExist = await Video.exists({ _id: videoId });

        if (!doesVideoExist)
            throw new ApiError(404, "Video not found in the database!");

        const newVideoLike = await Like.create({
            video: videoId,
            likedBy: userId,
        });

        videoLikeStatus = true;

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { newVideoLike, videoLikeStatus },
                    "Toggled video like successfully!"
                )
            );
    }

    videoLikeStatus = false;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { videoLikeStatus },
                "Toggled video like successfully!"
            )
        );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const userId = req.user?._id;
    if (!commentId?.trim())
        throw new ApiError(400, "commentId cannot be left blank!");

    if (!mongoose.Types.ObjectId.isValid(commentId))
        throw new ApiError(400, "Invalid commentId passed!");

    let commentLikeStatus;

    const commentLike = await Like.findOneAndDelete({
        comment: commentId,
        likedBy: userId,
    });

    if (!commentLike) {
        const doesCommentExist = await Comment.exists({ _id: commentId });

        if (!doesCommentExist)
            throw new ApiError(404, "Comment not found in the database!");

        const newCommentLike = await Like.create({
            comment: commentId,
            likedBy: userId,
        });

        commentLikeStatus = true;

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { newCommentLike, commentLikeStatus },
                    "Toggled comment like successfully!"
                )
            );
    }
    commentLikeStatus = false;
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { commentLikeStatus },
                "Toggled comment like successfully!"
            )
        );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const userId = req.user?._id;
    if (!tweetId?.trim())
        throw new ApiError(400, "tweetId cannot be left blank!");

    if (!mongoose.Types.ObjectId.isValid(tweetId))
        throw new ApiError(400, "Invalid tweetId passed!");

    let tweetLikeStatus;

    const tweetLike = await Like.findOneAndDelete({
        tweet: tweetId,
        likedBy: userId,
    });

    if (!tweetLike) {
        const doesTweetExist = await Tweet.exists({ _id: tweetId });

        if (!doesTweetExist)
            throw new ApiError(404, "Tweet not found in the database!");

        const newTweetLike = await Like.create({
            tweet: tweetId,
            likedBy: userId,
        });

        tweetLikeStatus = true;

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { newTweetLike, tweetLikeStatus },
                    "Toggled tweet like successfully!"
                )
            );
    }
    tweetLikeStatus = false;
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { tweetLikeStatus },
                "Toggled tweet like successfully!"
            )
        );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id;
    // const likedVideos = await Like.find({
    //     likedBy: userId,
    //     video: { $exists: true, $ne: null },
    // })
    //     .populate("video", "title description owner")
    //     .populate("owner", "avatar.secure_url username");

    const likedVideos = await Like.aggregate([
        {
            $match: { likedBy: userId, video: { $exists: true, $ne: null } },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoData",
                pipeline: [
                    {
                        $project: {
                            owner: 1,
                            title: 1,
                            description: 1,
                            views: 1,
                            isPublished: 1,
                            createdAt: 1,
                            duration: 1,
                            thumbnail: "$thumbnail.secure_url",
                            videoFile: "$videoFile.secure_url",
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                video: { $first: "$videoData" },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "video.owner",
                foreignField: "_id",
                as: "ownerData",
                pipeline: [
                    {
                        $project: {
                            ownerUsername: "$username",
                            ownerAvatarURL: "$avatar.secure_url",
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: { $first: "$ownerData" },
            },
        },
        {
            $project: {
                title: "$video.title",
                description: "$video.description",
                thumbnail: "$video.thumbnail",
                videoFile: "$video.videoFile",
                duration: "$video.duration",
                views: "$video.views",
                createdAt: "$video.createdAt",
                videoOwnerUsername: "$owner.ownerUsername",
                videoOwnerAvatarURL: "$owner.ownerAvatarURL",
            },
        },
    ]);

    if (!likedVideos.length)
        throw new ApiError(404, "No videos liked by user!");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "Liked videos fetched successfully"
            )
        );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
