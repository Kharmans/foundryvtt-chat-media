import MediaPopout from "../share-media/MediaPopout";
import { find, on } from "../utils/JqueryWrappers";

export const initChatMessage = (html: JQuery) => {
	const images = find(".chat-media-image img", html);
	if (images[0]) {
		const clickImageHandle = (evt: Event) => {
			
			const src = <any>evt.target?.dataset?.src ? evt.target.dataset.src : evt.target.src;
			new ImagePopout(src, { editable: false, shareable: true }).render(true);
		};
		on(images, "click", clickImageHandle);
	}
	const videos = find(".chat-media-image video", html);
	if (videos[0]) {
		const clickImageHandle = (evt: Event) => {
			
			const src = <any>evt.target?.dataset?.src ? evt.target.dataset.src : evt.target.src;
			new MediaPopout(src, { editable: false, shareable: true }).render(true);
		};
		on(videos, "click", clickImageHandle);
	}
};
