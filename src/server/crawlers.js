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

  const lectureInfos = $('.course-section a[href*="lectures"]')
    .map((_, el) => ({
      href: $(el).attr("href"),
      title: _prettifyLectureTitle($(el).text()),
    }))
    .get();
  return lectureInfos;
};

const extractLectureDetail = async (lecturePage, title) => {
  const $ = cheerio.load(lecturePage);

  const attachments = await Promise.all(
    $(".lecture-attachment")
      .map((_, n) => $(n).html())
      .get()
      .map(extractAttachmentInfo)
  );
  return {
    title: title || _prettifyLectureTitle($("#lecture_heading").text()),
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
    file_url: data["media"]["assets"][0]["url"],
    file_name: data["media"]["name"],
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
      file_url: $(n).attr("href"),
      file_name: $(n).data("x-origin-download-name"),
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
