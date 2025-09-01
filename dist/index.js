/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
gopeed.events.onResolve(async function (ctx) {
  global.__gopeed_setFingerprint('chrome');
  var res = await fetch(ctx.req.url);
  var html = await res.text();
  var videoMatch = html.match(/videoPageInfos\s+=\s+(\[[^]*\]);\nwindow\.__videoPageInfos\s=\svideoPageInfos/);
  if (!videoMatch) {
    throw new MessageError('没有获取到视频信息');
  }
  var videoInfos = eval(videoMatch[1]);
  gopeed.logger.debug('videoInfos', JSON.stringify(videoInfos));
  var titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"\s*\/?>/i);
  var title = titleMatch ? titleMatch[1] : '公众号视频';
  gopeed.logger.debug('title', title);
  ctx.res = {
    name: title,
    files: videoInfos.map(
    /**
     * @returns {import("@gopeed/types").FileInfo}
     */
    function (info, index) {
      var video = info.mp_video_trans_info[0];
      return {
        name: "".concat(title, "_").concat(index + 1, ".mp4"),
        size: video.filesize,
        req: {
          url: video.url.replace('http://', 'https://').replaceAll('&amp;', '&') + "&vid=".concat(info.video_id, "&format_id=").concat(video.format_id, "&support_redirect=0&mmversion=false"),
          extra: {
            header: {
              Referer: 'https://mp.weixin.qq.com/'
            }
          }
        }
      };
    })
  };
});
/******/ })()
;