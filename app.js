const express = require("express");
const videoRouter = require("./videoRoutes");

const app = express();

app.use("/videos", videoRouter);

module.exports = app;
