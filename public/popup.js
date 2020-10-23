"use strict";

const crawlButton = document.getElementById("btn-crawl");

crawlButton.onclick = function () {
  chrome.tabs.executeScript({
    file: "dist/crawlLessonPageInjectScript.js",
  });
};
