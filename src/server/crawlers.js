const cheerio = require("cheerio");
const fetch = require("node-fetch");

const _prettifyLectureTitle = (title) =>
  title
    .split(" ")
    .map((w) => w.trim())
    .filter((w) => w)
    .join(" ");

const extractLectures = (coursePage) => {
  const $ = cheerio.load(coursePage);

  const courseTitle = $(".course-sidebar h2").text();
  const lectureInfos = $(".course-section")
    .get()
    .flatMap((el, sectionIndex) => {
      const sectionTitle = _prettifyLectureTitle(
        $(".section-title", el).clone().children().remove().end().text()
      );
      return $('.section-list a[href*="lectures"]', el)
        .map((lectureIndex, el) => ({
          courseTitle,
          sectionNo: sectionIndex + 1,
          sectionTitle,
          lectureNo: lectureIndex + 1,
          lectureTitle: _prettifyLectureTitle($(el).text()),
          href: $(el).attr("href"),
        }))
        .get();
    });
  return lectureInfos;
};

const extractLectureDetail = async (
  lecturePage,
  courseTitle,
  lectureNo,
  lectureTitle,
  sectionNo,
  sectionTitle
) => {
  const $ = cheerio.load(lecturePage);

  const attachments = await Promise.all(
    $(".lecture-attachment")
      .map((_, n) => $(n).html())
      .get()
      .map(extractAttachmentInfo)
  );
  return {
    courseTitle,
    lectureNo,
    lectureTitle:
      lectureTitle || _prettifyLectureTitle($("#lecture_heading").text()),
    sectionNo,
    sectionTitle,
    attachments,
  };
};

const extractAttachmentInfo = (attachmentHTML) => {
  return [
    extractVideoAttachment,
    extractTextAttachment,
    extractHTMLAttachment,
    extractPDFAttachment,
    extractFileAttachment,
  ].reduce(
    async (v, f) => ({
      ...((await f(attachmentHTML)) || (await v)),
    }),
    {}
  );
};

const extractVideoAttachment = async (attachmentHTML) => {
  const $ = cheerio.load(attachmentHTML);

  const wistiaIds = $("*[data-wistia-id]")
    .map((_, n) => $(n).data("wistia-id"))
    .get();
  const files = await Promise.all(wistiaIds.map(getWistiaVideoDetail));
  return wistiaIds.length !== 0
    ? {
        files,
      }
    : null;
};

const getWistiaVideoDetail = async (wistiaId) => {
  const response = await fetch(
    `https://fast.wistia.com/embed/medias/${wistiaId}.json`
  );
  const data = await response.json();
  return {
    fileUrl: data["media"]["assets"][3]["url"],
    fileName: data["media"]["name"],
  };
};

const extractHTMLAttachment = (attachmentHTML) => {
  const $ = cheerio.load(attachmentHTML);

  const htmlContent = $(".lecture-text-container").html();

  return htmlContent
    ? {
        htmlContent,
      }
    : null;
};

const extractFileAttachment = (attachmentHTML) => {
  const $ = cheerio.load(attachmentHTML);

  const files = $(".download")
    .map((_, n) => ({
      fileUrl: $(n).attr("href"),
      fileName: $(n).data("x-origin-download-name"),
    }))
    .get();
  return files.length !== 0
    ? {
        files,
      }
    : null;
};

const extractTextAttachment = extractHTMLAttachment;
const extractPDFAttachment = extractFileAttachment;

module.exports = {
  extractLectures,
  extractLectureDetail,
};
