import CONSTANTS from "../constants.js";
import { getVideoType } from "../lib/lib.js";

/**
 * Extend the default Image Popout to handle videos
 */
export default class MediaPopout extends ImagePopout {
	video: any;

	constructor(src, options = {}) {
		super(src, options);

		this.video = [".mp4", "webm"].includes(src.slice(-4).toLowerCase());
		this.options.template = `modules/${CONSTANTS.MODULE_NAME}/templates/media-popout-dialog.hbs`;
	}

	async getData(options) {
		let data = await super.getData();
		//@ts-ignore
		data.isVideo = this.video;
		if (this.video) {
			//@ts-ignore
			data.video = data.image;
			//@ts-ignore
			data.isLoop = true;
			//@ts-ignore
			data.isMuted = false;
			//@ts-ignore
			data.videoType = getVideoType(data.video);
		}

		return data;
	}

	/**
	 * Create a new Media Popout and display it
	 */
	static _handleShareMedia(url, title = "", loop = false, mute = true) {
		const mediaPopout = <any>new this(url, {
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
