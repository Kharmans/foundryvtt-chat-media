import { on } from "../utils/JqueryWrappers.js";
import { getImageQueue, processDropAndPasteImages, removeAllFromQueue } from "../processors/FileProcessor.js";
import { i18n } from "../utils/Utils.js";
import { getUploadingStates } from "./Loader.js";

let hookIsHandlingTheMessage = false;
let eventIsHandlingTheMessage = false;

const imageTemplate = (imageProps) =>
    `<div class="chat-media-image">
  <img data-src="${imageProps.imageSrc}" src="${imageProps.imageSrc}" alt="${
      imageProps.name || i18n("unableToLoadImage")
  }" /></div>`;

const messageTemplate = (imageQueue) => {
    const imageTemplates = imageQueue.map((imageProps) => imageTemplate(imageProps));
    return `<div class="chat-media-message">${imageTemplates.join("")}</div>`;
};

export const preCreateChatMessageHandler = (sidebar) => (chatMessage, userOptions, messageOptions) => {
    if (eventIsHandlingTheMessage) return;

    hookIsHandlingTheMessage = true;
    const imageQueue = getImageQueue();
    if (!imageQueue.length) {
        hookIsHandlingTheMessage = false;
        return;
    }

    const uploadState = getUploadingStates(sidebar);
    uploadState.on();

    const content = `${messageTemplate(imageQueue)}<div class="chat-media-notes">${chatMessage.content}</div>`;

    chatMessage.content = content;
    chatMessage._source.content = content;
    messageOptions.chatBubble = false;

    removeAllFromQueue(sidebar);
    hookIsHandlingTheMessage = false;
    uploadState.off();
};

const emptyChatEventHandler = (sidebar) => async (evt) => {
    if (hookIsHandlingTheMessage || (evt.code !== "Enter" && evt.code !== "NumpadEnter") || evt.shiftKey) return;
    eventIsHandlingTheMessage = true;

    const uploadState = getUploadingStates(sidebar);
    const imageQueue = getImageQueue();
    if (!imageQueue.length) {
        eventIsHandlingTheMessage = false;
        return;
    }
    uploadState.on();

    const messageData = {
        content: messageTemplate(imageQueue),
        type: CONST.CHAT_MESSAGE_TYPES.OOC || 1,
        user: game.user,
    };
    await ChatMessage.create(messageData);
    removeAllFromQueue(sidebar);
    uploadState.off();
    eventIsHandlingTheMessage = false;
};

const pastAndDropEventHandler = (sidebar) => (evt) => {
    const originalEvent = evt.originalEvent;
    const eventData = originalEvent.clipboardData || originalEvent.dataTransfer;
    if (!eventData) return;

    processDropAndPasteImages(eventData, sidebar);
};

export const initChatSidebar = (sidebar) => {
    Hooks.on("preCreateChatMessage", preCreateChatMessageHandler(sidebar));

    // This should only run when there is nothing in the chat
    on(sidebar, "keyup", emptyChatEventHandler(sidebar));

    on(sidebar, "paste drop", pastAndDropEventHandler(sidebar));
};
