import { before, create, find } from "../utils/JqueryWrappers";

const createUploadArea = (): JQuery => create(`<div id="chat-images--chat-upload-area" class="hidden"></div>`);

export const initUploadArea = (sidebar: JQuery) => {
	const chatControls: JQuery = find("#chat-controls", sidebar);
	const uploadArea: JQuery = createUploadArea();
	before(chatControls, uploadArea);
};
