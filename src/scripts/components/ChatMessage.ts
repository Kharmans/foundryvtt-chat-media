import { find, on } from "../utils/JqueryWrappers";

export const initChatMessage = (html: JQuery) => {
	const images = find(".chat-images-image img", html);
	if (!images[0]) return;

	const clickImageHandle = (evt: Event) => {
		const src = (evt.target as HTMLImageElement).src;
		new ImagePopout(src, { editable: false, shareable: true }).render(true);
	};
	on(images, "click", clickImageHandle);
};
