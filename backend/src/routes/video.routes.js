import { Router } from "express";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";

const videoRouter = Router();

videoRouter.route("/get-all-videos").get(JWTVerify, getAllVideos);
videoRouter.route("/publish-video").post(
    JWTVerify,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishAVideo
);
videoRouter.route("/get-video-by-id/:videoId").get(JWTVerify, getVideoById);

export default videoRouter;
