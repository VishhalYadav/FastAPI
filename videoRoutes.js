const express = require("express");

const videoController = require("./videoController");
const router = express.Router();

router.post("/", videoController.uploadVideoCon, videoController.uploadVideo);
router.get("/:filename", videoController.streamVideo);
router.get("/:filename/download", videoController.downloadVideo);

module.exports = router;
