const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const { extractLectures, extractLectureDetail } = require("./crawlers");
const {
  isLectureDictoryExists,
  makeLectureDirectory,
  copyAttachment,
} = require("./collector");

app.use(
  cors({
    origin: "https://tomlinharmonicaschool.com",
  })
);
app.use(
  express.raw({
    type: "text/html",
    limit: "2mb",
  })
);
app.use(morgan("tiny"));

app.get("/_health", (_, res) => {
  res.status(204).send("");
});

app.post("/extractLectures", async (req, res) => {
  try {
    const coursePageHTML = req.body;
    const lectureInfos = await extractLectures(coursePageHTML);
    res.json(lectureInfos);
  } catch (e) {
    console.error(e);
    res.status(400).send("");
  }
});

app.post("/downloadLecture", async (req, res) => {
  const lecturePageHTML = req.body;
  const lectureDetail = await extractLectureDetail(lecturePageHTML);
  if (!isLectureDictoryExists(lectureDetail)) {
    console.log(`download lecture: ${lectureDetail.title}`);
    const directory = makeLectureDirectory(lectureDetail);
    await Promise.all(
      lectureDetail.attachments.map((attachment) =>
        copyAttachment(attachment, directory)
      )
    );
    console.log(`downloaded lecture: ${lectureDetail.title}`);
  }
  res.status(204).send("");
});

app.get("/_reload", (_, res) => {
  res.send("");
  process.send("reload");
});

module.exports = app;
