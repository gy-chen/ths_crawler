const path = require("path");
const fs = require("fs");
const {
  extractLectures,
  extractLectureDetail,
} = require("../src/server/crawlers");
const { expect } = require("@jest/globals");

test("test extractLectures", () => {
  const EXPECT_SAMPLE_LECTURES_LENGTH = 190;
  const sampleCoursePage = getSampleCoursePage();
  const lectureInfos = extractLectures(sampleCoursePage);
  expect(lectureInfos).toHaveLength(EXPECT_SAMPLE_LECTURES_LENGTH);
});

test("test extractLectureDetail", async () => {
  const EXPECT_SAMPLE_ITEMS_LENGTH = 4;
  const sampleLessonPage = getSampleLessonPage();
  const items = await extractLectureDetail(sampleLessonPage);
  expect(items.title).toBeTruthy();
  expect(items.attachments).toHaveLength(EXPECT_SAMPLE_ITEMS_LENGTH);
});

const getSampleFile = (filename) => {
  const sampleCoursePagePath = path.resolve(__dirname, `../sample/${filename}`);
  return fs.readFileSync(sampleCoursePagePath);
};

const getSampleCoursePage = () => {
  return getSampleFile("demoCoursePage.html");
};

const getSampleLessonPage = () => {
  return getSampleFile("demoLessonPage.html");
};
