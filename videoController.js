const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Set up multer storage for handling file uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// multer filter throws error if user upload file other than video.
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(new Error("File type is not supported. Please upload a video!"), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadVideoCon = upload.single("video");

exports.uploadVideo = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Video was successfully uploaded",
  });
};

exports.streamVideo = (req, res) => {
  const videoPath = path.join(__dirname, "uploads", req.params.filename);

  fs.stat(videoPath, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.sendStatus(404);
      }

      return res.sendStatus(500);
    }

    const { range } = req.headers;
    const fileSize = stats.size;
    const start = Number((range || "").replace(/bytes=/, "").split("-")[0]);
    const end = fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    const stream = fs.createReadStream(videoPath, { start, end });
    stream.on("open", () => stream.pipe(res));
    stream.on("error", (streamErr) => res.end(streamErr));
  });
};

exports.downloadVideo = (req, res) => {
  const videoPath = path.join(__dirname, "uploads", req.params.filename);

  res.download(videoPath);
};
