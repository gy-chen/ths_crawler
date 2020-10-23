const path = require("path");
const download = require("download");
const fs = require("fs");
const fsPromises = require("fs/promises");

const COLLECT_DIRECTORY =
  process.env["COLLECT_DIRECTORY"] || "./tomlinharmonicaschool";

const normalizeFileName = (name) =>
  name
    .replace(/\?/g, "")
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.trim())
    .filter((w) => w)
    .join(" ");

const isLectureDictoryExists = (lectureDetail) => {
  const lectureDirectoryPath = path.resolve(
    COLLECT_DIRECTORY,
    normalizeFileName(lectureDetail.title)
  );
  return fs.existsSync(lectureDirectoryPath);
};

const makeLectureDirectory = (lectureDetail) => {
  const lectureDirectoryPath = path.resolve(
    COLLECT_DIRECTORY,
    normalizeFileName(lectureDetail.title)
  );
  fs.mkdirSync(lectureDirectoryPath, { recursive: true });
  return lectureDirectoryPath;
};

const copyAttachment = async (attachment, directory) => {
  if (attachment.htmlContent) {
    const contentPath = path.resolve(directory, "index.html");
    await fsPromises.appendFile(contentPath, attachment.htmlContent);
  }
  if (attachment.files) {
    await Promise.all(
      attachment.files.map(async (file) => {
        const filePath = path.resolve(
          directory,
          normalizeFileName(file.file_name)
        );
        await fsPromises.writeFile(filePath, await download(file.file_url));
      })
    );
  }
};

module.exports = {
  isLectureDictoryExists,
  makeLectureDirectory,
  copyAttachment,
};
