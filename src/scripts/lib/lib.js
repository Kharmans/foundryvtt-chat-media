export function isVideo(imgSrc) {
  const re = /(?:\.([^.]+))?$/;
  const ext = re.exec(imgSrc)?.[1];
  return ext === "webm" || ext === "mp4";
}

export function getVideoType(imgSrc) {
  if (imgSrc.endsWith("webm")) {
    return "video/webm";
  } else if (imgSrc.endsWith("mp4")) {
    return "video/mp4";
  }
  return "video/mp4";
}
