import { before, create, find } from "../utils/JqueryWrappers.js";

const createUploadArea = () => create(`<div id="chat-media-chat-upload-area" class="hidden"></div>`);

export const initUploadArea = (sidebar) => {
    // Try to find chat-controls first (v12), fallback to placing before chat-message (v13)
    let chatControls = find("#chat-controls", sidebar);
    const uploadArea = createUploadArea();

    if (chatControls[0]) {
        before(chatControls, uploadArea);
    } else {
        // v13: place before the chat message textarea
        const chatMessage = find("#chat-message", sidebar);
        if (chatMessage[0]) {
            before(chatMessage, uploadArea);
        }
    }
};
