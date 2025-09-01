gopeed.events.onResolve(async (ctx) => {
  global.__gopeed_setFingerprint('chrome');
  const res = await fetch(ctx.req.url);
  const html = await res.text();

  const videoMatch = html.match(/videoPageInfos\s+=\s+(\[.*\]);\nwindow\.__videoPageInfos\s=\svideoPageInfos/s);
  if (!videoMatch) {
    throw new MessageError('没有获取到视频信息');
  }
  const videoInfos = eval(videoMatch[1]);

  gopeed.logger.debug('videoInfos', JSON.stringify(videoInfos));

  const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"\s*\/?>/i);
  const title = titleMatch ? titleMatch[1] : '公众号视频';

  gopeed.logger.debug('title', title);

  ctx.res = {
    name: title,
    files: videoInfos.map(
      /**
       * @returns {import("@gopeed/types").FileInfo}
       */
      (info, index) => {
        const video = info.mp_video_trans_info[0];
        return {
          name: `${title}_${index + 1}.mp4`,
          size: video.filesize,
          req: {
            url:
              video.url.replace('http://', 'https://').replaceAll('&amp;', '&') +
              `&vid=${info.video_id}&format_id=${video.format_id}&support_redirect=0&mmversion=false`,
            extra: {
              header: {
                Referer: 'https://mp.weixin.qq.com/',
              },
            },
          },
        };
      }
    ),
  };
});
