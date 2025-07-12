import CONSTANTS from "../constants.js";
import { getVideoType, isVideo } from "../lib/lib.js";
import { getSetting } from "../utils/Settings.js";

/**
 * Extend the default Image Popout to handle videos
 */
const ImagePopoutImpl = foundry.applications?.apps?.ImagePopout || ImagePopout;

export default class MediaPopout extends ImagePopoutImpl {
  video;

  // Override PARTS to use our custom template
  static PARTS = {
    popout: {
      template: "modules/chat-media/templates/media-popout-dialog.hbs",
    },
  };

  constructor(src, options = {}) {
    const newOptions = {
      ...options,
      src: src,
    };
    super(newOptions);

    this.video = isVideo(src);
  }

  async _prepareContext(options) {
    let data = await super._prepareContext(options);

    data.isVideo = this.video;
    if (this.video) {
      data.video = data.image;

      // Use module settings for video behavior
      data.isLoop = getSetting("videoLoop");
      data.isMuted = getSetting("videoMuted");
      data.autoplay = getSetting("videoAutoplay");
      data.controls = getSetting("videoControls");

      data.videoType = getVideoType(data.video);
    }

    return data;
  }

  /**
   * Create a new Media Popout and display it
   */
  static _handleShareMedia(url, title = "", loop = false, mute = true) {
    const mediaPopout = new this(url, {
      title,
      shareable: false,
      editable: false,
    }).render(true);

    // Fix: force play after rendering
    if (mediaPopout.video) {
      setTimeout(() => {
        const video = mediaPopout.element.find("video")[0];
        video.loop = loop;
        video.muted = mute;
        video.onended = loop ? null : () => mediaPopout.close(true);
        video.play().catch((e) => {
          video.muted = true;
          video.play();
        });
      }, 250);
    }
  }
}
