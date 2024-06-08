import { before, create, find } from "../utils/JqueryWrappers.js";

const createUploadArea = () => create(`<div id="chat-media-chat-upload-area" class="hidden"></div>`);

export const initUploadArea = (sidebar) => {
    const chatControls = find("#chat-controls", sidebar);
    const uploadArea = createUploadArea();
    before(chatControls, uploadArea);
};
