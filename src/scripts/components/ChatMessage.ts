import MediaPopout from "../share-media/MediaPopout";
import { find, on } from "../utils/JqueryWrappers";

export const initChatMessage = (html: JQuery) => {
	const images = find(".chat-images-image img", html);
	if (images[0]) {
		const clickImageHandle = (evt: Event) => {
			const src = <any>(evt.target as HTMLImageElement).dataset.src;
			new ImagePopout(src, { editable: false, shareable: true }).render(true);
		};
		on(images, "click", clickImageHandle);
	}
	const videos = find(".chat-images-image video", html);
	if (videos[0]) {
		const clickImageHandle = (evt: Event) => {
			const src = <any>(evt.target as HTMLVideoElement).dataset.src;
			new MediaPopout(src, { editable: false, shareable: true }).render(true);
		};
		on(videos, "click", clickImageHandle);
	}
};
