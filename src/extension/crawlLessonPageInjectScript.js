import {
  getDocumentHTML,
  getPageHtml,
  extractLectureInfos,
  downloadLecture,
} from "./crawlUtilsForExtension";

const main = async () => {
  const documentHTML = getDocumentHTML();
  const lectureInfos = await extractLectureInfos(documentHTML);
  for (let info of lectureInfos) {
    const lectureHTML = await getPageHtml(info.href);
    await downloadLecture(lectureHTML);
  }
};

main();
